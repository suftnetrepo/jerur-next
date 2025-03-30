import Campaign from '../models';
import { identifierValidator } from '../validation/identifierValidator';
import { campaignValidator } from '../validation/campaignValidator';
import { logger } from '../../utils/logger';

async function addCampaign({ suid }, body) {
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

async function getAllCampaigns({ suid }) {
  try {
    const identifierValidateResult = identifierValidator(suid);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }
    const allCampaigns = await Campaign.find({ suid }).sort({ createdAt: -1 });
    return allCampaigns;
  } catch (error) {
    logger.error(error);
    throw new Error('Error fetching all campaigns');
  }
}

async function countInCampaignCollection({ suid }) {
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

async function getTop10Campaigns({ suid }) {
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

async function getCampaigns({ suid }, pageNumber, pageSize, filterTerm) {
  try {
    const page = parseFloat(pageNumber, 10) || 1;
    const size = parseFloat(pageSize, 10) || 1;
    const skipCount = (page - 1) * size;

    const baseConditions = { suid };

    let filterConditions = [];
    if (filterTerm) {
      filterConditions = [{ title: new RegExp(filterTerm, 'i') }];

      const targetAmount = parseFloat(filterTerm);
      if (!Number.isNaN(targetAmount)) {
        filterConditions.push({ target_amount: targetAmount });
        filterConditions.push({ current_amount_funded: targetAmount });
      }

      if (filterTerm === 'YES' || filterTerm === 'yes') {
        filterConditions.push({ status: true });
      }

      if (filterTerm === 'NO' || filterTerm === 'no') {
        filterConditions.push({ status: false });
      }
    }

    const queryConditions = filterTerm
      ? {
          $and: [baseConditions, { $or: filterConditions }]
        }
      : baseConditions;

    const countQuery = Campaign.countDocuments(queryConditions);
    const totalCampaignsCount = await countQuery;
    const campaigns = await Campaign.find(queryConditions).sort({ createdAt: -1 }).skip(skipCount).limit(size);

    return {
      pageInfo: {
        pageNumber,
        pageSize,
        totalPages: Math.ceil(totalCampaignsCount / pageSize)
      },
      campaigns
    };
  } catch (error) {
    logger.error(error);
    throw new Error('Error fetching campaigns');
  }
}

async function fetchTop10Campaigns(suid) {
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

async function fetchCampaigns(suid, pageNumber, pageSize, filterTerm) {
  const page = parseFloat(pageNumber, 10) || 1;
  const size = parseFloat(pageSize, 10) || 1;
  const skipCount = (page - 1) * size;

  const baseConditions = { suid, status: true };

  let filterConditions = [];
  if (filterTerm) {
    filterConditions = [{ title: new RegExp(filterTerm, 'i') }];
  }

  const queryConditions = filterTerm
    ? {
        $and: [baseConditions, { $or: filterConditions }]
      }
    : baseConditions;

  try {
    const countQuery = Campaign.countDocuments(queryConditions);
    const totalCampaignsCount = await countQuery;
    const campaigns = await Campaign.find(queryConditions).sort({ createdAt: -1 }).skip(skipCount).limit(size);

    return {
      pageInfo: {
        pageNumber,
        pageSize,
        totalPages: Math.ceil(totalCampaignsCount / pageSize)
      },
      campaigns
    };
  } catch (error) {
    logger.error(error);
    throw new Error('Error fetching campaigns');
  }
}

export {
  addCampaign,
  updateCampaign,
  deleteCampaign,
  getCampaignById,
  getAllCampaigns,
  countInCampaignCollection,
  getTop10Campaigns,
  getCampaigns,
  fetchCampaigns,
  fetchTop10Campaigns
};
