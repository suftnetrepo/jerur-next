import { add, createAttendance } from '../../../../services/attendanceService';
import { logger } from '../../../../../utils/logger';
import { decrypt } from '../../../../../utils/helpers';
import { NextResponse } from 'next/server';

export const POST = async (req) => {
  try {
    const clientId = req.headers.get('x-nj-client-id');

    if (!clientId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const identifier = decrypt(clientId);

    if (!identifier) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Support both new and legacy methods
    let data;
    if (body.memberId || body.serviceId) {
      // New attendance submission with enhanced fields
      data = await createAttendance({
        ...body,
        churchId: identifier
      });
    } else {
      // Legacy attendance method (count-based)
      data = await add(body);
    }

    return NextResponse.json({ data, success: true });
  } catch (error) {
    logger.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
};
