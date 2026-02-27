import mongoose from 'mongoose';
import { attendanceValidator } from '../validation/attendanceValidator';
import { identifierValidator } from '../validation/identifierValidator';
import { logger } from '../../utils/logger';
import ServiceTime from '../models/serviceTime';
import Attendance from '../models/attendance';
import { mongoConnect } from '@/utils/connectDb';

mongoConnect();

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

export { add, remove, getAttendanceTrends, getMemberAttendanceStats, getServiceAttendanceSummary };
