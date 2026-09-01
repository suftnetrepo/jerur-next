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

    const church = await Church.findOneAndUpdate(
      {
        _id: suid
      },
      {
        $set: { address : body}
      },
      { new: true }
    ).select('address').lean();

    if (!church) {
      throw new Error('Church not found');
    }

    return church.address;
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

    const church = await Church.findByIdAndUpdate(
      suid,
      { $set: setPayload },
      { new: true }
    ).select('address').lean();

    if (!church) {
      throw new Error('Church not found');
    }

    return church.address;
  } catch (error) {
    logger.error(error);
    throw new Error('Error updating church address');
  }
};


export { add, update };
