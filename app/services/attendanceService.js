import mongoose from 'mongoose';
import { attendanceValidator } from '../validation/attendanceValidator';
import { identifierValidator } from '../validation/identifierValidator';
import { logger } from '../../utils/logger';
import ServiceTime from '../models/serviceTime';
import Attendance from '../models/attendance';
import CareFollowUp from '../models/careFollowUp';
import Member from '../models/member';
import { mongoConnect } from '../../utils/connectDb';

mongoConnect();

const OPEN_CARE_STATUSES = ['OPEN', 'CONTACTED', 'VISITED'];

const CARE_SIGNAL = {
  NO_ACTION: 'NO_ACTION',
  OPTIONAL: 'OPTIONAL',
  REVIEW: 'REVIEW',
  NEEDS_CARE: 'NEEDS_CARE',
  URGENT: 'URGENT'
};

const SERVICE_DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const getFullName = (person) => {
  if (!person) {
    return '';
  }

  return `${person.first_name || ''} ${person.last_name || ''}`.trim();
};

const isOpenCareCase = (followUp) => Boolean(followUp && OPEN_CARE_STATUSES.includes(followUp.status));

const getCareSignal = ({ status, wantsPastorContact, message, careFollowUp }) => {
  if (status === 'SICK' || status === 'NEEDS_PRAYER' || wantsPastorContact) {
    return CARE_SIGNAL.URGENT;
  }

  if (isOpenCareCase(careFollowUp) || status === 'ABSENT') {
    return CARE_SIGNAL.NEEDS_CARE;
  }

  if (status === 'JOINED_ONLINE' || status === 'WORKING' || status === 'FAMILY_COMMITMENT') {
    return CARE_SIGNAL.OPTIONAL;
  }

  if (status === 'OTHER' || (message || '').trim()) {
    return CARE_SIGNAL.REVIEW;
  }

  return CARE_SIGNAL.NO_ACTION;
};

const getQueueMatch = (record, queue) => {
  if (!queue || queue === 'ALL') {
    return true;
  }

  if (queue === 'ATTENTION_REQUIRED') {
    return [CARE_SIGNAL.REVIEW, CARE_SIGNAL.NEEDS_CARE, CARE_SIGNAL.URGENT].includes(record.careSignal);
  }

  if (queue === 'OPEN_CARE_CASES') {
    return record.hasOpenCareCase;
  }

  if (queue === 'URGENT') {
    return record.careSignal === CARE_SIGNAL.URGENT;
  }

  if (queue === 'NEEDS_CARE') {
    return record.careSignal === CARE_SIGNAL.NEEDS_CARE;
  }

  return true;
};

const formatServiceSchedule = (service) => {
  if (!service) {
    return '';
  }

  const days = Array.isArray(service.days)
    ? service.days.map((day) => SERVICE_DAY_LABELS[day]).filter(Boolean).join(', ')
    : '';

  return [days, service.start_time].filter(Boolean).join(' • ');
};

const buildAttendanceRecord = (record, careFollowUp) => {
  const careSignal = getCareSignal({
    status: record.status,
    wantsPastorContact: record.wantsPastorContact,
    message: record.message,
    careFollowUp
  });

  const ownerName = getFullName(careFollowUp?.assignedTo);
  const lastActionAt = careFollowUp?.updatedAt || careFollowUp?.createdAt || record.submittedAt || record.createdAt;

  return {
    ...record,
    careFollowUp: careFollowUp || null,
    careSignal,
    hasOpenCareCase: isOpenCareCase(careFollowUp),
    careCaseStatus: careFollowUp?.status || null,
    careCaseOwner: ownerName || null,
    lastActionAt,
    responseSummary: record.message || 'No response submitted',
    attendanceOutcome: record.status,
    memberName: getFullName(record.memberId) || 'Unknown Member',
    serviceSummary: formatServiceSchedule(record.serviceId)
  };
};

const getAttentionCountFromStats = (stats) => {
  return (stats.absent || 0)
    + (stats.sick || 0)
    + (stats.needsPrayer || 0)
    + (stats.joinedOnline || 0)
    + (stats.working || 0)
    + (stats.other || 0)
    + (stats.pastorContactRequested || 0);
};

const getOpenCareCaseCountForService = async (serviceId, options = {}) => {
  const { startDate, endDate } = options;
  const attendanceQuery = { serviceId };

  if (startDate || endDate) {
    attendanceQuery.submittedAt = {};
    if (startDate) attendanceQuery.submittedAt.$gte = new Date(startDate);
    if (endDate) attendanceQuery.submittedAt.$lte = new Date(endDate);
  }

  const attendanceIds = await Attendance.find(attendanceQuery).distinct('_id');

  if (!attendanceIds.length) {
    return 0;
  }

  return CareFollowUp.countDocuments({
    attendanceId: { $in: attendanceIds },
    status: { $in: OPEN_CARE_STATUSES }
  });
};

const getAttendanceDashboard = async (churchId, options = {}) => {
  try {
    const { serviceId, startDate, endDate } = options;
    const [expectedMembers, services] = await Promise.all([
      Member.countDocuments({
        church: churchId,
        status: { $in: ['active', 'provisional'] }
      }),
      ServiceTime.find({ suid: churchId }).sort({ sequency_no: 1, title: 1 }).lean()
    ]);

    const activeServiceId = serviceId || services[0]?._id?.toString() || null;
    const stats = activeServiceId
      ? await getAttendanceStatistics(churchId, { serviceId: activeServiceId, startDate, endDate })
      : await getAttendanceStatistics(churchId, { startDate, endDate });

    const [openCareCases, serviceCards] = await Promise.all([
      activeServiceId ? getOpenCareCaseCountForService(activeServiceId, { startDate, endDate }) : Promise.resolve(0),
      Promise.all(
        services.map(async (service) => {
          const serviceStats = await getAttendanceStatistics(churchId, { serviceId: service._id.toString(), startDate, endDate });
          const serviceOpenCases = await getOpenCareCaseCountForService(service._id, { startDate, endDate });
          const submitted = serviceStats.totalSubmissions || 0;
          const attendanceRate = expectedMembers > 0
            ? Math.round((submitted / expectedMembers) * 100)
            : 0;

          return {
            ...service,
            schedule: formatServiceSchedule(service),
            attendanceSubmitted: submitted,
            expectedMembers,
            attendanceRate,
            needAttention: getAttentionCountFromStats(serviceStats),
            openCareCases: serviceOpenCases
          };
        })
      )
    ]);

    return {
      activeServiceId,
      expectedMembers,
      statistics: stats,
      kpis: {
        expectedMembers,
        attendanceSubmitted: stats.totalSubmissions || 0,
        needAttention: getAttentionCountFromStats(stats),
        openCareCases
      },
      serviceCards,
      summaryQueues: [
        { key: 'ALL', label: 'All', count: stats.totalSubmissions || 0 },
        { key: 'PRESENT_IN_CHURCH', label: 'Present', count: stats.presentInChurch || 0 },
        { key: 'JOINED_ONLINE', label: 'Online', count: stats.joinedOnline || 0 },
        { key: 'ABSENT', label: 'Absent', count: stats.absent || 0 },
        { key: 'SICK', label: 'Sick', count: stats.sick || 0 },
        { key: 'NEEDS_PRAYER', label: 'Needs Prayer', count: stats.needsPrayer || 0 },
        { key: 'ATTENTION_REQUIRED', label: 'Attention Needed', count: getAttentionCountFromStats(stats) }
      ]
    };
  } catch (error) {
    logger.error(error);
    throw new Error(error.message || 'Error fetching attendance dashboard');
  }
};

const add = async (body) => {
  try {
    const bodyErrors = attendanceValidator(body);
    if (bodyErrors.length) {
      const error = new Error(bodyErrors.map((it) => it.message).join(','));
      error.invalidArgs = bodyErrors.map((it) => it.field).join(',');
      throw error;
    }

    const { church, service, checkInTime, count = 1 } = body;

    const startOfDay = new Date(checkInTime);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(checkInTime);
    endOfDay.setHours(23, 59, 59, 999);

    const existing = await Attendance.findOne({
      church,
      service,
      checkInTime: { $gte: startOfDay, $lte: endOfDay }
    });

    if (existing) {
      existing.count += count;
      const updated = await existing.save();
      return updated;
    } else {
      const newAttendance = new Attendance({
        church,
        service,
        checkInTime,
        count
      });
      const result = await newAttendance.save();
      return result;
    }
  } catch (error) {
    logger.error(error);
    throw new Error('Error adding attendance');
  }
};

async function remove(id) {
  try {
    const identifierValidateResult = identifierValidator(id);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }
    await Attendance.findByIdAndRemove(id);
    return true;
  } catch (error) {
    logger.error(error);
    throw new Error('Error deleting attendance');
  }
}

const services = [
  {
    _id: "696be06803ad97f1331f2a0a", // Sunday
    days: [0],
    start_time: "09:00"
  },
  {
    _id: "696be06803ad97f1331f2a0e", // Wednesday
    days: [3],
    start_time: "11:00"
  },
  {
    _id: "696be06803ad97f1331f2a12", // Friday
    days: [5],
    start_time: "13:00"
  }
];

export const seedNext14DaysAttendance = async (churchId) => {
  try {
    const today = new Date();
    const records = [];

    for (let i = 6; i >= 0; i--) {
      const currentDate = new Date();
      currentDate.setDate(today.getDate() - i);

      const dayOfWeek = currentDate.getDay();

      const service = services.find(s => s.days.includes(dayOfWeek));

      if (!service) continue;

      const [hour, minute] = service.start_time.split(":");
      currentDate.setHours(Number(hour), Number(minute), 0, 0);

      // Optional: weighted realism
      let attendance;

      if (service.days.includes(0)) {
        // Sunday (highest)
        attendance = Math.floor(Math.random() * (350 - 200) + 200);
      } else if (service.days.includes(3)) {
        // Wednesday (medium)
        attendance = Math.floor(Math.random() * (200 - 120) + 120);
      } else if (service.days.includes(5)) {
        // Friday (lower)
        attendance = Math.floor(Math.random() * (160 - 80) + 80);
      } else {
        attendance = Math.floor(Math.random() * (200 - 80) + 80);
      }

      records.push({
        church: new mongoose.Types.ObjectId(churchId),
        service: new mongoose.Types.ObjectId(service._id),
        count: attendance,
        checkInTime: currentDate,
      });
    }

    if (records.length === 0) {
      console.log("No matching service days found.");
      return [];
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    await Attendance.deleteMany({
      church: churchId,
      checkInTime: {
        $gte: sevenDaysAgo,
        $lte: today
      }
    });

    const inserted = await Attendance.insertMany(records);

    console.log(`Inserted ${inserted.length} attendance records for last 7 days.`);
    return inserted;

  } catch (error) {
    console.error("Error seeding attendance:", error);
    throw error;
  }
};

const getAttendanceTrends = async (churchId) => {
  try {
    const now = new Date();
    const startDate = new Date(now);
    const dayOfWeek = now.getDay();
    startDate.setDate(now.getDate() - dayOfWeek);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);

    const results = await Attendance.find({
      church: churchId,
      checkInTime: {
        $gte: startDate,
        $lte: endDate
      }
    })
      .sort({ checkInTime: 1 })
      .populate({
        path: 'service',
        select: 'title'
      });

    return results;
  } catch (error) {
    console.error('Error filtering attendance records:', error);
    throw error;
  }
};

const getMemberAttendanceStats = async (memberId) => {
  try {
    const identifierValidateResult = identifierValidator(memberId);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }

    return await Attendance.aggregate([
      { $match: { memberId: mongoose.Types.ObjectId(memberId) } },
      {
        $group: {
          _id: null,
          totalServicesAttended: { $sum: 1 },
          firstAttendance: { $min: '$checkInTime' },
          lastAttendance: { $max: '$checkInTime' },
          averagePerMonth: {
            $avg: {
              $dateDiff: {
                startDate: '$checkInTime',
                endDate: new Date(),
                unit: 'month'
              }
            }
          }
        }
      },
      {
        $lookup: {
          from: 'members',
          localField: 'memberId',
          foreignField: '_id',
          as: 'memberDetails'
        }
      },
      { $unwind: '$memberDetails' }
    ]);
  } catch (error) {
    logger.error(error);
    throw new Error('Error generating member stats');
  }
};

const getServiceAttendanceSummary = async (serviceId) => {
  try {
    const identifierValidateResult = identifierValidator(serviceId);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }

    return await Attendance.aggregate([
      { $match: { serviceId: mongoose.Types.ObjectId(serviceId) } },
      {
        $group: {
          _id: '$serviceId',
          totalAttendees: { $sum: 1 },
          members: {
            $sum: {
              $cond: [{ $ifNull: ['$memberId', false] }, 1, 0]
            }
          },
          firstCheckIn: { $min: '$checkInTime' },
          lastCheckIn: { $max: '$checkInTime' }
        }
      },
      {
        $lookup: {
          from: 'services',
          localField: '_id',
          foreignField: '_id',
          as: 'serviceDetails'
        }
      },
      { $unwind: '$serviceDetails' }
    ]);
  } catch (error) {
    logger.error(error);
    throw new Error('Error generating service summary');
  }
};

// New methods for extended attendance management

const createAttendance = async (body) => {
  try {
    const { memberId, userId, serviceId, status, message, checkedInVia, wantsPastorContact, churchId } = body;

    if (!memberId && !userId) {
      throw new Error('Either memberId or userId is required');
    }

    if (!serviceId) {
      throw new Error('serviceId is required');
    }

    // Check for duplicate submission (member can only submit once per service)
    const duplicateChecks = [];

    if (memberId) {
      duplicateChecks.push({ memberId, serviceId });
    }

    if (userId) {
      duplicateChecks.push({ userId, serviceId });
    }

    const existing = duplicateChecks.length > 0
      ? await Attendance.findOne({ $or: duplicateChecks })
      : null;

    if (existing) {
      throw new Error('Attendance already submitted for this service');
    }

    const newAttendance = new Attendance({
      memberId,
      userId,
      serviceId,
      status: status || 'PRESENT_IN_CHURCH',
      message,
      checkedInVia: checkedInVia || 'MANUAL',
      wantsPastorContact: wantsPastorContact || false,
      submittedAt: new Date(),
      church: churchId
    });

    const saved = await newAttendance.save();

    // Create CareFollowUp if needed
    if (status === 'SICK' || status === 'NEEDS_PRAYER' || wantsPastorContact) {
      const reason = status === 'SICK' ? 'SICK' : status === 'NEEDS_PRAYER' ? 'NEEDS_PRAYER' : 'OTHER';

      const followUp = new CareFollowUp({
        memberId,
        userId,
        attendanceId: saved._id,
        reason,
        note: message,
        priority: reason === 'SICK' || reason === 'NEEDS_PRAYER' ? 'HIGH' : 'MEDIUM',
        status: 'OPEN'
      });

      await followUp.save();
    }

    return saved;
  } catch (error) {
    logger.error(error);
    throw new Error(error.message || 'Error creating attendance');
  }
};

const updateAttendance = async (attendanceId, body) => {
  try {
    const { status, message, wantsPastorContact, notes } = body;

    const attendance = await Attendance.findById(attendanceId);
    if (!attendance) {
      throw new Error('Attendance record not found');
    }

    // Update allowed fields only
    if (status) attendance.status = status;
    if (message !== undefined) attendance.message = message;
    if (wantsPastorContact !== undefined) attendance.wantsPastorContact = wantsPastorContact;

    const updated = await attendance.save();

    // Handle CareFollowUp status changes if needed
    if (status || notes) {
      const followUp = await CareFollowUp.findOne({ attendanceId });
      if (followUp) {
        if (status === 'SICK' || status === 'NEEDS_PRAYER' || wantsPastorContact) {
          followUp.status = 'OPEN';
        }
        if (notes) followUp.note = notes;
        await followUp.save();
      } else if (status === 'SICK' || status === 'NEEDS_PRAYER' || wantsPastorContact) {
        await CareFollowUp.create({
          userId: attendance.userId,
          memberId: attendance.memberId,
          attendanceId: attendance._id,
          reason: status === 'SICK' ? 'SICK' : status === 'NEEDS_PRAYER' ? 'NEEDS_PRAYER' : 'OTHER',
          note: notes || message,
          priority: status === 'SICK' || status === 'NEEDS_PRAYER' ? 'HIGH' : 'MEDIUM',
          status: 'OPEN'
        });
      }
    }

    return updated;
  } catch (error) {
    logger.error(error);
    throw new Error(error.message || 'Error updating attendance');
  }
};

const getAttendanceById = async (attendanceId) => {
  try {
    const attendance = await Attendance.findById(attendanceId)
      .populate('memberId', 'first_name last_name email')
      .populate('userId', 'first_name last_name email')
      .populate('serviceId', 'title start_time days');

    if (!attendance) {
      throw new Error('Attendance record not found');
    }

    const careFollowUp = await CareFollowUp.findOne({ attendanceId: attendance._id })
      .populate('assignedTo', 'first_name last_name email');

    return {
      ...attendance.toObject(),
      careFollowUp
    };
  } catch (error) {
    logger.error(error);
    throw new Error(error.message || 'Error fetching attendance');
  }
};

const getAttendanceByService = async (serviceId, options = {}) => {
  try {
    const { page = 1, limit = 10, status, queue, searchQuery, startDate, endDate } = options;
    const skip = (page - 1) * limit;

    const query = { serviceId: new mongoose.Types.ObjectId(serviceId) };
    if (status && !['ALL', 'ATTENTION_REQUIRED', 'OPEN_CARE_CASES', 'URGENT', 'NEEDS_CARE'].includes(status)) {
      query.status = status;
    }
    if (startDate || endDate) {
      query.submittedAt = {};
      if (startDate) query.submittedAt.$gte = new Date(startDate);
      if (endDate) query.submittedAt.$lte = new Date(endDate);
    }

    const records = await Attendance.find(query)
      .populate('memberId', 'first_name last_name email mobile')
      .populate('userId', 'first_name last_name email')
      .populate('serviceId', 'title start_time days')
      .sort({ submittedAt: -1, createdAt: -1 })
      .lean();

    const followUps = await CareFollowUp.find({
      attendanceId: { $in: records.map((record) => record._id) }
    })
      .populate('assignedTo', 'first_name last_name email')
      .lean();

    const followUpByAttendanceId = new Map(
      followUps.map((followUp) => [String(followUp.attendanceId), followUp])
    );

    const transformed = records.map((record) => buildAttendanceRecord(
      record,
      followUpByAttendanceId.get(String(record._id)) || null
    ));

    const selectedQueue = queue || status || 'ALL';
    const normalizedSearch = searchQuery?.trim().toLowerCase();
    const filtered = transformed.filter((record) => {
      const matchesQueue = getQueueMatch(record, selectedQueue);

      if (!matchesQueue) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const haystacks = [
        record.memberName,
        record.responseSummary,
        record.attendanceOutcome,
        record.careSignal,
        record.careCaseStatus
      ]
        .filter(Boolean)
        .map((value) => String(value).toLowerCase());

      return haystacks.some((value) => value.includes(normalizedSearch));
    });
    const total = filtered.length;
    const data = filtered.slice(skip, skip + limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    logger.error(error);
    throw new Error(error.message || 'Error fetching service attendance');
  }
};

const getAttendanceByMember = async (memberId, options = {}) => {
  try {
    const { page = 1, limit = 10, status, startDate, endDate } = options;
    const skip = (page - 1) * limit;

    const query = { memberId };
    if (status) query.status = status;

    if (startDate || endDate) {
      query.submittedAt = {};
      if (startDate) query.submittedAt.$gte = new Date(startDate);
      if (endDate) query.submittedAt.$lte = new Date(endDate);
    }

    const total = await Attendance.countDocuments(query);
    const records = await Attendance.find(query)
      .populate('serviceId', 'title start_time days')
      .skip(skip)
      .limit(limit)
      .sort({ submittedAt: -1 });

    return {
      data: records,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    logger.error(error);
    throw new Error(error.message || 'Error fetching member attendance');
  }
};

const getAttendanceHistory = async (memberId, options = {}) => {
  try {
    const { limit = 20, status } = options;

    const query = { memberId };
    if (status) query.status = status;

    const records = await Attendance.find(query)
      .populate('serviceId', 'title start_time days')
      .limit(limit)
      .sort({ submittedAt: -1 });

    return records;
  } catch (error) {
    logger.error(error);
    throw new Error(error.message || 'Error fetching attendance history');
  }
};

const getAttendanceStatistics = async (churchId, options = {}) => {
  try {
    const { startDate, endDate, serviceId } = options;

    const query = { church: new mongoose.Types.ObjectId(churchId) };
    if (serviceId) {
      query.serviceId = new mongoose.Types.ObjectId(serviceId);
    }
    if (startDate || endDate) {
      query.submittedAt = {};
      if (startDate) query.submittedAt.$gte = new Date(startDate);
      if (endDate) query.submittedAt.$lte = new Date(endDate);
    }

    const stats = await Attendance.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalSubmissions: { $sum: 1 },
          presentInChurch: { $sum: { $cond: [{ $eq: ['$status', 'PRESENT_IN_CHURCH'] }, 1, 0] } },
          joinedOnline: { $sum: { $cond: [{ $eq: ['$status', 'JOINED_ONLINE'] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ['$status', 'ABSENT'] }, 1, 0] } },
          sick: { $sum: { $cond: [{ $eq: ['$status', 'SICK'] }, 1, 0] } },
          travelling: { $sum: { $cond: [{ $eq: ['$status', 'TRAVELLING'] }, 1, 0] } },
          working: { $sum: { $cond: [{ $eq: ['$status', 'WORKING'] }, 1, 0] } },
          familyCommitment: { $sum: { $cond: [{ $eq: ['$status', 'FAMILY_COMMITMENT'] }, 1, 0] } },
          needsPrayer: { $sum: { $cond: [{ $eq: ['$status', 'NEEDS_PRAYER'] }, 1, 0] } },
          other: { $sum: { $cond: [{ $eq: ['$status', 'OTHER'] }, 1, 0] } },
          pastorContactRequested: { $sum: { $cond: [{ $eq: ['$wantsPastorContact', true] }, 1, 0] } }
        }
      }
    ]);

    return stats[0] || {
      totalSubmissions: 0,
      presentInChurch: 0,
      joinedOnline: 0,
      absent: 0,
      sick: 0,
      travelling: 0,
      working: 0,
      familyCommitment: 0,
      needsPrayer: 0,
      other: 0,
      pastorContactRequested: 0
    };
  } catch (error) {
    logger.error(error);
    throw new Error(error.message || 'Error fetching attendance statistics');
  }
};

export { 
  add, 
  remove, 
  getAttendanceTrends, 
  getMemberAttendanceStats, 
  getServiceAttendanceSummary,
  createAttendance,
  updateAttendance,
  getAttendanceById,
  getAttendanceByService,
  getAttendanceByMember,
  getAttendanceHistory,
  getAttendanceStatistics,
  getAttendanceDashboard
};
