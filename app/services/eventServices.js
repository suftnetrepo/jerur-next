import Event from '../models';
import { identifierValidator } from '../validation/identifierValidator';
import { eventValidator } from '../validation/eventValidator';
import { logger } from '../../utils/logger';

async function addEvent({ suid }, body) {
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
    await Event.findByIdAndRemove(id);
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
    throw new Error('Error fetching event');
  }
}

async function getAllEvents({ suid }) {
  try {
    const identifierValidateResult = identifierValidator(suid);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }
    const events = await Event.find({ suid });
    return events;
  } catch (error) {
    logger.error(error);
    throw new Error('Error fetching all events');
  }
}

async function countInEventCollection({ suid }) {
  try {
    const identifierValidateResult = identifierValidator(suid);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }
    const eventCount = await Event.countDocuments({
      suid
    });
    return eventCount;
  } catch (error) {
    logger.error(error);
    throw new Error('Error fetching event count');
  }
}

async function getEvents({ suid }, pageNumber, pageSize, filterTerm) {
  const page = parseInt(pageNumber, 10) || 1;
  const size = parseInt(pageSize, 10) || 1;
  const skipCount = (page - 1) * size;

  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  const baseConditions = {
    suid,
    status: true,
    end_date: { $gte: currentDate }
  };

  let filterConditions = [];
  if (filterTerm) {
    filterConditions = [{ title: new RegExp(filterTerm, 'i') }];

    if (filterTerm === 'YES' || filterTerm === 'yes') {
      filterConditions.push({ status: true });
    }

    if (filterTerm === 'NO' || filterTerm === 'no') {
      filterConditions.push({ status: false });
    }
  }

  const queryConditions = filterTerm
    ? {
        $and: [baseConditions, { $or: filterConditions }]
      }
    : baseConditions;

  try {
    const countQuery = Event.countDocuments(queryConditions);
    const totalEventsCount = await countQuery;
    const events = await Event.find(queryConditions).sort({ createdAt: -1 }).skip(skipCount).limit(size);

    return {
      pageInfo: {
        pageNumber,
        pageSize,
        totalPages: Math.ceil(totalEventsCount / pageSize)
      },
      events
    };
  } catch (error) {
    logger.error(error);
    throw new Error('Error fetching events');
  }
}

async function fetchEvents(suid, pageNumber, pageSize, filterTerm) {
  const page = parseInt(pageNumber, 10) || 1;
  const size = parseInt(pageSize, 10) || 1;
  const skipCount = (page - 1) * size;

  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  const baseConditions = {
    suid,
    status: true,
    end_date: { $gte: currentDate }
  };

  const escapeRegex = (text) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  let filterConditions = [];
  if (filterTerm) {
    filterConditions = [{ title: new RegExp(escapeRegex(filterTerm), 'i') }];
  }

  const queryConditions = filterTerm ? { $and: [baseConditions, { $or: filterConditions }] } : baseConditions;

  try {
    const totalEventsCount = await Event.countDocuments(queryConditions);
    const events = await Event.find(queryConditions).sort({ start_date: -1 }).skip(skipCount).limit(size);

    return {
      pageInfo: {
        pageNumber: page,
        pageSize: size,
        totalPages: totalEventsCount > 0 ? Math.ceil(totalEventsCount / size) : 0
      },
      events
    };
  } catch (error) {
    logger.error(error.stack || error);
    throw new Error('Error fetching events');
  }
}

async function fetchTop10Events(suid) {
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

export {
  addEvent,
  editEvent,
  deleteEvent,
  getEventById,
  getAllEvents,
  countInEventCollection,
  getEvents,
  fetchEvents,
  fetchTop10Events
};
