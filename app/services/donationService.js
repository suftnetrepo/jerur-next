import { Types } from 'mongoose';
import Donation from '../models/donation';
import { donationValidator } from '../validation/donationValidator';
import { identifierValidator } from '../validation/identifierValidator';
import { logger } from '../../utils/logger';
import { mongoConnect } from '../../utils/connectDb';
import { DONATION_TYPE_VALUES } from '../../utils/donationConstants';

mongoConnect();

const DEFAULT_DONATION_SUMMARY = {
  totalAmount: 0,
  onlineAmount: 0,
  offlineAmount: 0,
  transactionCount: 0
};

const buildDonationObjectId = (value) => (value instanceof Types.ObjectId ? value : new Types.ObjectId(value));

const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getStartOfDay = (value) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const getEndOfDay = (value) => {
  const date = new Date(value);
  date.setHours(23, 59, 59, 999);
  return date;
};

const buildDonationSearchFilter = (search) => {
  if (!search) {
    return {};
  }

  const trimmedSearch = String(search).trim();

  if (!trimmedSearch) {
    return {};
  }

  const regex = new RegExp(escapeRegex(trimmedSearch), 'i');

  return {
    $or: [
      { donation_type: { $regex: regex } },
      { first_name: { $regex: regex } },
      { last_name: { $regex: regex } },
      {
        $expr: {
          $regexMatch: {
            input: {
              $trim: {
                input: {
                  $concat: [
                    { $ifNull: ['$first_name', ''] },
                    ' ',
                    { $ifNull: ['$last_name', ''] }
                  ]
                }
              }
            },
            regex: escapeRegex(trimmedSearch),
            options: 'i'
          }
        }
      }
    ]
  };
};

const buildDonationQuery = ({
  suid,
  donationType,
  donation_type,
  startDate,
  endDate,
  paymentMethod,
  search,
  searchQuery
}) => {
  const query = {
    suid: buildDonationObjectId(suid),
    ...buildDonationSearchFilter(search || searchQuery)
  };
  const normalizedDonationType = donationType || donation_type;

  if (normalizedDonationType && normalizedDonationType !== 'ALL' && DONATION_TYPE_VALUES.includes(normalizedDonationType)) {
    query.donation_type = normalizedDonationType;
  }

  if (paymentMethod === 'ONLINE') {
    query.online = true;
  }

  if (paymentMethod === 'OFFLINE') {
    query.online = false;
  }

  if (startDate || endDate) {
    query.date_donated = {};

    if (startDate) {
      query.date_donated.$gte = getStartOfDay(startDate);
    }

    if (endDate) {
      query.date_donated.$lte = getEndOfDay(endDate);
    }
  }

  return query;
};

const getDonationSummary = async (query) => {
  const [summary] = await Donation.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$amount' },
        onlineAmount: {
          $sum: {
            $cond: ['$online', '$amount', 0]
          }
        },
        offlineAmount: {
          $sum: {
            $cond: ['$online', 0, '$amount']
          }
        },
        transactionCount: { $sum: 1 }
      }
    }
  ]);

  return summary ? {
    totalAmount: summary.totalAmount || 0,
    onlineAmount: summary.onlineAmount || 0,
    offlineAmount: summary.offlineAmount || 0,
    transactionCount: summary.transactionCount || 0
  } : DEFAULT_DONATION_SUMMARY;
};

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

    delete body._id

    const newDonation = new Donation({
      suid,
      ...body
    });

    const savedDonation = await newDonation.save();
    return savedDonation;
  } catch (error) {
    console.error(error);
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
    await Donation.findByIdAndDelete(id);
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

async function getDonations({
  suid,
  page = 1,
  limit = 10,
  sortField,
  sortOrder,
  search,
  searchQuery,
  donationType,
  startDate,
  endDate,
  paymentMethod
}) {
  const skip = (page - 1) * limit;

  try {
    const sortOptions = sortField
      ? { [sortField]: sortOrder === 'desc' ? -1 : 1 }
      : { date_donated: -1 };
    const query = buildDonationQuery({
      suid,
      donationType,
      startDate,
      endDate,
      paymentMethod,
      search,
      searchQuery
    });

    const [donations, totalCount, summary] = await Promise.all([
      Donation.find(query).sort(sortOptions).skip(skip).limit(limit).exec(),
      Donation.countDocuments(query),
      getDonationSummary(query)
    ]);

    return {
      data: donations,
      donations,
      totalCount,
      summary,
      pagination: {
        page,
        limit,
        totalCount
      }
    };
  } catch (error) {
    console.error(error);
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

    const filter = buildDonationQuery({
      suid,
      startDate: startDateStr,
      endDate: endDateStr,
      donation_type
    });
    const [donations, summary] = await Promise.all([
      Donation.find(filter).sort({ date_donated: -1 }),
      getDonationSummary(filter)
    ]);

    return {
      donations,
      totalAmount: summary.totalAmount,
      summary
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
