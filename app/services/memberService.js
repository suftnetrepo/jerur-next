import jwt from 'jsonwebtoken';
import { memberValidator, pinValidator, loginValidator } from '../validation/userValidator';
import { identifierValidator } from '../validation/identifierValidator';
import Member from '../models';
import { config } from '../configs';
import { logger } from '../../utils/logger';
import { sendGridMail } from '../lib/mail';
import { compileEmailTemplate } from '../util/compile-email-template';
import { sendVerificationCode } from './pushNotificationService';

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
    config.JWT_SECRET,
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
function getMembers({ suid }) {
  try {
    const identifierValidateResult = identifierValidator(suid);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }
    return Member.find({ church: suid }).sort({ createdAt: -1 });
  } catch (error) {
    logger.error(error);
    throw new Error('An unexpected error occurred. Please try again.');
  }
}
async function getMemberCount({ suid }) {
  try {
    const identifierValidateResult = identifierValidator(suid);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }
    const members = await Member.find({ church: suid });
    const activeCount = members.filter((member) => member.user_status)?.length;
    const noneActiveCount = members?.length - activeCount;

    return { activeCount, noneActiveCount };
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
async function createMember(body) {
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
      throw new ApolloError('create new member failed');
    }

    const token = generateToken(newUser, config.DURATION);
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
async function createMemberManual(body) {
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
      throw new ApolloError('create new member failed');
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
async function updateMember(body) {
  const { _id } = body;
  try {
    const identifierValidateResult = identifierValidator(_id);
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

    const updatedMember = await Member.findByIdAndUpdate(_id, body, {
      new: true
    });

    if (!updatedMember) {
      throw new ApolloError('Member not found or update failed');
    }

    return true;
  } catch (error) {
    logger.error(error);
    throw new Error('An unexpected error occurred. Please try again.');
  }
}
async function verificationPin({ email, pin }) {
  try {
    const validateResult = pinValidator({ email, pin });
    if (validateResult.length) {
      const error = new Error(validateResult.map((it) => it.message).join(','));
      error.invalidArgs = validateResult.map((it) => it.field).join(',');
      throw error;
    }

    const member = await Member.findOne({ email: new RegExp(email, 'i') });

    if (!member) {
      throw new UserInputError('No Member found with this credentials.');
    }

    if (member.pin !== pin) {
      throw new UserInputError('Invalid code');
    }

    await member.save();

    const token = generateToken(member, config.DURATION);
    return token;
  } catch (error) {
    logger.error(error);
    throw new Error(error.message);
  }
}
async function verifyPin({ email }) {
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

    const template = await compileEmailTemplate({
      fileName: 'codeVerification.mjml',
      data: {
        name: `${first_name} ${last_name}`,
        code,
        contact_email: process.env.CONTACT_EMAIL,
        team: process.env.TEAM
      }
    });

    const mailOptions = {
      from: process.env.USER_NAME,
      to: `${email}`,
      subject: 'Your code verification',
      text: 'Your code verification',
      html: template
    };

    sendGridMail(mailOptions);
    return true;
  } catch (error) {
    logger.error(error);
    throw new Error('An unexpected error occurred. Please try again.');
  }
}
async function removeMember({ suid }, id) {
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

export {
  getMembers,
  removeMember,
  updateMember,
  getMember,
  verificationPin,
  createMember,
  verifyPin,
  getMemberCount,
  createMemberManual
};
