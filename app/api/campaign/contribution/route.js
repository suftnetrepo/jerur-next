import {
  getContributionsByCampaignId,
  getContributionById,
  getContributionsByUser
} from '../../../services/campaignContributionService';
import { logger } from '../../../../utils/logger';
import { NextResponse } from 'next/server';

export const GET = async (req) => {
  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    if (action === 'getByCampaignId') {
      const id = url.searchParams.get('id');
      const data = await getContributionsByCampaignId(id);
      return NextResponse.json({ data, success: true });
    }

    if (action === 'getByEmail') {
      const email = url.searchParams.get('email');
      const data = await getContributionsByUser(email);
      return NextResponse.json({ data, success: true });
    }

    if (action === 'getById') {
      const id = url.searchParams.get('id');
      const data = await getContributionById(id);
      return NextResponse.json({ data, success: true });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    logger.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
};
