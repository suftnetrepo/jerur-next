import {
  getAttendanceTrends,
  getMemberAttendanceStats,
  getServiceAttendanceSummary
} from '../../services/attendanceService';
import { logger } from '../../../utils/logger';
import { NextResponse } from 'next/server';

export const GET = async (req) => {
  try {
    const url = new URL(req.url);

    const action = url.searchParams.get('action');

    if (action === 'trent') {
      const startDate = url.searchParams.get('startDate');
      const endDate = url.searchParams.get('endDate');
      const interval = url.searchParams.get('interval');
      const data = await getAttendanceTrends(startDate, endDate, interval);
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
