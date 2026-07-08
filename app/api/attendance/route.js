import {
  getAttendanceTrends,
  getMemberAttendanceStats,
  getServiceAttendanceSummary,
  seedNext14DaysAttendance,
  getAttendanceById,
  getAttendanceByService,
  getAttendanceByMember,
  getAttendanceHistory,
  getAttendanceStatistics,
  getAttendanceDashboard
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

    if (action === 'byId') {
      const id = url.searchParams.get('id');
      const data = await getAttendanceById(id);
      return NextResponse.json({ data, success: true });
    }

    if (action === 'byService') {
      const serviceId = url.searchParams.get('serviceId');
      const page = url.searchParams.get('page') || 1;
      const limit = url.searchParams.get('limit') || 10;
      const status = url.searchParams.get('status');
      const queue = url.searchParams.get('queue');
      const searchQuery = url.searchParams.get('searchQuery') || '';

      const result = await getAttendanceByService(serviceId, {
        page: parseInt(page),
        limit: parseInt(limit),
        status,
        queue,
        searchQuery
      });
      return NextResponse.json({
        data: result.data,
        totalCount: result.pagination.total,
        pagination: result.pagination,
        success: true
      });
    }

    if (action === 'dashboard') {
      const serviceId = url.searchParams.get('serviceId');
      const data = await getAttendanceDashboard(user.church, { serviceId });
      return NextResponse.json({ data, success: true });
    }

    if (action === 'byMember') {
      const memberId = url.searchParams.get('memberId');
      const page = url.searchParams.get('page') || 1;
      const limit = url.searchParams.get('limit') || 10;
      const status = url.searchParams.get('status');
      const startDate = url.searchParams.get('startDate');
      const endDate = url.searchParams.get('endDate');

      const result = await getAttendanceByMember(memberId, {
        page: parseInt(page),
        limit: parseInt(limit),
        status,
        startDate,
        endDate
      });
      return NextResponse.json({
        data: result.data,
        totalCount: result.pagination.total,
        pagination: result.pagination,
        success: true
      });
    }

    if (action === 'history') {
      const memberId = url.searchParams.get('memberId');
      const limit = url.searchParams.get('limit') || 20;
      const status = url.searchParams.get('status');

      const data = await getAttendanceHistory(memberId, {
        limit: parseInt(limit),
        status
      });
      return NextResponse.json({ data, success: true });
    }

    if (action === 'statistics') {
      const serviceId = url.searchParams.get('serviceId');
      const startDate = url.searchParams.get('startDate');
      const endDate = url.searchParams.get('endDate');

      const data = await getAttendanceStatistics(user.church, {
        serviceId,
        startDate,
        endDate
      });
      return NextResponse.json({ data, success: true });
    }

  } catch (error) {
    logger.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
};
