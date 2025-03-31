import Campaign from '../models';
import CampaignContribution from '../models';
import { identifierValidator } from '../validation/identifierValidator';
import { campaignContributionValidator } from '../validation/campaignContributionValidator';
import { logger } from '../../utils/logger';
import { mongoConnect } from '@/utils/connectDb';

mongoConnect();

async function updateCampaignAmount(campaignId, amount) {
  const updatedCampaign = await Campaign.updateOne({ _id: campaignId }, { $inc: { current_amount_funded: amount } });

  if (updatedCampaign.nModified === 0) {
    throw new Error('Campaign not found or update failed');
  }
}

async function addContribution(body) {
  const { campaign, amount } = body;
  const bodyErrors = campaignContributionValidator(body);
  if (bodyErrors.length) {
    const error = new Error(bodyErrors.map((it) => it.message).join(','));
    error.invalidArgs = bodyErrors.map((it) => it.field).join(',');
    throw error;
  }

  try {
    const newCampaignContribution = new CampaignContribution({
      ...body
    });

    const savedCampaignContribution = await newCampaignContribution.save();

    await updateCampaignAmount(campaign, amount);

    return savedCampaignContribution;
  } catch (error) {
    logger.error(error);
    throw new Error('Error adding campaign contribution');
  }
}

async function getContributionById(id) {
  try {
    const identifierValidateResult = identifierValidator(id);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }

    const campaignContribution = await CampaignContribution.findById(id);
    return campaignContribution;
  } catch (error) {
    logger.error(error);
    throw new Error('Error fetching campaign contribution');
  }
}

async function getContributionsByUser(email) {
  try {
    const allCampaignContributions = await CampaignContribution.find({
      email
    });
    return allCampaignContributions;
  } catch (error) {
    logger.error(error);
    throw new Error('Error fetching campaign contribution by email');
  }
}

async function getContributionsByCampaignId(id) {
  try {
    const identifierValidateResult = identifierValidator(id);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }
    const allCampaignContributions = await CampaignContribution.find({
      campaignId: id
    });
    return allCampaignContributions;
  } catch (error) {
    logger.error(error);
    throw new Error('Error fetching campaign contribution by campaign id');
  }
}

export { addContribution, getContributionById, getContributionsByUser, getContributionsByCampaignId };
