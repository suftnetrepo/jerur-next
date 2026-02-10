
import { addEventRegister } from '../../../services/eventRegisterServices';
import { logger } from '../../../../utils/logger';
import { NextResponse } from 'next/server';
import { decrypt } from '@/utils/helpers';

export const POST = async (req) => {
  try {

     const clientId = req.headers.get('x-nj-client-id');

    if (!clientId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const identifier = decrypt(clientId);

    if (!identifier) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
   
    const body = await req.json();
    const result = await addEventRegister(body);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    logger.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
};
