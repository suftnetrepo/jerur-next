
import { testimoniesValidator } from '../validation/userValidator';
import { identifierValidator } from '../validation/identifierValidator';
import Testimonies from '../models/testimonies';
import { logger } from '../../utils/logger';
import { mongoConnect } from '@/utils/connectDb';

mongoConnect();

async function getTestimonies({ suid, page = 1, limit = 10, sortField, sortOrder, searchQuery }) {
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
          ]
        }
      : {};

    const query = {
      church:suid,
      ...searchFilter
    };

    const [testimonies, totalCount] = await Promise.all([
      Testimonies.find(query).sort(sortOptions).skip(skip).limit(limit).exec(),
      Testimonies.countDocuments({church:suid})
    ]);

    return {
      data: testimonies,
      totalCount
    };
  } catch (error) {
    logger.error(error);
    throw new Error('An unexpected error occurred. Please try again.');
  }
}
async function createTestimony(suid, body) {

  try {
    const identifierValidateResult = identifierValidator(suid);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }

    const bodyErrors = testimoniesValidator(body);
    if (bodyErrors.length) {
      const error = new Error(bodyErrors.map((it) => it.message).join(','));
      error.invalidArgs = bodyErrors.map((it) => it.field).join(',');
      throw error;
    }
    const newTestimony = await Testimonies.create({
      church: suid,
      ...body
    });

    if (!newTestimony) {
      throw new Error('create new member failed');
    }

    return newTestimony;
  } catch (error) {
    logger.error(error);
    throw new Error('An unexpected error occurred. Please try again.');
  }
}
async function updateTestimonies(id, body) {

  try {
    const identifierValidateResult = identifierValidator(id);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }

    const bodyErrors = testimoniesValidator(body);
    if (bodyErrors.length) {
      const error = new Error(bodyErrors.map((it) => it.message).join(','));
      error.invalidArgs = bodyErrors.map((it) => it.field).join(',');
      throw error;
    }
    const updatedTestimony = await Testimonies.findByIdAndUpdate(id, body, {
      new: true
    });

    if (!updatedTestimony) {
      throw new Error('Testimony not found or update failed');
    }

    return true;
  } catch (error) {
    console.error(error);
    throw new Error('An unexpected error occurred. Please try again.');
  }
}
async function removeTestimony( suid , id) {
  try {
    const identifierValidateResult = identifierValidator(id);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }

    await Testimonies.findOneAndDelete({ _id: id, church: suid });
    return true;
  } catch (error) {
    logger.error(error);
    throw new Error('An unexpected error occurred. Please try again.');
  }
}

export {
  updateTestimonies,
  removeTestimony,
  createTestimony,
  getTestimonies
};
