import {
  getAggregateChurchStatus,
  getRecentChurches,
  getChurches,
  getWeeklyChurchSignOnData,
  getChurchById,
  getChurchByIdentifier,
  getChurchesByName,
  getChurchesByCountryCode
} from '../../services/churchService';
import { logger } from '../../../utils/logger';
import { NextResponse } from 'next/server';

export const GET = async (req) => {
  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    if (action === 'paginate') {
      const sortField = url.searchParams.get('sortField');
      const sortOrder = url.searchParams.get('sortOrder');
      const searchQuery = url.searchParams.get('searchQuery');
      const status = url.searchParams.get('status');
      const page = parseInt(url.searchParams.get('page') || '1', 10);
      const limit = parseInt(url.searchParams.get('limit') || '10', 10);

      const { data, success, totalCount } = await getChurches({
        page,
        limit,
        sortField,
        sortOrder,
        searchQuery,
        status
      });
      return NextResponse.json({ data, success, totalCount });
    }

    if (action === 'aggregate') {
      const data = await getAggregateChurchStatus();
      return NextResponse.json({ data, success: true });
    }

    if (action === 'countryCode') {
      const countryCode = url.searchParams.get('countryCode');
      const { data } = await getChurchesByCountryCode(countryCode);
      return NextResponse.json({ data, success: true });
    }

    if (action === 'byIdentifier') {
      const identifier = url.searchParams.get('identifier');
      const data = await getChurchByIdentifier(identifier);
      return NextResponse.json({ data, success: true });
    }

    if (action === 'byId') {
      const id = url.searchParams.get('id');
      const data = await getChurchById(id);
      return NextResponse.json({ data, success: true });
    }

    if (action === 'byName') {
      const name = url.searchParams.get('name');
      const data = await getChurchesByName(name);
      return NextResponse.json({ data, success: true });
    }

    if (action === 'recent') {
      const limit = url.searchParams.get('limit');
      const data = await getRecentChurches(limit);
      return NextResponse.json({ data, success: true });
    }

    if (action === 'weekly') {
      const data = await getWeeklyChurchSignOnData();
      return NextResponse.json({ data, success: true });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
};
