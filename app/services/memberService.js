import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { memberValidator, pinValidator, loginValidator } from '../validation/userValidator';
import { identifierValidator } from '../validation/identifierValidator';
import Member from '../models/member';
import { logger } from '../../utils/logger';
import { sendBrevoEmail } from '../../lib/mail';
import { emailTemplates } from '../email';
import { compileEmailTemplate } from '../templates/compile-email-template';
import { mongoConnect } from '../../utils/connectDb';

mongoConnect();

const PIN_SALT_ROUNDS = 10;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const MEMBER_TOKEN_EXPIRY = '30d';

// NOTE: assumes a JWT_SECRET env var already exists (or is added) alongside
// whatever other secrets this project keeps — separate from any staff/User
// JWT secret if one exists, so a compromised member token can never be
// used to mint a staff session or vice versa.
const JWT_SECRET = process.env.MEMBER_JWT_SECRET;

class MemberAuthError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code; // 'INVALID_CREDENTIALS' | 'LOCKED' | 'NOT_FOUND'
  }
}

// ---------------------------------------------------------------------------
// Admin-facing CRUD (church dashboard "Members" page). Restored after being
// dropped when this file was refactored for mobile self-service auth below —
// app/api/member/route.js (and create/update/delete/verify routes) import
// these by name, so removing them 500'd the Members page.
//
// The one required adaptation: Member.pin (plaintext) was replaced on the
// schema by Member.pinHash (bcrypt, select:false) — see app/models/member.js.
// Anywhere the old code wrote a plaintext `pin`, it now writes a hashed
// `pinHash` instead so admin-created members can still authenticate via
// authenticateMember() below. verificationPin/verifyPin/sendVerificationCode
// (the email one-time-code flow) still reference the old `pin` field, which
// no longer exists on the schema — restored as-is (fails safe: Mongoose's
// strict schema silently drops the unknown field rather than corrupting
// pinHash), but that flow needs a real fix/decision before it's relied on
// again, e.g. its own verificationCode/verificationCodeExpiry fields.
// ---------------------------------------------------------------------------

const MEMBER_STATUS_ORDER = ['active', 'provisional', 'under discipline', 'inactive'];

const getEmptyMemberStatusCounts = () => ({
  all: 0,
  active: 0,
  provisional: 0,
  'under discipline': 0,
  inactive: 0
});

const buildMemberSearchFilter = (searchQuery) => {
  if (!searchQuery) {
    return {};
  }

  return {
    $or: [
      { first_name: { $regex: searchQuery, $options: 'i' } },
      { last_name: { $regex: searchQuery, $options: 'i' } },
      { mobile: { $regex: searchQuery, $options: 'i' } },
      { status: { $regex: searchQuery, $options: 'i' } },
      { email: { $regex: searchQuery, $options: 'i' } }
    ]
  };
};

const normalizeMemberAggregateQuery = (query = {}) => {
  if (!query.church) {
    return query;
  }

  if (query.church instanceof mongoose.Types.ObjectId) {
    return query;
  }

  return {
    ...query,
    church: new mongoose.Types.ObjectId(query.church)
  };
};

const getMemberStatusCounts = async (query) => {
  const statusCounts = getEmptyMemberStatusCounts();
  const data = await Member.aggregate([
    { $match: normalizeMemberAggregateQuery(query) },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  data.forEach((item) => {
    if (Object.prototype.hasOwnProperty.call(statusCounts, item._id)) {
      statusCounts[item._id] = item.count;
    }
  });

  statusCounts.all = MEMBER_STATUS_ORDER.reduce((total, status) => total + statusCounts[status], 0);

  return statusCounts;
};

async function getMembers({ suid, page = 1, limit = 10, sortField, sortOrder, searchQuery, status }) {
  const skip = (page - 1) * limit;

  try {
    const sortOptions = {};
    if (sortField) {
      sortOptions[sortField] = sortOrder === 'desc' ? -1 : 1;
    }

    const baseQuery = {
      church: suid,
      ...buildMemberSearchFilter(searchQuery)
    };
    const filteredQuery = status ? { ...baseQuery, status } : baseQuery;

    const [members, totalCount, statusCounts] = await Promise.all([
      Member.find(filteredQuery).sort(sortOptions).skip(skip).limit(limit).exec(),
      Member.countDocuments(filteredQuery),
      getMemberStatusCounts(baseQuery)
    ]);

    return {
      data: members,
      totalCount,
      aggregates: {
        total: statusCounts.all,
        active: statusCounts.active,
        provisional: statusCounts.provisional,
        underDiscipline: statusCounts['under discipline'],
        inactive: statusCounts.inactive
      },
      statusCounts
    };
  } catch (error) {
    logger.error(error);
    throw new Error('An unexpected error occurred. Please try again.');
  }
}

async function getMemberCount(suid) {
  try {
    const identifierValidateResult = identifierValidator(suid);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }
    const members = await Member.countDocuments({ church: suid });
    return members;
  } catch (error) {
    logger.error('Error getting member count:', error);
    throw new Error('An unexpected error occurred. Please try again.');
  }
}

function getMember(id) {
  try {
    const identifierValidateResult = identifierValidator(id);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }
    const result = Member.findOne({ _id: id });
    return result;
  } catch (error) {
    logger.error(error);
    throw new Error('An unexpected error occurred. Please try again.');
  }
}

async function addMember(suid, body) {
  try {
    const identifierValidateResult = identifierValidator(suid);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }

    const bodyErrors = memberValidator(body);
    if (bodyErrors.length) {
      const error = new Error(bodyErrors.map((it) => it.message).join(','));
      error.invalidArgs = bodyErrors.map((it) => it.field).join(',');
      throw error;
    }

    const newUser = await Member.create({
      church: suid,
      // Default PIN for admin-created members, hashed the same way as
      // self-service registration (Member.pin was removed from the schema
      // in favour of Member.pinHash — see app/models/member.js).
      pinHash: await bcrypt.hash('1234', PIN_SALT_ROUNDS),
      role: 'member',
      ...body
    });

    if (!newUser) {
      throw new Error('create new member failed');
    }

    return newUser;
  } catch (error) {
    logger.error(error);
    if (error.code === 11000) {
      throw new Error('This email address is already registered.');
    } else {
      throw new Error('An unexpected error occurred. Please try again.');
    }
  }
}

async function addMemberManual(body) {
  const { suid } = body;
  try {
    const identifierValidateResult = identifierValidator(suid);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }

    const bodyErrors = memberValidator(body);
    if (bodyErrors.length) {
      const error = new Error(bodyErrors.map((it) => it.message).join(','));
      error.invalidArgs = bodyErrors.map((it) => it.field).join(',');
      throw error;
    }

    const newUser = await Member.create({
      church: suid,
      pinHash: await bcrypt.hash('1234', PIN_SALT_ROUNDS),
      role: 'member',
      ...body
    });

    if (!newUser) {
      throw new Error('create new member failed');
    }

    return newUser;
  } catch (error) {
    logger.error(error);
    if (error.code === 11000) {
      throw new Error('This email address is already registered.');
    } else {
      throw new Error('An unexpected error occurred. Please try again.');
    }
  }
}

async function updateMember(id, body) {
  try {
    const identifierValidateResult = identifierValidator(id);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }

    const bodyErrors = memberValidator(body);
    if (bodyErrors.length) {
      const error = new Error(bodyErrors.map((it) => it.message).join(','));
      error.invalidArgs = bodyErrors.map((it) => it.field).join(',');
      throw error;
    }

    const updatedMember = await Member.findByIdAndUpdate(id, body, {
      new: true
    });

    if (!updatedMember) {
      throw new Error('Member not found or update failed');
    }

    return true;
  } catch (error) {
    logger.error(error);
    throw new Error('An unexpected error occurred. Please try again.');
  }
}

// ---------------------------------------------------------------------------
// Admin "forgot PIN" recovery — church dashboard Members page look up the
// member, then set a new PIN on their behalf. Deliberately a separate
// function from updateMember() above: that one forwards `body` straight to
// Member.findByIdAndUpdate(), which can't write a hashed PIN (the schema
// only has `pinHash`, not `pin` — see app/models/member.js — so a plaintext
// `pin` in the body would just be silently dropped by Mongoose's strict
// schema, same trap documented on verificationPin() above). This hashes
// with the same bcrypt/PIN_SALT_ROUNDS treatment as self-service
// registration, and also clears any lockout so a member who was locked out
// right before asking an admin for help isn't still locked out after.
async function resetMemberPin(id, pin) {
  try {
    const identifierValidateResult = identifierValidator(id);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }

    if (!/^\d{4,6}$/.test(String(pin ?? ''))) {
      const error = new Error('PIN must be 4 to 6 digits.');
      error.invalidArgs = 'pin';
      throw error;
    }

    const pinHash = await bcrypt.hash(String(pin), PIN_SALT_ROUNDS);

    // Mixing plain fields with a $unset at the top level of an update
    // document isn't valid MongoDB syntax once any $ operator is present —
    // pinHash/loginAttempts have to go under their own $set alongside it.
    const updatedMember = await Member.findByIdAndUpdate(
      id,
      {
        $set: { pinHash, loginAttempts: 0 },
        $unset: { lockedUntil: 1 }
      },
      { new: true }
    );

    if (!updatedMember) {
      throw new Error('Member not found or update failed');
    }

    return true;
  } catch (error) {
    logger.error(error);
    throw new Error(error.message || 'An unexpected error occurred. Please try again.');
  }
}

async function removeMember(suid, id) {
  try {
    const identifierValidateResult = identifierValidator(id);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }

    await Member.findOneAndDelete({ _id: id, church: suid });
    return true;
  } catch (error) {
    logger.error(error);
    throw new Error('An unexpected error occurred. Please try again.');
  }
}

const getRecentMembers = async (suid, limit = 10) => {
  try {
    const recentMembers = await Member.find({ church: suid }).sort({ createdAt: -1 }).limit(limit);
    return recentMembers;
  } catch (error) {
    logger.error(error);
    throw new Error('Error fetching recent members. Please try again.');
  }
};

const aggregateMemberByRole = async (church) => {
  try {
    const statusCounts = await getMemberStatusCounts({ church: new mongoose.Types.ObjectId(church) });
    const data = MEMBER_STATUS_ORDER.map((status) => ({
      role: status,
      count: statusCounts[status] || 0
    }));

    return data;
  } catch (error) {
    console.error(error);
    throw new Error('Error aggregating user data. Please try again.');
  }
};

// ---------------------------------------------------------------------------
// Legacy email one-time-code verification flow. Restored verbatim from
// before the mobile self-service refactor. NOTE: this still reads/writes
// Member.pin, which no longer exists on the schema (replaced by pinHash —
// see app/models/member.js and the block comment above). Mongoose's strict
// schema mode means member.pin = code; member.save() silently does not
// persist that field, so this flow will run without throwing but will never
// actually succeed (verificationPin() will always see an undefined pin and
// reject the code). Left in place, not repurposed onto pinHash, because
// doing so would mean every "resend code" email silently overwrites the
// member's real login PIN with the emailed one-time code — a real change in
// login behaviour, not something to decide implicitly here. This needs its
// own verificationCode/verificationCodeExpiry fields (or an equivalent) as a
// follow-up before it's relied on again.
// ---------------------------------------------------------------------------

async function verificationPin(email, pin) {
  try {
    const validateResult = pinValidator({ email, pin });
    if (validateResult.length) {
      const error = new Error(validateResult.map((it) => it.message).join(','));
      error.invalidArgs = validateResult.map((it) => it.field).join(',');
      throw error;
    }

    const member = await Member.findOne({ email: new RegExp(email, 'i') });

    if (!member) {
      throw new Error('No Member found with this credentials.');
    }

    if (member.pin !== pin) {
      throw new Error('Invalid code');
    }

    await member.save();

    return member;
  } catch (error) {
    logger.error(error);
    throw new Error(error.message);
  }
}

async function verifyPin(email) {
  const validateResult = loginValidator({ email });
  if (validateResult.length) {
    const error = new Error(validateResult.map((it) => it.message).join(','));
    error.invalidArgs = validateResult.map((it) => it.field).join(',');
    throw error;
  }

  const member = await Member.findOne({ email: new RegExp(email, 'i') });
  if (!member) {
    throw new Error('No Member found with this login credentials.');
  }

  await sendVerificationCode(member);
  return true;
}

async function sendVerificationCode(member) {
  try {
    const code = Math.floor(1000 + Math.random() * 9000);
    member.pin = code;
    await member.save();

    const { first_name, last_name, email } = member;

    const template = await compileEmailTemplate(
      emailTemplates.codeVerification({
        name: `${first_name} ${last_name}`,
        code: code,
        contact_email: process.env.CONTACT_EMAIL,
        team: process.env.TEAM
      })
    );

    const mailOptions = {
      sender: { email: process.env.USER_NAME, name: process.env.TEAM || 'Jerur' },
      to: [{ email }],
      subject: 'Your code verification',
      textContent: template,
      htmlContent: template
    };

    await sendBrevoEmail(mailOptions);
    return true;
  } catch (error) {
    logger.error(error);
    throw new Error('An unexpected error occurred. Please try again.');
  }
}

// ---------------------------------------------------------------------------
// Mobile self-service auth (member/register, member/login).
// ---------------------------------------------------------------------------

export async function registerMember({ church, first_name, last_name, mobile, email, pin }) {
  if (!first_name || !last_name || !pin) {
    throw new Error('first_name, last_name, and pin are required.');
  }
  if (!mobile && !email) {
    throw new Error('Either mobile or email is required.');
  }
  if (!/^\d{4,6}$/.test(String(pin))) {
    throw new Error('PIN must be 4 to 6 digits.');
  }

  const normalizedEmail = email ? email.trim().toLowerCase() : undefined;

  // The `members` collection has a *global* unique index on `email`
  // (db-level, not declared unique on the Mongoose schema — see
  // app/models/member.js — and not scoped to `church`), so this
  // pre-check has to match that exact scope: an email already used at
  // ANY church, not just this one, would otherwise sail past a
  // church-scoped check and only fail as a raw E11000 duplicate-key
  // error out of Member.create() below. Comparison is against the
  // already-lowercased stored value, so this is effectively
  // case-insensitive without needing a regex query.
  if (normalizedEmail) {
    const existingEmail = await Member.findOne({ email: normalizedEmail });
    if (existingEmail) {
      throw new MemberAuthError('EMAIL_EXISTS', 'An account already exists with this email address. Please log in instead.');
    }
  }

  // Mobile carries no db-level uniqueness constraint — this is a soft,
  // per-church business rule only (the same phone number is allowed to
  // belong to different members at different churches), unlike email.
  if (mobile) {
    const existingMobile = await Member.findOne({ church, mobile });
    if (existingMobile) {
      throw new MemberAuthError('MOBILE_EXISTS', 'An account already exists with this phone number. Please log in instead.');
    }
  }

  const pinHash = await bcrypt.hash(String(pin), PIN_SALT_ROUNDS);

  try {
    const member = await Member.create({
      church,
      first_name,
      last_name,
      mobile: mobile ?? '',
      email: normalizedEmail,
      pinHash,
      // Self-registered members start as "provisional" — matches the
      // existing status enum's intent (an actual church staff member
      // presumably promotes to "active" once they know who this is).
      // Never let self-registration set role above "member".
      status: 'provisional',
      role: 'member'
    });

    return member;
  } catch (error) {
    // Final safety net for the TOCTOU race the pre-check above can't
    // close on its own: two concurrent requests for the same email can
    // both pass the findOne check before either has committed. The
    // database's own unique index is the real source of truth here —
    // this just guarantees that failure reaches the client as the same
    // friendly EMAIL_EXISTS response, never as a raw Mongo exception
    // ("E11000 duplicate key error collection: ... index: email_1 ...").
    if (error?.code === 11000) {
      throw new MemberAuthError('EMAIL_EXISTS', 'An account already exists with this email address. Please log in instead.');
    }
    throw error;
  }
}

/**
 * Looks up a member by (church + mobile-or-email) and verifies their PIN,
 * with per-account lockout after MAX_LOGIN_ATTEMPTS failures.
 *
 * KNOWN LIMITATION: lockout is tracked on the Member document itself, so it
 * only kicks in once a matching record is found. An attacker hammering PINs
 * against a phone/email that doesn't exist at all isn't rate-limited by
 * this alone — that needs IP-based rate limiting at the edge (middleware or
 * a proxy), which is a separate piece of infra this doesn't attempt to add.
 */
export async function authenticateMember({ church, identifier, pin }) {
  const member = await Member.findOne({
    church,
    $or: [{ mobile: identifier }, { email: identifier.toLowerCase() }]
  }).select('+pinHash');

  if (!member) {
    throw new MemberAuthError('NOT_FOUND', 'No member found with that phone or email.');
  }

  // Blocked regardless of PIN correctness — an inactive member (see
  // Member.status in app/models/member.js) shouldn't be able to log in at
  // all until church staff reactivates them, so this short-circuits before
  // the lockout/PIN checks below rather than after a failed PIN attempt.
  if (member.status === 'inactive') {
    throw new MemberAuthError('INACTIVE', 'Your account is inactive. Please contact your church for help.');
  }

  if (member.lockedUntil && member.lockedUntil > new Date()) {
    const minutesLeft = Math.ceil((member.lockedUntil - new Date()) / 60000);
    throw new MemberAuthError('LOCKED', `Too many attempts. Try again in ${minutesLeft} minute(s).`);
  }

  const isValid = member.pinHash && (await bcrypt.compare(String(pin), member.pinHash));

  if (!isValid) {
    member.loginAttempts = (member.loginAttempts ?? 0) + 1;
    if (member.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
      member.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
      member.loginAttempts = 0;
    }
    await member.save();
    throw new MemberAuthError('INVALID_CREDENTIALS', 'Incorrect PIN.');
  }

  member.loginAttempts = 0;
  member.lockedUntil = undefined;
  await member.save();

  return member;
}

/**
 * Self-service "forgot PIN" — the mobile counterpart to admin's
 * resetMemberPin() above, deliberately less restrictive: no old PIN, no
 * admin, no OTP step. Proving you own the phone/email on file is the only
 * gate, same trust level the rest of this member auth already runs on (see
 * authenticateMember() above — anyone who knows the identifier + PIN gets
 * in; this just lets them replace a forgotten PIN with the identifier
 * alone). Deliberately does NOT touch loginAttempts on a wrong identifier —
 * unlike a failed PIN guess, there's no PIN attempt happening here to
 * penalize.
 */
export async function forgotPin({ church, identifier, pin }) {
  if (!identifier) {
    throw new MemberAuthError('INVALID_CREDENTIALS', 'Enter your phone or email.');
  }
  if (!/^\d{4,6}$/.test(String(pin ?? ''))) {
    throw new MemberAuthError('INVALID_CREDENTIALS', 'PIN must be 4 to 6 digits.');
  }

  const member = await Member.findOne({
    church,
    $or: [{ mobile: identifier }, { email: identifier.toLowerCase() }]
  });

  if (!member) {
    throw new MemberAuthError('NOT_FOUND', 'No member found with that phone or email.');
  }

  // An inactive member is blocked from logging in at all (see
  // authenticateMember() above) — letting them reset their PIN here would
  // just hand them a back door around that block, so it applies here too.
  if (member.status === 'inactive') {
    throw new MemberAuthError('INACTIVE', 'Your account is inactive. Please contact your church for help.');
  }

  member.pinHash = await bcrypt.hash(String(pin), PIN_SALT_ROUNDS);
  member.loginAttempts = 0;
  member.lockedUntil = undefined;
  await member.save();

  return member;
}

export function generateMemberToken(member) {
  return jwt.sign(
    { memberId: member._id.toString(), church: member.church.toString(), type: 'member' },
    JWT_SECRET,
    { expiresIn: MEMBER_TOKEN_EXPIRY }
  );
}

export function verifyMemberToken(token) {
  const payload = jwt.verify(token, JWT_SECRET);
  if (payload.type !== 'member') {
    throw new Error('Invalid token type.');
  }
  return payload; // { memberId, church }
}

export {
  MemberAuthError,
  aggregateMemberByRole,
  getMembers,
  removeMember,
  updateMember,
  resetMemberPin,
  getMember,
  verificationPin,
  addMember,
  verifyPin,
  getMemberCount,
  addMemberManual,
  getRecentMembers
};
