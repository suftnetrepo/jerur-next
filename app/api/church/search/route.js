import { searchChurches, searchChurchesWithinRadius } from '../../../services/churchService';
import { logger } from '../../utils/logger';
import { NextResponse } from 'next/server';

export const GET = async (req) => {
  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    if (action === 'search') {
      const searchQuery = url.searchParams.get('searchQuery');
      const { data } = await searchChurches(searchQuery);
      return NextResponse.json({ data, success: true });
    }

    if (action === 'radius') {
      const latitude = url.searchParams.get('latitude');
      const longitude = url.searchParams.get('longitude');
      const radius = url.searchParams.get('radius');
      const { data } = await searchChurchesWithinRadius(latitude, longitude, radius);
      return NextResponse.json({ data, success: true });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    logger.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
};
