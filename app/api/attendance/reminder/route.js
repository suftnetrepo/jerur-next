import { NextResponse } from 'next/server';
import { decrypt } from '../../../../utils/helpers';
import { logger } from '../../../../utils/logger';
import { getAttendanceReminder } from '../../../services/attendanceService';
import { verifyMemberToken } from '../../../services/memberService';
import { getMobileClientId } from '../../member/mobileAuthRequest';

export const GET = async (req) => {
  try {
    const churchId = decrypt(getMobileClientId(req));
    const authHeader = req.headers.get('authorization');

    if (!churchId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    let memberIdentity = null;
    if (authHeader?.startsWith('Bearer ')) {
      try {
        memberIdentity = verifyMemberToken(authHeader.slice(7));
      } catch {
        return NextResponse.json({ success: false, error: 'Member session has expired' }, { status: 401 });
      }

      if (String(memberIdentity.church) !== String(churchId)) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }
    }

    const data = await getAttendanceReminder(churchId, memberIdentity?.memberId);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    logger.error(error);
    return NextResponse.json(
      { success: false, error: 'Unable to load the attendance reminder.' },
      { status: 500 }
    );
  }
};
