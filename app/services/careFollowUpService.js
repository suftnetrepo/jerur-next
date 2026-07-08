import CareFollowUp from '../models/careFollowUp';
import Member from '../models/member';
import User from '../models/user';
import { logger } from '../../utils/logger';
import { mongoConnect } from '../../utils/connectDb';

mongoConnect();

const buildRegex = (value) => new RegExp(value.trim(), 'i');

const buildScopedQuery = async ({ churchId, currentUserId, status, assignedTo, priority, searchQuery } = {}) => {
  const churchUsers = await User.find({ church: churchId }).distinct('_id');
  const scopedMemberQuery = { church: churchId };

  if (searchQuery && searchQuery.trim()) {
    const regex = buildRegex(searchQuery);
    scopedMemberQuery.$or = [
      { first_name: regex },
      { last_name: regex },
      { email: regex },
      { mobile: regex }
    ];
  }

  const churchMembers = await Member.find(scopedMemberQuery).distinct('_id');
  const baseOr = [];

  if (churchMembers.length) {
    baseOr.push({ memberId: { $in: churchMembers } });
  }

  if (churchUsers.length) {
    baseOr.push({ userId: { $in: churchUsers } });
    baseOr.push({ assignedTo: { $in: churchUsers } });
  }

  if (!baseOr.length) {
    return { _id: null };
  }

  const clauses = [{ $or: baseOr }];

  if (searchQuery && searchQuery.trim()) {
    clauses.push({ memberId: { $in: churchMembers } });
  }

  if (status && status !== 'ALL') {
    clauses.push({ status });
  }

  if (assignedTo && assignedTo !== 'ALL') {
    clauses.push({ assignedTo: assignedTo === 'ME' ? currentUserId : assignedTo });
  }

  if (priority && priority !== 'ALL') {
    clauses.push({ priority });
  }

  return clauses.length === 1 ? clauses[0] : { $and: clauses };
};

const withIdConstraint = (query, id) => {
  if (query?.$and) {
    return { $and: [...query.$and, { _id: id }] };
  }

  return { ...query, _id: id };
};

const populateCaseQuery = (query) => {
  return query
    .populate('userId', 'first_name last_name email')
    .populate('memberId', 'first_name last_name email mobile church')
    .populate({
      path: 'attendanceId',
      populate: [
        { path: 'serviceId', select: 'title start_time days' },
        { path: 'memberId', select: 'first_name last_name email' }
      ]
    })
    .populate('assignedTo', 'first_name last_name email');
};

const createCareFollowUp = async (body) => {
  try {
    const { userId, memberId, attendanceId, assignedTo, reason, note, priority, status } = body;

    if ((!userId && !memberId) || !reason) {
      throw new Error('reason and either userId or memberId are required');
    }

    if (attendanceId) {
      const existing = await CareFollowUp.findOne({ attendanceId });
      if (existing) {
        throw new Error('Care follow-up already exists for this attendance record');
      }
    }

    const careFollowUp = new CareFollowUp({
      userId,
      memberId,
      attendanceId,
      assignedTo,
      reason,
      note,
      priority: priority || 'MEDIUM',
      status: status || 'OPEN'
    });

    await careFollowUp.save();
    return careFollowUp;
  } catch (error) {
    logger.error(error);
    throw new Error(error.message || 'Error creating care follow-up');
  }
};

const updateCareFollowUp = async (id, body) => {
  try {
    const { userId, memberId, assignedTo, reason, note, priority, status } = body;
    const updatePayload = Object.fromEntries(
      Object.entries({ userId, memberId, assignedTo, reason, note, priority, status }).filter(([, value]) => value !== undefined)
    );

    const careFollowUp = await CareFollowUp.findByIdAndUpdate(
      id,
      updatePayload,
      { new: true, runValidators: true }
    );

    if (!careFollowUp) {
      throw new Error('Care follow-up not found');
    }

    return careFollowUp;
  } catch (error) {
    logger.error(error);
    throw new Error(error.message || 'Error updating care follow-up');
  }
};

const deleteCareFollowUp = async (id) => {
  try {
    const careFollowUp = await CareFollowUp.findByIdAndDelete(id);

    if (!careFollowUp) {
      throw new Error('Care follow-up not found');
    }

    return careFollowUp;
  } catch (error) {
    logger.error(error);
    throw new Error(error.message || 'Error deleting care follow-up');
  }
};

const getCareFollowUpById = async (id, options = {}) => {
  try {
    const query = options.churchId
      ? withIdConstraint(await buildScopedQuery({ churchId: options.churchId, currentUserId: options.currentUserId }), id)
      : { _id: id };

    const careFollowUp = await populateCaseQuery(CareFollowUp.findOne(query));

    if (!careFollowUp) {
      throw new Error('Care follow-up not found');
    }

    return careFollowUp;
  } catch (error) {
    logger.error(error);
    throw new Error(error.message || 'Error fetching care follow-up');
  }
};

const getAllCareFollowUps = async ({ churchId, currentUserId, page = 1, limit = 10, sortField = 'updatedAt', sortOrder = 'desc', status = 'ALL', assignedTo = 'ALL', priority = 'ALL', searchQuery = '' } = {}) => {
  try {
    const skip = (page - 1) * limit;
    const sortOptions = {};
    sortOptions[sortField] = sortOrder === 'desc' ? -1 : 1;
    const query = await buildScopedQuery({ churchId, currentUserId, status, assignedTo, priority, searchQuery });

    const [followUps, totalCount] = await Promise.all([
      populateCaseQuery(
        CareFollowUp.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
      ),
      CareFollowUp.countDocuments(query)
    ]);

    return {
      data: followUps,
      totalCount,
      page,
      limit,
      pages: Math.ceil(totalCount / limit)
    };
  } catch (error) {
    logger.error(error);
    throw new Error(error.message || 'Error fetching care follow-ups');
  }
};

const getFollowUpsByStatus = async (status, options = {}) => {
  try {
    return getAllCareFollowUps({ ...options, status });
  } catch (error) {
    logger.error(error);
    throw new Error(error.message || 'Error fetching follow-ups by status');
  }
};

const getFollowUpsAssignedTo = async (userId, options = {}) => {
  try {
    return getAllCareFollowUps({ ...options, assignedTo: userId });
  } catch (error) {
    logger.error(error);
    throw new Error(error.message || 'Error fetching assigned follow-ups');
  }
};

const getCareFollowUpDashboard = async ({ churchId, currentUserId }) => {
  try {
    const [openCases, assignedToMe, contacted, closed] = await Promise.all([
      CareFollowUp.countDocuments(await buildScopedQuery({ churchId, currentUserId, status: 'OPEN' })),
      CareFollowUp.countDocuments(await buildScopedQuery({ churchId, currentUserId, assignedTo: 'ME' })),
      CareFollowUp.countDocuments(await buildScopedQuery({ churchId, currentUserId, status: 'CONTACTED' })),
      CareFollowUp.countDocuments(await buildScopedQuery({ churchId, currentUserId, status: 'CLOSED' }))
    ]);

    return {
      currentUserId,
      kpis: {
        openCases,
        assignedToMe,
        contacted,
        closed
      }
    };
  } catch (error) {
    logger.error(error);
    throw new Error(error.message || 'Error fetching care follow-up dashboard');
  }
};

const closeFollowUp = async (id, note) => {
  try {
    const careFollowUp = await CareFollowUp.findByIdAndUpdate(
      id,
      {
        status: 'CLOSED',
        note: note || null
      },
      { new: true, runValidators: true }
    );

    if (!careFollowUp) {
      throw new Error('Care follow-up not found');
    }

    return careFollowUp;
  } catch (error) {
    logger.error(error);
    throw new Error(error.message || 'Error closing care follow-up');
  }
};

export {
  createCareFollowUp,
  updateCareFollowUp,
  deleteCareFollowUp,
  getCareFollowUpById,
  getAllCareFollowUps,
  getFollowUpsByStatus,
  getFollowUpsAssignedTo,
  closeFollowUp,
  getCareFollowUpDashboard
};
