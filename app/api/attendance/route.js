import {
  getAttendanceTrends,
  getMemberAttendanceStats,
  getServiceAttendanceSummary,
  seedNext14DaysAttendance
} from '../../services/attendanceService';
import { logger } from '../../../utils/logger';
import { NextResponse } from 'next/server';
import { getUserSession } from '../../../utils/generateToken';

export const GET = async (req) => {
  try {
    const user = await getUserSession(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    if (action === 'trend') {
      // await seedNext14DaysAttendance(user.church);
      const data = await getAttendanceTrends(user.church);
      return NextResponse.json({ data, success: true });
    }

    if (action === 'oneMember') {
      const id = url.searchParams.get('id');
      const data = await getMemberAttendanceStats(id);
      return NextResponse.json({ data, success: true });
    }

    if (action === 'summary') {
      const id = url.searchParams.get('id');
      const data = await getServiceAttendanceSummary(id);
      return NextResponse.json({ data, success: true });
    }

  } catch (error) {
    logger.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
};
