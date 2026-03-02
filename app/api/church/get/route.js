import { decrypt } from '../../../../utils/helpers';
import { getChurch } from '../../../services/churchService';
import { logger } from '../../../../utils/logger';
import { NextResponse } from 'next/server';

export const GET = async (req) => {
  try {
   
       const clientId = req.headers.get('x-nj-client-id');

    if (!clientId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const identifier = decrypt(clientId);
    const data = await getChurch(identifier);
    return NextResponse.json({ data, success: true });
  } catch (error) {
    logger.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
};