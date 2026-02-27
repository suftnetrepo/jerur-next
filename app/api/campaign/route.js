import {
  getCampaignById,
  countInCampaignCollection,
  getTop10Campaigns,
  getCampaigns
} from '../../services/campaignService';
import { logger } from '../../../utils/logger';
import { NextResponse } from 'next/server';
import { getUserSession } from '../../../utils/generateToken';

export const GET = async (req) => {
  try {

    const user = await getUserSession(req);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    if (action === 'paginate') {
      const sortField = url.searchParams.get('sortField');
      const sortOrder = url.searchParams.get('sortOrder');
      const searchQuery = url.searchParams.get('searchQuery');
      const page = parseInt(url.searchParams.get('page') || '1', 10);
      const limit = parseInt(url.searchParams.get('limit') || '10', 10);
      const status = url.searchParams.get('status');
      const { data, totalCount } = await getCampaigns({
        suid: user?.church,
        page,
        limit,
        sortField,
        sortOrder,
        searchQuery,
        status
      });
      return NextResponse.json({ data, totalCount });
    }

    if (action === 'top10') {
      const data = await getTop10Campaigns(user?.church);
      return NextResponse.json({ data, success: true });
    }

    if (action === 'getOne') {
      const id = url.searchParams.get('id');
      const data = await getCampaignById(id);
      return NextResponse.json({ data, success: true });
    }

    if (action === 'getCount') {
      const { data } = await countInCampaignCollection(user?.church);
      return NextResponse.json({ data, success: true });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    logger.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
};