import Campaign from '../models/campaign';
import { identifierValidator } from '../validation/identifierValidator';
import { campaignContributionValidator } from '../validation/campaignContributionValidator';
import { logger } from '../../utils/logger';
import { mongoConnect } from '@/utils/connectDb';

mongoConnect();

async function addContribution(body) {
  const { campaign: campaignId, amount } = body;

  const bodyErrors = campaignContributionValidator(body);
  if (bodyErrors.length) {
    const error = new Error(bodyErrors.map((it) => it.message).join(','));
    error.invalidArgs = bodyErrors.map((it) => it.field).join(',');
    throw error;
  }

  try {
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    campaign.contribution.push({
      amount,
      first_name: body.first_name,
      last_name: body.last_name,
      email: body.email
    });

    campaign.current_amount_funded += amount;

    const updated = await campaign.save();
    return updated;
  } catch (error) {
    logger.error(error);
    throw new Error('Error adding campaign contribution');
  }
}

async function getContributionById(campaignId, index) {
  try {
    const errors = identifierValidator(campaignId);
    if (errors.length) {
      const error = new Error(errors.map((e) => e.message).join(','));
      error.invalidArgs = errors.map((e) => e.field).join(',');
      throw error;
    }

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) throw new Error('Campaign not found');

    const contribution = campaign.contribution[index];
    if (!contribution) throw new Error('Contribution not found');

    return contribution;
  } catch (error) {
    logger.error(error);
    throw new Error('Error fetching contribution');
  }
}

async function getContributionsByUser(email) {
  try {
    const campaigns = await Campaign.find({
      'contribution.email': email
    });

    const contributions = campaigns.flatMap((c) =>
      c.contribution.filter((contrib) => contrib.email === email)
    );

    return contributions;
  } catch (error) {
    logger.error(error);
    throw new Error('Error fetching contributions by user email');
  }
}

async function getContributionsByCampaignId(campaignId) {
  try {
    const errors = identifierValidator(campaignId);
    if (errors.length) {
      const error = new Error(errors.map((e) => e.message).join(','));
      error.invalidArgs = errors.map((e) => e.field).join(',');
      throw error;
    }

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) throw new Error('Campaign not found');

    return campaign.contribution;
  } catch (error) {
    logger.error(error);
    throw new Error('Error fetching contributions by campaign');
  }
}

export {
  addContribution,
  getContributionById,
  getContributionsByUser,
  getContributionsByCampaignId
};
