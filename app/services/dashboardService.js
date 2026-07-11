import mongoose from "mongoose";
import Church from '../models/church';
import Event from '../models/event';
import Member from '../models/member';
import Fellowship from '../models/fellowship';
import Attendance from '../models/attendance';
import ServiceTime from '../models/serviceTime';
import Sermon from '../models/sermon';
import Donation from '../models/donation';
import { mongoConnect } from '../../utils/connectDb';
import { logger } from '../../utils/logger';

mongoConnect();

const ONBOARDING_TOTAL_TASKS = 7;

const normalizeObjectId = (value) => (value instanceof mongoose.Types.ObjectId ? value : new mongoose.Types.ObjectId(value));

const calculateCompletionPercentage = (completedCount, totalCount) => {
  if (!totalCount) {
    return 0;
  }

  return Math.round((completedCount / totalCount) * 100);
};

const isChurchProfileCompleted = (church) => {
  if (!church) {
    return false;
  }

  const hasAddress = Boolean(
    church.address?.completeAddress
    || (church.address?.addressLine1 && church.address?.town && church.address?.country)
  );

  return Boolean(
    church.name?.trim()
    && church.email?.trim()
    && church.mobile?.trim()
    && church.description?.trim()
    && hasAddress
  );
};

const buildOnboardingPayload = ({ church, counts }) => {
  const tasks = {
    churchProfile: isChurchProfileCompleted(church),
    firstService: counts.services > 0,
    members: counts.members > 0,
    leaders: counts.leaders > 0,
    fellowships: counts.fellowships > 0,
    attendance: counts.attendance > 0,
    sermons: counts.sermons > 0
  };
  const completedCount = Object.values(tasks).filter(Boolean).length;
  const completed = completedCount === ONBOARDING_TOTAL_TASKS;

  return {
    dismissed: Boolean(church?.onboarding?.welcomeModalDismissed),
    setupChecklistDismissed: Boolean(church?.onboarding?.setupChecklistDismissed),
    completedCount,
    totalCount: ONBOARDING_TOTAL_TASKS,
    percentage: calculateCompletionPercentage(completedCount, ONBOARDING_TOTAL_TASKS),
    completed,
    tasks
  };
};

const getDashboardBaseData = async (churchId) => {
  const churchObjectId = normalizeObjectId(churchId);
  const churchFilter = { _id: churchObjectId };
  const suidFilter = { suid: churchObjectId };
  const memberFilter = { church: churchObjectId };
  const attendanceFilter = { church: churchObjectId };

  const [
    church,
    eventsCount,
    membersCount,
    fellowshipsCount,
    servicesCount,
    sermonsCount,
    donationsCount,
    attendanceCount,
    leadersCount,
    peakAttendanceResult,
    upcomingEventsCount
  ] = await Promise.all([
    Church.findOne(churchFilter).lean(),
    Event.countDocuments(suidFilter),
    Member.countDocuments(memberFilter),
    Fellowship.countDocuments(suidFilter),
    ServiceTime.countDocuments(suidFilter),
    Sermon.countDocuments({ churchId: churchObjectId }),
    Donation.countDocuments(suidFilter),
    Attendance.countDocuments(attendanceFilter),
    Member.countDocuments({
      church: churchObjectId,
      role: { $in: ['leader', 'pastor'] }
    }),
    Attendance.aggregate([
      { $match: attendanceFilter },
      {
        $group: {
          _id: null,
          peak: { $max: '$count' }
        }
      }
    ]),
    Event.countDocuments({
      ...suidFilter,
      end_date: { $gte: new Date() }
    })
  ]);

  const peakAttendance = peakAttendanceResult.length > 0 ? peakAttendanceResult[0].peak : 0;
  const counts = {
    events: eventsCount,
    upcomingEvents: upcomingEventsCount,
    members: membersCount,
    fellowships: fellowshipsCount,
    services: servicesCount,
    sermons: sermonsCount,
    donations: donationsCount,
    attendance: attendanceCount,
    leaders: leadersCount,
    peakAttendance
  };

  return {
    church,
    counts,
    onboarding: buildOnboardingPayload({ church, counts })
  };
};

const syncOnboardingStateIfNeeded = async (churchId, church, onboarding) => {
  if (!church) {
    return;
  }

  const currentCompleted = Boolean(church.onboarding?.onboardingCompleted);

  if (currentCompleted === onboarding.completed) {
    return;
  }

  await Church.updateOne(
    { _id: normalizeObjectId(churchId) },
    {
      $set: {
        'onboarding.onboardingCompleted': onboarding.completed
      }
    }
  );
};

/**
 * Get aggregated counts for dashboard
 * @param {string} churchId - Optional church/organization ID to filter by
 * @returns {Promise<Object>} Object containing counts for events, members, fellowships, and service times
 */
export async function getDashboardAggregates(churchId = null) {
  try {
    const { church, counts, onboarding } = await getDashboardBaseData(churchId);

    await syncOnboardingStateIfNeeded(churchId, church, onboarding);

    return {
      success: true,
      data: {
        events: counts.events,
        upcomingEvents: counts.upcomingEvents,
        members: counts.members,
        fellowships: counts.fellowships,
        services: counts.services,
        sermons: counts.sermons,
        donations: counts.donations,
        attendance: counts.attendance,
        leaders: counts.leaders,
        peakAttendance: counts.peakAttendance,
        total:
          counts.events +
          counts.members +
          counts.fellowships +
          counts.peakAttendance,
        onboarding,
        churchProfile: {
          name: church?.name || '',
          email: church?.email || '',
          mobile: church?.mobile || ''
        }
      }
    };
  } catch (error) {
    logger.error(error);
    return {
      success: false,
      error: error.message,
      data: {
        events: 0,
        upcomingEvents: 0,
        members: 0,
        fellowships: 0,
        services: 0,
        sermons: 0,
        donations: 0,
        attendance: 0,
        leaders: 0,
        peakAttendance: 0,
        total: 0,
        onboarding: {
          dismissed: false,
          setupChecklistDismissed: false,
          completedCount: 0,
          totalCount: ONBOARDING_TOTAL_TASKS,
          percentage: 0,
          completed: false,
          tasks: {
            churchProfile: false,
            firstService: false,
            members: false,
            leaders: false,
            fellowships: false,
            attendance: false,
            sermons: false
          }
        }
      }
    };
  }
}
/**
 * Get detailed aggregated data with additional statistics
 * @param {string} churchId - Optional church/organization ID to filter by
 * @returns {Promise<Object>} Object containing detailed counts and statistics
 */
export async function getDashboardStatistics(churchId = null) {
  try {
    const { church, counts, onboarding } = await getDashboardBaseData(churchId);

    await syncOnboardingStateIfNeeded(churchId, church, onboarding);

    // Get member status breakdown
    const membersByStatus = await Member.aggregate([
      { $match: churchId ? { church: normalizeObjectId(churchId) } : {} },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get member role breakdown
    const membersByRole = await Member.aggregate([
      { $match: churchId ? { church: normalizeObjectId(churchId) } : {} },
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    return {
      success: true,
      data: {
        summary: {
          events: counts.events,
          upcomingEvents: counts.upcomingEvents,
          members: counts.members,
          fellowships: counts.fellowships,
          services: counts.services,
          sermons: counts.sermons,
          donations: counts.donations,
          attendance: counts.attendance,
          leaders: counts.leaders,
          peakAttendance: counts.peakAttendance,
          total: counts.events + counts.members + counts.fellowships + counts.peakAttendance
        },
        memberBreakdown: {
          byStatus: membersByStatus.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}),
          byRole: membersByRole.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {})
        },
        onboarding
      }
    };
  } catch (error) {
    logger.error(error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
}

export default { getDashboardAggregates, getDashboardStatistics };
