import Fellowship from '../models';
import { identifierValidator } from '../validation/identifierValidator';
import { fellowshipValidator } from '../validation/fellowshipValidator';
import { logger } from '../../utils/logger';
import { mongoConnect } from '@/utils/connectDb';

mongoConnect();

async function addFellowship(suid, body) {
  try {
    const identifierValidateResult = identifierValidator(suid);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }

    const bodyErrors = fellowshipValidator(body);
    if (bodyErrors.length) {
      const error = new Error(bodyErrors.map((it) => it.message).join(','));
      error.invalidArgs = bodyErrors.map((it) => it.field).join(',');
      throw error;
    }

    const newFellowship = new Fellowship({
      suid,
      ...body
    });

    const savedFellowship = await newFellowship.save();
    return savedFellowship;
  } catch (error) {
    logger.error(error);
    throw new Error('Error adding fellowship');
  }
}

async function updateFellowship(id, body) {
  try {
    const identifierValidateResult = identifierValidator(id);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }

    const bodyErrors = fellowshipValidator(body);
    if (bodyErrors.length) {
      const error = new Error(bodyErrors.map((it) => it.message).join(','));
      error.invalidArgs = bodyErrors.map((it) => it.field).join(',');
      throw error;
    }
    await Fellowship.findByIdAndUpdate(id, body, {
      new: true
    });

    return true;
  } catch (error) {
    logger.error(error);
    throw new Error('Error editing fellowship');
  }
}

async function deleteFellowship(id) {
  try {
    const identifierValidateResult = identifierValidator(id);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }
    await Fellowship.findByIdAndRemove(id);
    return true;
  } catch (error) {
    logger.error(error);
    throw new Error('Error deleting fellowship');
  }
}

async function getFellowshipById(id) {
  try {
    const identifierValidateResult = identifierValidator(id);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }

    const fellowship = await Fellowship.findById(id);
    return fellowship;
  } catch (error) {
    logger.error(error);
    throw new Error('Error fetching fellowship');
  }
}

async function getAllFellowships(suid) {
  try {
    const identifierValidateResult = identifierValidator(suid);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }

    const allFellowships = await Fellowship.find({ suid }).sort({
      createdAt: -1
    });
    return allFellowships;
  } catch (error) {
    logger.error(error);
    throw new Error('Error fetching all fellowship');
  }
}

async function countInFellowshipCollection(suid) {
  try {
    const identifierValidateResult = identifierValidator(suid);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }

    const fellowshipCount = await Fellowship.countDocuments({
      suid
    });
    return fellowshipCount;
  } catch (error) {
    logger.error(error);
    throw new Error('Error fetching fellowship count');
  }
}

async function searchFellowshipWithinRadius(suid, latitude, longitude, radius) {
  try {
    const fellowships = await Fellowship.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseFloat(radius) * 1000
        }
      },
      status: true,
      suid
    }).limit(20);

    return fellowships;
  } catch (error) {
    logger.error(error);
    throw new Error('Error searching for fellowships');
  }
}

export {
  deleteFellowship,
  updateFellowship,
  addFellowship,
  getFellowshipById,
  getAllFellowships,
  countInFellowshipCollection,
  searchFellowshipWithinRadius
};
