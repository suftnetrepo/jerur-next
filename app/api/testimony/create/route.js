import { createTestimony } from '../../../services/testimoniesService';
import { logger } from '../../../../utils/logger';
import { NextResponse } from 'next/server';
import { getUserSession } from '../../../../utils/generateToken';

export const POST = async (req) => {
  try {
     const user = await getUserSession(req);
  
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

    const body = await req.json();
    const data = await createTestimony(user.church, body);
    return NextResponse.json({ data, success: true });
  } catch (error) {
    logger.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
};
