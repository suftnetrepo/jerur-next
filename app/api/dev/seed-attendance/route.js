import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import Attendance from '../../../models/attendance';
import CareFollowUp from '../../../models/careFollowUp';
import Member from '../../../models/member';
import ServiceTime from '../../../models/serviceTime';
import User from '../../../models/user';
import { getUserSession } from '../../../../utils/generateToken';
import { logger } from '../../../../utils/logger';
import { mongoConnect } from '../../../../utils/connectDb';

mongoConnect();

const ATTENDANCE_STATUSES = [
  { value: 'PRESENT_IN_CHURCH', weight: 58 },
  { value: 'JOINED_ONLINE', weight: 10 },
  { value: 'ABSENT', weight: 11 },
  { value: 'WORKING', weight: 6 },
  { value: 'FAMILY_COMMITMENT', weight: 5 },
  { value: 'SICK', weight: 4 },
  { value: 'NEEDS_PRAYER', weight: 3 },
  { value: 'TRAVELLING', weight: 2 },
  { value: 'OTHER', weight: 1 }
];

const FOLLOW_UP_REASONS = {
  SICK: 'SICK',
  NEEDS_PRAYER: 'NEEDS_PRAYER',
  ABSENT: 'ABSENT',
  OTHER: 'OTHER'
};

const MESSAGE_BY_STATUS = {
  JOINED_ONLINE: 'Joined online and asked for the recording link.',
  ABSENT: 'Could not make it to service today.',
  WORKING: 'Scheduled to work during service hours.',
  FAMILY_COMMITMENT: 'Away handling a family commitment.',
  SICK: 'Feeling unwell and would appreciate prayer.',
  NEEDS_PRAYER: 'Requested prayer support this week.',
  TRAVELLING: 'Travelling out of town this week.',
  OTHER: 'Shared a personal note with the care team.'
};

const CARE_STATUSES = ['OPEN', 'CONTACTED'];

const shuffle = (items) => {
  const result = [...items];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }

  return result;
};

const weightedPick = (choices) => {
  const totalWeight = choices.reduce((sum, choice) => sum + choice.weight, 0);
  let threshold = Math.random() * totalWeight;

  for (const choice of choices) {
    threshold -= choice.weight;
    if (threshold <= 0) {
      return choice.value;
    }
  }

  return choices[0]?.value;
};

const buildServiceDate = (service) => {
  const scheduledAt = new Date();
  const [hour = '9', minute = '0'] = (service?.start_time || '09:00').split(':');

  scheduledAt.setHours(Number(hour), Number(minute), 0, 0);
  return scheduledAt;
};

const getRandomSubmittedAt = (serviceDate) => {
  const submittedAt = new Date(serviceDate);
  submittedAt.setMinutes(submittedAt.getMinutes() + Math.floor(Math.random() * 120));
  return submittedAt;
};

const getPriorityForStatus = (status, wantsPastorContact) => {
  if (wantsPastorContact || status === 'SICK' || status === 'NEEDS_PRAYER') {
    return 'HIGH';
  }

  return status === 'ABSENT' ? 'MEDIUM' : 'LOW';
};

const shouldCreateFollowUp = (status, wantsPastorContact) => {
  if (wantsPastorContact || status === 'SICK' || status === 'NEEDS_PRAYER') {
    return true;
  }

  if (status === 'ABSENT') {
    return Math.random() < 0.35;
  }

  return status === 'OTHER' && Math.random() < 0.15;
};

export const POST = async (req) => {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    const user = await getUserSession(req);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { serviceId } = body || {};

    if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
      return NextResponse.json({ error: 'A valid serviceId is required.' }, { status: 400 });
    }

    const service = await ServiceTime.findOne({
      _id: serviceId,
      suid: user.church
    }).lean();

    if (!service) {
      return NextResponse.json({ error: 'Service not found.' }, { status: 404 });
    }

    const [members, assignableUsers] = await Promise.all([
      Member.find({ church: user.church, status: { $in: ['active', 'provisional'] } })
        .select('_id first_name last_name')
        .lean(),
      User.find({ church: user.church })
        .select('_id')
        .lean()
    ]);

    if (!members.length) {
      return NextResponse.json({ error: 'No members available to seed attendance.' }, { status: 400 });
    }

    const existingAttendance = await Attendance.find({
      church: user.church,
      serviceId: service._id
    }).select('_id');

    const existingAttendanceIds = existingAttendance.map((record) => record._id);

    if (existingAttendanceIds.length > 0) {
      await CareFollowUp.deleteMany({ attendanceId: { $in: existingAttendanceIds } });
      await Attendance.deleteMany({ _id: { $in: existingAttendanceIds } });
    }

    const attendanceTarget = Math.min(
      members.length,
      Math.max(8, Math.round(members.length * (0.55 + Math.random() * 0.2)))
    );

    const serviceDate = buildServiceDate(service);
    const seededMembers = shuffle(members).slice(0, attendanceTarget);

    const attendanceDocs = seededMembers.map((member) => {
      const status = weightedPick(ATTENDANCE_STATUSES);
      const wantsPastorContact = ['SICK', 'NEEDS_PRAYER'].includes(status)
        ? Math.random() < 0.65
        : status === 'ABSENT'
          ? Math.random() < 0.18
          : Math.random() < 0.05;

      return {
        church: user.church,
        service: service._id,
        serviceId: service._id,
        memberId: member._id,
        status,
        message: MESSAGE_BY_STATUS[status] || '',
        checkedInVia: status === 'JOINED_ONLINE' ? 'ONLINE' : 'MANUAL',
        wantsPastorContact,
        checkInTime: serviceDate,
        submittedAt: getRandomSubmittedAt(serviceDate),
        count: 1
      };
    });

    const createdAttendance = await Attendance.insertMany(attendanceDocs);

    const followUpDocs = createdAttendance.reduce((accumulator, record) => {
      if (!shouldCreateFollowUp(record.status, record.wantsPastorContact)) {
        return accumulator;
      }

      const reason = FOLLOW_UP_REASONS[record.status] || 'OTHER';
      const assignedTo = assignableUsers.length > 0
        ? assignableUsers[Math.floor(Math.random() * assignableUsers.length)]._id
        : undefined;

      accumulator.push({
        attendanceId: record._id,
        memberId: record.memberId,
        assignedTo,
        reason,
        note: record.message || 'Created by development seed data.',
        priority: getPriorityForStatus(record.status, record.wantsPastorContact),
        status: CARE_STATUSES[Math.floor(Math.random() * CARE_STATUSES.length)]
      });

      return accumulator;
    }, []);

    if (followUpDocs.length > 0) {
      await CareFollowUp.insertMany(followUpDocs);
    }

    return NextResponse.json({
      success: true,
      data: {
        seededAttendance: createdAttendance.length,
        seededFollowUps: followUpDocs.length,
        serviceId: service._id
      }
    });
  } catch (error) {
    logger.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
};