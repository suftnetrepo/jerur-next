import Event from '../models/event';
import { identifierValidator } from '../validation/identifierValidator';
import { eventValidator } from '../validation/eventValidator';
import { logger } from '../../utils/logger';
import { mongoConnect } from '@/utils/connectDb';

mongoConnect();

async function creatEvent(suid, body) {
  try {
    const identifierValidateResult = identifierValidator(suid);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }

    const bodyErrors = eventValidator(body);
    if (bodyErrors.length) {
      const error = new Error(bodyErrors.map((it) => it.message).join(','));
      error.invalidArgs = bodyErrors.map((it) => it.field).join(',');
      throw error;
    }

    const newEvent = new Event({
      suid,
      ...body
    });

    const savedEvent = await newEvent.save();
    return savedEvent;
  } catch (error) {
    logger.error(error);
    throw new Error('Error adding event');
  }
}

async function editEvent(id, body) {
  try {
    const identifierValidateResult = identifierValidator(id);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }

    const bodyErrors = eventValidator(body);
    if (bodyErrors.length) {
      const error = new Error(bodyErrors.map((it) => it.message).join(','));
      error.invalidArgs = bodyErrors.map((it) => it.field).join(',');
      throw error;
    }
    await Event.findByIdAndUpdate(id, body, {
      new: true
    });
    return true;
  } catch (error) {
    logger.error(error);
    throw new Error('Error editing events');
  }
}

async function deleteEvent(id) {
  try {
    const identifierValidateResult = identifierValidator(id);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }
    await Event.findOneAndDelete(id);
    return true;
  } catch (error) {
    logger.error(error);
    throw new Error('Error deleting events');
  }
}

async function getEventById(id) {
  try {
    const identifierValidateResult = identifierValidator(id);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }
    const event = await Event.findById(id);
    return event;
  } catch (error) {
    logger.error(error);
    throw new Error('Error fetching event');
  }
}

async function getEvents({ suid, page = 1, limit = 10, sortField, sortOrder, searchQuery, status = false }) {
  const skip = (page - 1) * limit;

  try {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const sortOptions = sortField ? { [sortField]: sortOrder === 'desc' ? -1 : 1 } : { createdAt: -1 };

    const searchFilter = searchQuery
      ? {
          $or: [{ title: { $regex: searchQuery, $options: 'i' } }]
        }
      : {};

    const query = {
      suid,
      ...searchFilter
    };

    if (!status) {
      query.end_date = { $gte: currentDate };
      query.status = true;
    }

    const [events, totalCount] = await Promise.all([
      Event.find(query).sort(sortOptions).skip(skip).limit(limit).exec(),
      Event.countDocuments({ suid: suid })
    ]);

    return {
      data: events,
      totalCount
    };
  } catch (error) {
    logger.error(error);
    throw new Error('An unexpected error occurred. Please try again.');
  }
}

async function getTop10Events(suid) {
  const identifierValidateResult = identifierValidator(suid);
  if (identifierValidateResult.length) {
    const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
    error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
    throw error;
  }

  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  try {
    const campaigns = await Event.find({
      suid,
      status: true,
      end_date: { $gte: currentDate }
    })
      .sort({
        start_date: -1
      })
      .limit(10);
    return campaigns;
  } catch (error) {
    logger.error(error);
    throw new Error('Error fetching all events');
  }
}

export { creatEvent, editEvent, deleteEvent, getEventById, getEvents, getTop10Events };
