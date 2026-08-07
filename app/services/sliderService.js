import { sliderValidator } from '../validation/sliderValidator';
import { identifierValidator, identifierValidators } from '../validation/identifierValidator';
import { logger } from '../../utils/logger';
import Church from '../models/church';
import { mongoConnect } from '../../utils/connectDb';
import CloudinaryService from '../../lib/CloudinaryService';

mongoConnect();

const SLIDER_IMAGE_FOLDER = 'jerur_next_uploads';

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

    const { file, ...sliderFields } = body;
    const uploaded = await CloudinaryService.uploadImage(file, { folder: SLIDER_IMAGE_FOLDER });

    const church = await Church.findByIdAndUpdate(
      suid,
      {
        $push: {
          sliders: {
            ...sliderFields,
            ...(uploaded && { secure_url: uploaded.secure_url, public_id: uploaded.public_id })
          }
        }
      },
      { new: true }
    );

    const newSlider = church.sliders[church.sliders.length - 1];
    return newSlider;
  } catch (error) {
    console.error(error);
    throw new Error('Error adding slider');
  }
};

const updateSlider = async (sliderId, body,  suid ) => {
  const { title, status, message, imageOnly, file } = body;

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

    const church = await Church.findOne({ _id: suid, 'sliders._id': sliderId }, { 'sliders.$': 1 });
    const existingSlider = church?.sliders?.[0];
    if (!existingSlider) {
      throw new Error('Slider not found');
    }

    // No new file -> CASE 1: leave secure_url/public_id untouched entirely.
    // New file -> CASE 2: delete the old Cloudinary image, upload the new
    // one, and persist its secure_url/public_id.
    const uploaded = await CloudinaryService.replaceImage(file, existingSlider.public_id, {
      folder: SLIDER_IMAGE_FOLDER
    });

    const setFields = {
      'sliders.$.message': message,
      'sliders.$.title': title,
      'sliders.$.status': status,
      'sliders.$.imageOnly': imageOnly,
      ...(uploaded && {
        'sliders.$.secure_url': uploaded.secure_url,
        'sliders.$.public_id': uploaded.public_id
      })
    };

    await Church.updateOne({ _id: suid, 'sliders._id': sliderId }, { $set: setFields }).exec();

    return uploaded || { secure_url: existingSlider.secure_url, public_id: existingSlider.public_id };
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

    const church = await Church.findOne({ _id: suid, 'sliders._id': sliderId }, { 'sliders.$': 1 });
    const existingSlider = church?.sliders?.[0];

    // Best-effort: a failed Cloudinary cleanup is logged but must not block
    // the record deletion the caller asked for.
    if (existingSlider) {
      await CloudinaryService.deleteImage(existingSlider.public_id);
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
