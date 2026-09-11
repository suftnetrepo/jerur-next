import { add, createAttendance, isServiceRunningToday } from '../../../../services/attendanceService';
import { logger } from '../../../../../utils/logger';
import { decrypt } from '../../../../../utils/helpers';
import { NextResponse } from 'next/server';
import { verifyMemberToken } from '../../../../services/memberService';

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

    const authHeader = req.headers.get('authorization');
    let memberIdentity = null;
    if (authHeader?.startsWith('Bearer ')) {
      try {
        memberIdentity = verifyMemberToken(authHeader.slice(7));
      } catch (tokenError) {
        return NextResponse.json({ success: false, error: 'Member session has expired' }, { status: 401 });
      }

      if (String(memberIdentity.church) !== String(identifier)) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }
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
      if (body.serviceId && !(await isServiceRunningToday(body.serviceId, identifier))) {
        return NextResponse.json(
          { success: false, error: 'Attendance can only be submitted on the service day.' },
          { status: 400 }
        );
      }

      // New attendance submission with enhanced fields
      data = await createAttendance({
        ...body,
        // Current clients are bound to the member JWT. Keeping the submitted
        // ID fallback allows an already-installed legacy mobile build to keep
        // working while the new app release rolls out.
        memberId: memberIdentity?.memberId || body.memberId,
        churchId: identifier
      });
    } else {
      // Legacy attendance method (count-based)
      data = await add(body);
    }

    return NextResponse.json({ data, success: true });
  } catch (error) {
    logger.error(error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.statusCode || 500 }
    );
  }
};
