import { Types } from 'mongoose';
import Donation from '../models';
import { donationValidator } from '../validation/donationValidator';
import { identifierValidator } from '../validation/identifierValidator';
import { logger } from '../../utils/logger';
import { mongoConnect } from '@/utils/connectDb';

mongoConnect();

async function addDonation( suid , body) {
  try {
    const identifierValidateResult = identifierValidator(suid);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }

    const bodyErrors = donationValidator(body);
    if (bodyErrors.length) {
      const error = new Error(bodyErrors.map((it) => it.message).join(','));
      error.invalidArgs = bodyErrors.map((it) => it.field).join(',');
      throw error;
    }
    const newDonation = new Donation({
      suid,
      ...body
    });

    const savedDonation = await newDonation.save();
    return savedDonation;
  } catch (error) {
    logger.error(error);
    throw new Error('Error adding donation');
  }
}

async function updateDonation(id, body) {
  try {
    const identifierValidateResult = identifierValidator(id);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }

    const bodyErrors = donationValidator(body);
    if (bodyErrors.length) {
      const error = new Error(bodyErrors.map((it) => it.message).join(','));
      error.invalidArgs = bodyErrors.map((it) => it.field).join(',');
      throw error;
    }

    await Donation.findByIdAndUpdate(id, body, {
      new: true
    });
    return true;
  } catch (error) {
    logger.error(error);
    throw new Error('Error editing donation');
  }
}

async function deleteDonation(id) {
  try {
    const identifierValidateResult = identifierValidator(id);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }
    await Donation.findByIdAndRemove(id);
    return true;
  } catch (error) {
    logger.error(error);
    throw new Error('Error deleting donation');
  }
}

async function getDonationByDailyAggregates( suid ) {
  try {
    const identifierValidateResult = identifierValidator(suid);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }

    const startOfWeek = new Date();
    startOfWeek.setUTCDate(startOfWeek.getUTCDate() - startOfWeek.getUTCDay()); // Set to the last Sunday
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setUTCDate(startOfWeek.getUTCDate() + 6); // Set to the next Saturday

    const results = await Donation.aggregate([
      {
        $match: {
          suid: Types.ObjectId(suid),
          date_donated: { $gte: startOfWeek, $lte: endOfWeek }
        }
      },
      {
        $group: {
          _id: {
            weekOfYear: { $week: '$date_donated' },
            year: { $year: '$date_donated' },
            type: '$donation_type'
          },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    const dailySummary = results.map((item) => ({
      weekOfYear: `${item._id.year}-W${item._id.weekOfYear}`,
      year: item._id.year,
      donations: [{ type: item._id.type, totalAmount: item.totalAmount }]
    }));

    return dailySummary;
  } catch (error) {
    logger.error(error);
    throw new Error('Error fetching donation aggregates');
  }
}

async function getDonationByMonthlyAggregates( suid ) {
  try {
    const currentYear = new Date().getFullYear();
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ];

    const donationAggregates = await Donation.aggregate([
      {
        $match: {
          suid: Types.ObjectId(suid),
          date_donated: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: {
            month: { $month: '$date_donated' },
            year: { $year: '$date_donated' }
          },
          totalAmount: { $sum: '$amount' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    const aggregatedDataWithMonthNames = donationAggregates.map((entry) => {
      const monthNumber = entry._id.month;
      const monthName = monthNames[monthNumber - 1]; // Array index is 0-based
      return {
        ...entry,
        _id: { ...entry._id, month: monthName }
      };
    });

    return aggregatedDataWithMonthNames;
  } catch (error) {
    logger.error(error);
    throw new Error('Error fetching donation aggregates');
  }
}

async function getByDonationTypeAggregates(suid ) {
  try {
    const identifierValidateResult = identifierValidator(suid);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }

    const currentYear = new Date().getFullYear();

    const donationAggregates = await Donation.aggregate([
      {
        $match: {
          suid: Types.ObjectId(suid),
          date_donated: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: {
            donation_type: '$donation_type',
            year: { $year: '$date_donated' }
          },
          totalAmount: { $sum: '$amount' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.donation_type': 1 }
      }
    ]);

    return donationAggregates;
  } catch (error) {
    logger.error(error);
    throw new Error('Error fetching donation aggregates');
  }
}

async function getDonations({ suid, page = 1, limit = 10, sortField, sortOrder, searchQuery }) {
  const skip = (page - 1) * limit;

  try {
    const sortOptions = {};
    if (sortField) {
      sortOptions[sortField] = sortOrder === 'desc' ? -1 : 1;
    }

    const searchFilter = searchQuery
      ? {
          $or: [
            { donation_type: { $regex: searchQuery, $options: 'i' } },
            { first_name: { $regex: searchQuery, $options: 'i' } },
            { last_name: { $regex: searchQuery, $options: 'i' } },
            { online: { $regex: searchQuery, $options: 'i' } }
          ]
        }
      : {};

    const query = {
      church:suid,
      ...searchFilter
    };

    const [donations, totalCount] = await Promise.all([
      Donation.find(query).sort(sortOptions).skip(skip).limit(limit).exec(),
      Donation.countDocuments({church:suid})
    ]);

    return {
      data: donations,
      totalCount
    };
  } catch (error) {
    logger.error(error);
    throw new Error('An unexpected error occurred. Please try again.');
  }
}

async function filterDonationsByDate(suid , startDateStr, endDateStr, donation_type) {
  try {
    const identifierValidateResult = identifierValidator(suid);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      throw new Error('Invalid date format');
    }

    const filter = {
      date_donated: {
        $gte: startDate,
        $lte: endDate
      },
      suid
    };

    if (donation_type) {
      filter.donation_type = donation_type;
    }

    const donations = await Donation.find(filter);
    const totalAmount = donations.reduce((total, donation) => total + donation.amount, 0);

    return {
      donations,
      totalAmount
    };
  } catch (error) {
    logger.error(error);
    throw new Error('Error filtering donations');
  }
}

export {
  deleteDonation,
  updateDonation,
  addDonation,
  getDonationByMonthlyAggregates,
  getByDonationTypeAggregates,
  getDonations,
  filterDonationsByDate,
  getDonationByDailyAggregates
};
