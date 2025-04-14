import {
  getAllFellowships,
  countInFellowshipCollection,
  searchFellowshipWithinRadius
} from '../../services/fellowshipService';
import { logger } from '../../../utils/logger';
import { NextResponse } from 'next/server';
import { getUserSession } from '@/utils/generateToken';

export const GET = async (req) => {
  try {
    const user = await getUserSession(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("......................user?.church", user?.church)
    
    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    if (action === 'getAll') {
      const data = await getAllFellowships(user?.church);
      return NextResponse.json({ data, success: true });
    }

    if (action === 'count') {
      const data = await countInFellowshipCollection(user?.church);
      return NextResponse.json({ data, success: true });
    }

    if (action === 'searchWithinRadius') {
      const latitude = url.searchParams.get('latitude');
      const longitude = url.searchParams.get('longitude');
      const radius = url.searchParams.get('radius');
      const data = await searchFellowshipWithinRadius(user?.church, latitude, longitude, radius);
      return NextResponse.json({ data, success: true });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    logger.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
};
