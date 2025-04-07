import { attendanceValidator } from '../validation/attendanceValidator';
import { identifierValidator } from '../validation/identifierValidator';
import { logger } from '../../utils/logger';
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

    const newAttendance = new Attendance({
      ...body
    });

    const result = await newAttendance.save();
    return result;
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

const getAttendanceTrends = async (startDate, endDate, interval = 'week') => {
  try {
    return await Attendance.aggregate([
      {
        $match: {
          checkInTime: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: {
                day: "%Y-%m-%d",
                week: "%Y-%U",
                month: "%Y-%m"
              }[interval],
              date: "$checkInTime"
            }
          },
          count: { $sum: 1 },
          members: { 
            $sum: { $cond: [{ $ifNull: ["$memberId", false] }, 1, 0] }
          }
        }
      },
      { $sort: { "_id": 1 } },
      {
        $project: {
          date: "$_id",
          total: "$count",
          members: 1,
          guests: 1,
          _id: 0
        }
      }
    ]);
  } catch (error) {
    logger.error(error);
    throw new Error('Error generating attendance trends');
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
          firstAttendance: { $min: "$checkInTime" },
          lastAttendance: { $max: "$checkInTime" },
          averagePerMonth: {
            $avg: {
              $dateDiff: {
                startDate: "$checkInTime",
                endDate: new Date(),
                unit: "month"
              }
            }
          }
        }
      },
      {
        $lookup: {
          from: "members",
          localField: "memberId",
          foreignField: "_id",
          as: "memberDetails"
        }
      },
      { $unwind: "$memberDetails" }
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
          _id: "$serviceId",
          totalAttendees: { $sum: 1 },
          members: { 
            $sum: { 
              $cond: [{ $ifNull: ["$memberId", false] }, 1, 0] 
            }
          },
          firstCheckIn: { $min: "$checkInTime" },
          lastCheckIn: { $max: "$checkInTime" }
        }
      },
      {
        $lookup: {
          from: "services",
          localField: "_id",
          foreignField: "_id",
          as: "serviceDetails"
        }
      },
      { $unwind: "$serviceDetails" }
    ]);
  } catch (error) {
    logger.error(error);
    throw new Error('Error generating service summary');
  }
};


export { add, remove, getAttendanceTrends, getMemberAttendanceStats, getServiceAttendanceSummary };
