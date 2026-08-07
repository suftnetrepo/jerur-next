import Event from '../models/event';
import { identifierValidator } from '../validation/identifierValidator';
import { eventValidator } from '../validation/eventValidator';
import { logger } from '../../utils/logger';
import { mongoConnect } from '../../utils/connectDb';
import CloudinaryService from '../../lib/CloudinaryService';

mongoConnect();

const eventImageFolder = (suid) => `${process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_FOLDER}/${suid}`;

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

    const { file, ...eventFields } = body;
    const uploaded = await CloudinaryService.uploadImage(file, { folder: eventImageFolder(suid) });

    const newEvent = new Event({
      suid,
      ...eventFields,
      ...(uploaded && { secure_url: uploaded.secure_url, public_id: uploaded.public_id })
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

    const { file, ...eventFields } = body;
    const existingEvent = await Event.findById(id);
    if (!existingEvent) {
      throw new Error('Event not found');
    }

    // No new file -> CASE 1: leave secure_url/public_id untouched entirely.
    // New file -> CASE 2: delete the old Cloudinary image, upload the new
    // one, and persist its secure_url/public_id.
    const uploaded = await CloudinaryService.replaceImage(file, existingEvent.public_id, {
      folder: eventImageFolder(existingEvent.suid)
    });

    await Event.findByIdAndUpdate(id, {
      ...eventFields,
      ...(uploaded && { secure_url: uploaded.secure_url, public_id: uploaded.public_id })
    }, {
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

    const existingEvent = await Event.findById(id);
    if (!existingEvent) {
      throw new Error('Event not found');
    }

    // Best-effort: a failed Cloudinary cleanup is logged but must not block
    // the record deletion the caller asked for.
    await CloudinaryService.deleteImage(existingEvent.public_id);

    await Event.findOneAndDelete({ _id: id });
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
    const result = await Event.find({
      suid,
      status: true,
      end_date: { $gte: currentDate }
    })
      .sort({
        start_date: -1
      })
      .limit(20);
    return result;
  } catch (error) {
    logger.error(error);
    throw new Error('Error fetching all events');
  }
}

export { creatEvent, editEvent, deleteEvent, getEventById, getEvents, getTop10Events };
