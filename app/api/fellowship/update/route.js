import { updateFellowship } from '../../../services/fellowshipService';
import { logger } from '../../../../utils/logger';
import { NextResponse } from 'next/server';
import { getUserSession } from '@/utils/generateToken';

export const PUT = async (req) => {
  try {

    const user = await getUserSession(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const body = await req.json();
    const id = url.searchParams.get('id');
    const data = await updateFellowship(id, body);
    return NextResponse.json({ data, success: true });
  } catch (error) {
    logger.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
};
