import { addressValidator } from '../validation/addressValidator';
import { identifierValidator } from '../validation/identifierValidator';
import { logger } from '../../utils/logger';
import Church from '../models/church';
import { mongoConnect } from '../../utils/connectDb';

mongoConnect();

const add = async (suid, body) => {
  try {

     const identifierValidateResult = identifierValidator(suid);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }

    const bodyErrors = addressValidator(body);
    if (bodyErrors.length) {
      const error = new Error(bodyErrors.map((it) => it.message).join(','));
      error.invalidArgs = bodyErrors.map((it) => it.field).join(',');
      throw error;
    }

    await Church.findOneAndUpdate(
      {
        _id: suid,
        address: { $exists: false }
      },
      {
        $set: { address : body}
      },
      { new: true }
    ).lean();

    return true;
  } catch (error) {
    console.error(error);
    throw new Error('Error adding church address');
  }
};

const update = async (suid, body) => {
  try {
    const identifierValidateResult = identifierValidator(suid);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }

    const bodyErrors = addressValidator(body);
    if (bodyErrors.length) {
      const error = new Error(bodyErrors.map((it) => it.message).join(','));
      error.invalidArgs = bodyErrors.map((it) => it.field).join(',');
      throw error;
    }
     const setPayload = {};

    Object.keys(body).forEach((key) => {
      setPayload[`address.${key}`] = body[key];
    });

    await Church.findByIdAndUpdate(
      suid,
      { $set: setPayload },
      { new: true }
    ).lean();

    return true;
  } catch (error) {
    logger.error(error);
    throw new Error('Error updating church address');
  }
};


export { add, update };
