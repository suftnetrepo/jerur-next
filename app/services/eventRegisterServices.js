import { identifierValidator, identifierValidators } from '../validation/identifierValidator';
import { logger } from '../../utils/logger';
import Event from '../models/event';
import { mongoConnect } from '@/utils/connectDb';

mongoConnect();

const addEventRegister = async (body) => {
  try {
    const event = await Event.findOneAndUpdate(
      { _id: body.eventId },
      { $push: { register: body } },
      { new: true }
    ).exec();

    const newARegister = event.register[event.register.length - 1];
    return newARegister;
  } catch (error) {
    logger.error(error);
    throw new Error('Error adding event register');
  }
};

const getEventRegisterById = async (eventId) => {
  try {
    const identifierValidationErrors = identifierValidator(eventId);
    if (identifierValidationErrors.length) {
      const error = new Error(identifierValidationErrors.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidationErrors.map((it) => it.field).join(',');
      throw error;
    }

    const event = await Event.findById(eventId);

    if (!event) {
      throw new Error('Event not found');
    }

    const attendees = event.register.sort((a, b) => b.createdAt - a.createdAt);
    return attendees;
  } catch (error) {
    logger.error(error);
    throw new Error('Error fetching event register');
  }
};

async function deleteEventRegister(id, eventId) {
  try {
    const identifierValidateResult = identifierValidators([{ id }, { eventId }]);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }
    await Event.findByIdAndUpdate(eventId, { $pull: { register: { _id: id } } }, { new: true }).exec();
    return true;
  } catch (error) {
    logger.error(error);
    throw new Error('Error deleting event register');
  }
}

export { addEventRegister, getEventRegisterById, deleteEventRegister };
