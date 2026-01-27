import { sliderValidator } from '../validation/sliderValidator';
import { identifierValidator, identifierValidators } from '../validation/identifierValidator';
import { logger } from '../../utils/logger';
import Church from '../models/church';
import { mongoConnect } from '@/utils/connectDb';

mongoConnect();

const addSlider = async ( suid , body) => {
  try {
    const identifierValidateResult = identifierValidator(suid);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }

    const bodyErrors = sliderValidator(body);
    if (bodyErrors.length) {
      const error = new Error(bodyErrors.map((it) => it.message).join(','));
      error.invalidArgs = bodyErrors.map((it) => it.field).join(',');
      throw error;
    }
    const church = await Church.findByIdAndUpdate(suid, { $push: { sliders: body } }, { new: true });

    const newAgenda = church.sliders[church.sliders.length - 1];
    return newAgenda;
  } catch (error) {
    console.error(error);
    throw new Error('Error adding slider');
  }
};

const updateSlider = async (sliderId, body,  suid ) => {
  const { title, status, message, secure_url, public_id, imageOnly } = body;

  try {
    const identifierValidateResult = identifierValidator(suid);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }

    const bodyErrors = sliderValidator(body);
    if (bodyErrors.length) {
      const error = new Error(bodyErrors.map((it) => it.message).join(','));
      error.invalidArgs = bodyErrors.map((it) => it.field).join(',');
      throw error;
    }

    await Church.updateOne(
      { _id: suid, 'sliders._id': sliderId },
      {
        $set: {
          'sliders.$.message': message,
          'sliders.$.title': title,
          'sliders.$.status': status,
          'sliders.$.imageOnly': imageOnly,
          'sliders.$.secure_url': secure_url,
          'sliders.$.public_id': public_id
        }
      }
    ).exec();

    return {secure_url, public_id};
  } catch (error) {
    logger.error(error);
    throw new Error('Error updating slider');
  }
};

const removeSlider = async ( suid , sliderId) => {
  try {
    const identifierValidateResult = identifierValidators([{ suid }, { sliderId }]);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }
    await Church.findByIdAndUpdate(suid, { $pull: { sliders: { _id: sliderId } } }, { new: true }).exec();

    return true;
  } catch (error) {
    logger.error(error);
    throw new Error('Error deleting slider');
  }
};
const getFilteredAndSortedSliders = (sliders) =>
  sliders.filter((slider) => slider.status === true).sort((a, b) => b.createdAt - a.createdAt);
const fetchAllSliders = async (suid) => {
  try {
    const identifierValidateResult = identifierValidator(suid);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }
    const church = await Church.findOne({ _id: suid });

    if (!church) {
      throw new Error('Church not found');
    }

    const sliders = getFilteredAndSortedSliders(church.sliders);
    return sliders;
  } catch (error) {
    logger.error(error);
    throw new Error('Error fetching sliders');
  }
};

const getAllSliders = async (suid ) => {
  try {
    const identifierValidateResult = identifierValidator(suid);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }
    const church = await Church.findOne({ _id: suid });

    if (!church) {
      throw new Error('Church not found');
    }

    const sliders = church.sliders.sort((a, b) => b.createdAt - a.createdAt);
    return sliders;
  } catch (error) {
    logger.error(error);
    throw new Error('Error fetching sliders');
  }
};

export { addSlider, updateSlider, removeSlider, fetchAllSliders, getAllSliders };
