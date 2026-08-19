import { add, createAttendance, isServiceRunningToday } from '../../../../services/attendanceService';
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
      // A member may only submit attendance for the service actually
      // running today — mirrors the check the mobile app already makes
      // before showing the form, enforced here too so it can't be
      // bypassed by calling this endpoint directly. Scoped to this mobile
      // self-service route only; the staff/admin attendance route can
      // still record outside that window.
      if (body.serviceId && !(await isServiceRunningToday(body.serviceId))) {
        return NextResponse.json(
          { success: false, error: 'Attendance can only be submitted on the service day.' },
          { status: 400 }
        );
      }

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
