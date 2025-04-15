import jwt from 'jsonwebtoken';
import mongoose from 'mongoose'
import { memberValidator, pinValidator, loginValidator } from '../validation/userValidator';
import { identifierValidator } from '../validation/identifierValidator';
import Member from '../models/member';
import { logger } from '../../utils/logger';
import { sendEmail } from '../../lib/mail';
import { emailTemplates } from '../email';
import { compileEmailTemplate } from '../templates/compile-email-template';
import { mongoConnect } from '@/utils/connectDb';

mongoConnect();

const generateToken = (currentUser, expiresIn) => {
  const { _id, email, first_name, last_name, mobile, role, user_status } = currentUser;

  const token = jwt.sign(
    {
      userId: _id,
      email,
      first_name,
      mobile,
      last_name,
      role,
      suid: currentUser.church._id
    },
    process.env.JWT_SECRET,
    {
      expiresIn
    }
  );

  const member = {
    _id,
    church: currentUser.church._id,
    email,
    first_name,
    mobile,
    last_name,
    role,
    user_status
  };
  return { token, member };
};

async function getMembers({ suid, page = 1, limit = 10, sortField, sortOrder, searchQuery }) {
  const skip = (page - 1) * limit;

  try {
    const sortOptions = {};
    if (sortField) {
      sortOptions[sortField] = sortOrder === 'desc' ? -1 : 1;
    }

    const searchFilter = searchQuery
      ? {
          $or: [
            { first_name: { $regex: searchQuery, $options: 'i' } },
            { last_name: { $regex: searchQuery, $options: 'i' } },
            { mobile: { $regex: searchQuery, $options: 'i' } },
            { status: { $regex: searchQuery, $options: 'i' } },
            { email: { $regex: searchQuery, $options: 'i' } },
          ]
        }
      : {};

    const query = {
      church:suid,
      ...searchFilter
    };

    const [members, totalCount] = await Promise.all([
      Member.find(query).sort(sortOptions).skip(skip).limit(limit).exec(),
      Member.countDocuments({church:suid})
    ]);

    return {
      data: members,
      totalCount
    };
  } catch (error) {
    logger.error(error);
    throw new Error('An unexpected error occurred. Please try again.');
  }
}

async function getMemberCount( suid ) {
  try {
    const identifierValidateResult = identifierValidator(suid);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }
    const members = await Member.countDocuments({church:suid})
    return members?.length ;
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
      pin: 1234,
      role: 'member',
      ...body
    });

    if (!newUser) {
      throw new Error('create new member failed');
    }

    const token = generateToken(newUser, process.env.DURATION);
    return token;
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
      pin: 1234,
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
async function verificationPin( email, pin ) {
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

    const token = generateToken(member, '30m');
    return token;
  } catch (error) {
    logger.error(error);
    throw new Error(error.message);
  }
}
async function verifyPin( email ) {
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
      from: process.env.USER_NAME,
      to: `${email}`,
      subject: 'Your code verification',
      text: 'Your code verification',
      html: template
    };

    sendEmail(mailOptions);
    return true;
  } catch (error) {
    logger.error(error);
    throw new Error('An unexpected error occurred. Please try again.');
  }
}
async function removeMember( suid , id) {
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

const getRecentMembers = async (id, limit = 10) => {
  try {
    const recentMembers = await Member.find({ }).sort({ createdAt: -1 }).limit(limit);
    return recentMembers;
  } catch (error) {
    logger.error(error);
    throw new Error('Error fetching recent members. Please try again.');
  }
};

const aggregateMemberByRole = async (church) => {
  try {
    const data = await Member.aggregate([
      { $match: { church: new mongoose.Types.ObjectId(church) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          role: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);

    return data;
  } catch (error) {
    console.error(error);
    throw new Error('Error aggregating user data. Please try again.');
  }
};

export {
  aggregateMemberByRole,
  getMembers,
  removeMember,
  updateMember,
  getMember,
  verificationPin,
  addMember,
  verifyPin,
  getMemberCount,
  addMemberManual,
  getRecentMembers
};
