import Campaign from '../models';
import { identifierValidator } from '../validation/identifierValidator';
import { campaignValidator } from '../validation/campaignValidator';
import { logger } from '../../utils/logger';
import { mongoConnect } from '../../utils/connectDb';

mongoConnect();

async function addCampaign( suid , body) {
  try {
    const identifierValidateResult = identifierValidator(suid);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }

    const bodyErrors = campaignValidator(body);
    if (bodyErrors.length) {
      const error = new Error(bodyErrors.map((it) => it.message).join(','));
      error.invalidArgs = bodyErrors.map((it) => it.field).join(',');
      throw error;
    }
    const newCampaign = new Campaign({
      suid,
      ...body
    });

    const savedCampaign = await newCampaign.save();
    return savedCampaign;
  } catch (error) {
    logger.error(error);
    throw new Error('Error adding campaign');
  }
}

async function updateCampaign(id, body) {
  try {
    const identifierValidateResult = identifierValidator(id);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }

    const bodyErrors = campaignValidator(body);
    if (bodyErrors.length) {
      const error = new Error(bodyErrors.map((it) => it.message).join(','));
      error.invalidArgs = bodyErrors.map((it) => it.field).join(',');
      throw error;
    }
    await Campaign.findByIdAndUpdate(id, body, {
      new: true
    });
    return true;
  } catch (error) {
    logger.error(error);
    throw new Error('Error editing campaign');
  }
}

async function deleteCampaign(id) {
  try {
    const identifierValidateResult = identifierValidator(id);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }
    await Campaign.findByIdAndRemove(id);
    return true;
  } catch (error) {
    logger.error(error);
    throw new Error('Error deleting campaign');
  }
}

async function getCampaignById(id) {
  try {
    const identifierValidateResult = identifierValidator(id);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }
    const campaign = await Campaign.findById(id);
    return campaign;
  } catch (error) {
    logger.error(error);
    throw new Error('Error fetching campaign');
  }
}

async function countInCampaignCollection(suid) {
  try {
    const identifierValidateResult = identifierValidator(suid);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }
    const campaignCount = await Campaign.countDocuments({
      suid
    });
    return campaignCount;
  } catch (error) {
    logger.error(error);
    throw new Error('Error fetching campaign count');
  }
}

async function getCampaigns({ suid, page = 1, limit = 10, sortField, sortOrder, searchQuery, status = false }) {
  const skip = (page - 1) * limit;

  try {
    const sortOptions = {};
    if (sortField) {
      sortOptions[sortField] = sortOrder === 'desc' ? -1 : 1;
    }

    const searchFilter = searchQuery
      ? {
          $or: [{ name: { $regex: searchQuery, $options: 'i' } }]
        }
      : {};

    const query = {
      church: suid,
      status: status,
      ...searchFilter
    };

    const [campaigns, totalCount] = await Promise.all([
      Campaign.find(query).sort(sortOptions).skip(skip).limit(limit).exec(),
      Campaign.countDocuments({church: suid})
    ]);

    return {
      data: campaigns,
      totalCount
    };
  } catch (error) {
    logger.error(error);
    throw new Error('An unexpected error occurred. Please try again.');
  }
}

async function getTop10Campaigns(suid) {
  try {
    const identifierValidateResult = identifierValidator(suid);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }
    const campaigns = await Campaign.find({ suid, status: true })
      .sort({
        target_amount: -1
      })
      .limit(10);
    return campaigns;
  } catch (error) {
    logger.error(error);
    throw new Error('Error fetching all campaigns');
  }
}

export {
  addCampaign,
  updateCampaign,
  deleteCampaign,
  getCampaignById,
  countInCampaignCollection,
  getTop10Campaigns,
  getCampaigns
};
