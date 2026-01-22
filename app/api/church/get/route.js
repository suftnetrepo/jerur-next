import { getChurch } from '../../../services/churchService';
import { logger } from '../../../../utils/logger';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export const GET = async () => {
  try {
    const h = headers();
   
    const clientId = h.get('nj-client-id');

    if (!clientId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await getChurch(clientId);
    return NextResponse.json({ data, success: true });
  } catch (error) {
    logger.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
};
