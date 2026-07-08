import { searchChurches, searchChurchesWithinRadius } from '../../../services/churchService';
import { logger } from '../../../../utils/logger';
import { NextResponse } from 'next/server';

const parseCoordinate = (value) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export const GET = async (req) => {
  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    if (action === 'search') {
      const searchQuery = url.searchParams.get('searchQuery');

      if (!searchQuery?.trim()) {
        return NextResponse.json({ success: false, error: 'searchQuery is required' }, { status: 400 });
      }

      const data = await searchChurches(searchQuery);
      return NextResponse.json({ data, success: true });
    }

    if (action === 'radius') {
      const latitude = parseCoordinate(url.searchParams.get('latitude'));
      const longitude = parseCoordinate(url.searchParams.get('longitude'));
      const radius = parseCoordinate(url.searchParams.get('radius'));

      if (latitude === null || longitude === null || radius === null || radius <= 0) {
        return NextResponse.json(
          { success: false, error: 'latitude, longitude, and radius must be valid numbers' },
          { status: 400 }
        );
      }

      const data = await searchChurchesWithinRadius(latitude, longitude, radius);
      return NextResponse.json({ data, success: true });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    logger.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
};
