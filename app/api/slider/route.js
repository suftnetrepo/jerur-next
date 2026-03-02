import { getAllSliders } from '../../services/sliderService';
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
    const data = await getAllSliders(user.church);
    return NextResponse.json({ data, success: true });
  } catch (error) {
    logger.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
};
