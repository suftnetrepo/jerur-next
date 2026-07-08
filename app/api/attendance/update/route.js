import { updateAttendance } from '../../../services/attendanceService';
import { logger } from '../../../../utils/logger';
import { NextResponse } from 'next/server';
import { getUserSession } from '../../../../utils/generateToken';

export const PUT = async (req) => {
  try {
    const user = await getUserSession(req);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const attendanceId = url.searchParams.get('id');

    if (!attendanceId) {
      return NextResponse.json({ error: 'Attendance ID is required' }, { status: 400 });
    }

    const body = await req.json();
    const data = await updateAttendance(attendanceId, body);
    
    return NextResponse.json({ data, success: true });
  } catch (error) {
    logger.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
};
