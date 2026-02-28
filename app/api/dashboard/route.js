import { getDashboardAggregates, getDashboardStatistics } from '../../services/dashboardService';
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
    const churchId = user?.church;

    // Simple aggregates endpoint
    if (action === 'aggregates') {
      const result = await getDashboardAggregates(churchId);
      if (result.success) {
        return NextResponse.json({ data: result.data });
      } else {
        return NextResponse.json({ error: result.error }, { status: 500 });
      }
    }

    // Detailed statistics endpoint
    if (action === 'statistics') {
      const result = await getDashboardStatistics(churchId);
      if (result.success) {
        return NextResponse.json({ data: result.data });
      } else {
        return NextResponse.json({ error: result.error }, { status: 500 });
      }
    }

    // Default: return aggregates
    const result = await getDashboardAggregates(churchId);
    if (result.success) {
      return NextResponse.json({ data: result.data });
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
  } catch (error) {
    logger.error(error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
};
