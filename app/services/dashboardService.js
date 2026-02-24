import Event from '../models/event';
import Member from '../models/member';
import Fellowship from '../models/fellowship';
import ServiceTime from '../models/serviceTime';
import { mongoConnect } from '@/utils/connectDb';
import { logger } from '../../utils/logger';

mongoConnect();

/**
 * Get aggregated counts for dashboard
 * @param {string} churchId - Optional church/organization ID to filter by
 * @returns {Promise<Object>} Object containing counts for events, members, fellowships, and service times
 */
export async function getDashboardAggregates(churchId = null) {
  try {
    const filter = churchId ? { suid: churchId } : {};
    const memberFilter = churchId ? { church: churchId } : {};

    const [eventsCount, membersCount, fellowshipsCount, serviceTimesCount] = await Promise.all([
      Event.countDocuments(filter),
      Member.countDocuments(memberFilter),
      Fellowship.countDocuments(filter),
      ServiceTime.countDocuments(filter)
    ]);

    return {
      success: true,
      data: {
        events: eventsCount,
        members: membersCount,
        fellowships: fellowshipsCount,
        serviceTimes: serviceTimesCount,
        total: eventsCount + membersCount + fellowshipsCount + serviceTimesCount
      }
    };
  } catch (error) {
    logger.error(error);
    return {
      success: false,
      error: error.message,
      data: {
        events: 0,
        members: 0,
        fellowships: 0,
        serviceTimes: 0,
        total: 0
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
    const filter = churchId ? { suid: churchId } : {};
    const memberFilter = churchId ? { church: churchId } : {};

    // Get counts
    const eventsCount = await Event.countDocuments(filter);
    const membersCount = await Member.countDocuments(memberFilter);
    const fellowshipsCount = await Fellowship.countDocuments(filter);
    const serviceTimesCount = await ServiceTime.countDocuments(filter);

    // Get member status breakdown
    const membersByStatus = await Member.aggregate([
      { $match: churchId ? { church: churchId } : {} },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get member role breakdown
    const membersByRole = await Member.aggregate([
      { $match: churchId ? { church: churchId } : {} },
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
          events: eventsCount,
          members: membersCount,
          fellowships: fellowshipsCount,
          serviceTimes: serviceTimesCount,
          total: eventsCount + membersCount + fellowshipsCount + serviceTimesCount
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
        }
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
