import Church from '../models/church';
import { identifierValidator } from '../validation/identifierValidator';
import {
  contactValidator,
  updateAddressValidator,
  updateOneValidator,
  updateFeatureValidator,
  churchUpdateValidator
} from '../validation/churchValidator';
import { logger } from '../../utils/logger';
import { mongoConnect } from '@/utils/connectDb';

mongoConnect();

async function updateChurchContact(suid, body) {
  try {
    const identifierValidateResult = identifierValidator(suid);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }

    const bodyErrors = contactValidator(body);
    if (bodyErrors.length) {
      const error = new Error(bodyErrors.map((it) => it.message).join(','));
      error.invalidArgs = bodyErrors.map((it) => it.field).join(',');
      throw error;
    }
    await Church.findByIdAndUpdate(suid, body, {
      new: true
    });

    return true;
  } catch (error) {
    logger.error(error);
    throw new Error('Error updating church contact');
  }
}

async function updateFeatures(suid, features) {
  try {
    const validateResult = updateFeatureValidator({ features });
    if (validateResult.length) {
      const error = new Error(validateResult.map((it) => it.message).join(','));
      error.invalidArgs = validateResult.map((it) => it.field).join(',');
      throw error;
    }

    await Church.updateOne({ _id: suid }, { $set: { features } });
    return true;
  } catch (error) {
    logger.error(error);
    throw new Error('Error while trying to update church features.');
  }
}

async function updateChurchAddress(suid, body) {
  try {
    const identifierValidateResult = identifierValidator(suid);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }

    const bodyErrors = updateAddressValidator(body);
    if (bodyErrors.length) {
      const error = new Error(bodyErrors.map((it) => it.message).join(','));
      error.invalidArgs = bodyErrors.map((it) => it.field).join(',');
      throw error;
    }
    await Church.updateOne(
      { _id: suid },
      {
        $set: {
          address: body
        }
      }
    );

    return true;
  } catch (error) {
    logger.error(error);
    throw new Error('Error updating church address');
  }
}

async function deleteChurch(id) {
  try {
    const identifierValidateResult = identifierValidator(id);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }
    await Church.findByIdAndRemove(id);
    return true;
  } catch (error) {
    logger.error(error);
    throw new Error('Error deleting church');
  }
}
async function getChurch(id) {
  try {
    const identifierValidateResult = identifierValidator(id);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }
    const church = await Church.findById(id);
    return church;
  } catch (error) {
    logger.error(error);
    throw new Error('Error fetching church');
  }
}
async function getChurchByIdentifier(id) {
  try {
    const identifierValidateResult = identifierValidator(id);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }

    const church = await Church.findById(id);
    return church;
  } catch (error) {
    logger.error(error);
    throw new Error('Error fetching church');
  }
}
async function getChurchesByName(churchName) {
  try {
    const churches = await Church.find({ name: new RegExp(churchName, 'i') });
    return churches;
  } catch (error) {
    logger.error(error);
    throw new Error('Error fetching churches');
  }
}
async function updateBulk(suid , body) {
  try {
    const identifierValidateResult = identifierValidator(suid);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }
    await Church.findByIdAndUpdate(suid, body);
    return true;
  } catch (error) {
    console.error(error);
    throw new Error('Error updating church settings');
  }
}
async function updateOneChurch(suid, name, value) {
  try {
    const validateResult = updateOneValidator({ name, value });

    if (validateResult.length) {
      const error = new Error(validateResult.map((it) => it.message).join(','));
      error.invalidArgs = validateResult.map((it) => it.field).join(',');
      throw error;
    }
    const updatedChurch = await Church.findByIdAndUpdate(suid, { $set: { [name]: value } }, { new: true });

    if (!updatedChurch) {
      throw new Error('Church not found or invalid ID');
    }

    return true;
  } catch (error) {
    logger.error(error);
    throw new Error('Error updating church');
  }
}

async function getChurchesByCountryCode(countryCode) {
  try {
    const churches = await Church.find({
      'address.country_code': new RegExp(countryCode, 'i')
    });
    return churches;
  } catch (error) {
    logger.error(error);
    throw new Error('Error fetching churches');
  }
}
async function searchChurches(searchTerm) {
  try {
    const churches = await Church.find({
      $text: { $search: searchTerm }
    }).limit(100);
    return churches;
  } catch (error) {
    logger.error(error);
    throw new Error('Error searching for churches');
  }
}
async function searchChurchesWithinRadius(latitude, longitude, radius) {
  try {
    const churches = await Church.find({
      'address.location': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseFloat(radius) * 1000
        }
      }
    }).limit(100);

    return churches;
  } catch (error) {
    logger.error(error);
    throw new Error('Error searching for churches');
  }
}

const getAggregateChurchStatus = async () => {
  try {
    const result = await Church.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    return result;
  } catch (error) {
    throw new Error('Error aggregating churches status. Please try again.');
  }
};

const getRecentChurches = async (limit = 10) => {
  try {
    const recentChurches = await Church.find({}).sort({ createdAt: -1 }).limit(limit);

    return recentChurches;
  } catch (error) {
    logger.error(error);
    throw new Error('Error fetching recent churches. Please try again.');
  }
};

async function getChurches({ page = 1, limit = 10, sortField, sortOrder, searchQuery }) {
  const skip = (page - 1) * limit;

  try {
    const sortOptions = {};
    if (sortField) {
      sortOptions[sortField] = sortOrder === 'desc' ? -1 : 1;
    }

    const searchFilter = searchQuery
      ? {
          $or: [
            { name: { $regex: searchQuery, $options: 'i' } },
            { mobile: { $regex: searchQuery, $options: 'i' } },
            { email: { $regex: searchQuery, $options: 'i' } },
            { plan: { $regex: searchQuery, $options: 'i' } }
          ]
        }
      : {};

    const query = {
      ...searchFilter
    };

    const [churches, totalCount] = await Promise.all([
      Church.find(query).sort(sortOptions).skip(skip).limit(limit).exec(),
      Church.countDocuments({})
    ]);

    return {
      data: churches,
      totalCount
    };
  } catch (error) {
    logger.error(error);
    throw new Error('An unexpected error occurred. Please try again.');
  }
}
async function getWeeklyChurchSignOnData() {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const result = await Church.aggregate([
      {
        $match: {
          startDate: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$startDate' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const data = [];
    const dateMap = result.reduce((acc, cur) => {
      acc[cur._id] = cur.count;
      return acc;
    }, {});

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      data.push(dateMap[dateString] || 0);
    }

    return data;
  } catch (error) {
    logger.error(error);
    throw new Error('Error fetching church sign-on data.');
  }
}
async function updateChurch(id, body) {
  try {
    const bodyErrors = churchUpdateValidator(body);
    if (bodyErrors.length) {
      const error = new Error(bodyErrors.map((it) => it.message).join(','));
      error.invalidArgs = bodyErrors.map((it) => it.field).join(',');
      throw error;
    }

    const updated = await Church.findByIdAndUpdate(id, body, {
      new: true
    });

    return updated;
  } catch (error) {
    logger.error(error);
    throw new Error('An unexpected error occurred. Please try again.');
  }
}
async function updateChurchStatus(stripeCustomerId, body) {
  try {
    const updated = await Church.findOneAndUpdate({ stripeCustomerId: stripeCustomerId }, body, { new: true });

    if (!updated) {
      throw new Error('Church not found or update failed');
    }

    return updated;
  } catch (error) {
    logger.error(error);
    throw new Error('Error updating church status');
  }
}

export {
  getAggregateChurchStatus,
  getRecentChurches,
  getChurches,
  getWeeklyChurchSignOnData,
  updateChurch,
  updateChurchStatus,
  updateChurchAddress,
  deleteChurch,
  getChurch,
  getChurchesByName,
  updateBulk,
  updateOneChurch,
  getChurchesByCountryCode,
  searchChurches,
  searchChurchesWithinRadius,
  getChurchByIdentifier,
  updateFeatures,
  updateChurchContact
};
