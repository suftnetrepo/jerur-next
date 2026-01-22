import { deleteCampaign } from '../../../services/campaignService';
import { logger } from '../../../../utils/logger';
import { NextResponse } from 'next/server';
import { getUserSession } from '@/utils/generateToken';

export const DELETE = async (req) => {
  try {

    const url = new URL(req.url);
    const user = await getUserSession(req);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = url.searchParams.get('id');
    const { data } = await deleteCampaign(id);
    return NextResponse.json({ data, success: true });
  } catch (error) {
    logger.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
};
