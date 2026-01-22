import { getAllServiceTimes } from '../../../services/serviceTime';
import { logger } from '../../../../utils/logger';
import { NextResponse } from 'next/server';
import { decrypt } from '@/utils/helpers';

export const GET = async (req) => {
  try {

    const clientId = req.headers.get('nj-client-id');

    if (!clientId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const identifier = decrypt(clientId);

    const data = await getAllServiceTimes(identifier, true);
    return NextResponse.json({ data, success: true });
  } catch (error) {
    logger.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
};
