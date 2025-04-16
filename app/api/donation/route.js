import {
  filterDonationsByDate,
  getDonationByMonthlyAggregates,
  getByDonationTypeAggregates,
  getDonations,
  getDonationByDailyAggregates
} from '../../services/donationService';
import { logger } from '../../../utils/logger';
import { NextResponse } from 'next/server';
import { getUserSession } from '@/utils/generateToken';

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

      const { data, totalCount } = await getDonations({
        suid: user?.church,
        page,
        limit,
        sortField,
        sortOrder,
        searchQuery
      });
      return NextResponse.json({ data, totalCount });
    }

    if (action === 'aggregateByMonth') {
      const data  = await getDonationByMonthlyAggregates(user?.church);
      return NextResponse.json({ data, success: true });
    }

    if (action === 'aggregateByType') {
      const  data  = await getByDonationTypeAggregates(user?.church);
      return NextResponse.json({ data, success: true });
    }

    if (action === 'aggregateByDailyDate') {
      const data  = await getDonationByDailyAggregates(user?.church);
      return NextResponse.json({ data, success: true });
    }

    if (action === 'filterByDate') {
      const startDate = url.searchParams.get('startDate');
      const endDate = url.searchParams.get('endDate');
      const donation_type = url.searchParams.get('donation_type');
      const data  = await filterDonationsByDate(user?.church, startDate, endDate, donation_type);
      return NextResponse.json({ data, success: true });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    logger.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
};