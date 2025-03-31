import { eventAgendaValidator } from '../validation/eventValidator';
import { identifierValidator, identifierValidators } from '../validation/identifierValidator';
import { logger } from '../../utils/logger';
import Event from '../models';
import { mongoConnect } from '@/utils/connectDb';

mongoConnect();

const addEventAgenda = async ({ suid }, body) => {
  try {
    const identifierValidateResult = identifierValidator(suid);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }

    const bodyErrors = eventAgendaValidator(body);
    if (bodyErrors.length) {
      const error = new Error(bodyErrors.map((it) => it.message).join(','));
      error.invalidArgs = bodyErrors.map((it) => it.field).join(',');
      throw error;
    }

    const event = await Event.findOneAndUpdate(
      { _id: body.eventId },
      { $push: { agenda: body } },
      { new: true }
    ).exec();

    const newAgenda = event.agenda[event.agenda.length - 1];
    return newAgenda;
  } catch (error) {
    logger.error(error);
    throw new Error('Error adding event agenda');
  }
};

const updateEventAgenda = async (id, body) => {
  const { start_time, end_time, title, status, description, facilitator, sequency_no, eventId } = body;

  try {
    const identifierValidateResult = identifierValidator(id);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }

    const bodyErrors = eventAgendaValidator(body);
    if (bodyErrors.length) {
      const error = new Error(bodyErrors.map((it) => it.message).join(','));
      error.invalidArgs = bodyErrors.map((it) => it.field).join(',');
      throw error;
    }
    await Event.updateOne(
      { eventId, 'agenda._id': id },
      {
        $set: {
          'agenda.$.start_time': start_time,
          'agenda.$.end_time': end_time,
          'agenda.$.title': title,
          'agenda.$.status': status,
          'agenda.$.sequency_no': sequency_no,
          'agenda.$.facilitator': facilitator,
          'agenda.$.description': description
        }
      }
    ).exec();

    return true;
  } catch (error) {
    logger.error(error);
    throw new Error('Error updating event agenda');
  }
};

const removeEventAgenda = async (id, eventId) => {
  try {
    const identifierValidateResult = identifierValidators([{ id }, { eventId }]);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }
    await Event.findByIdAndUpdate(eventId, { $pull: { agenda: { _id: id } } }, { new: true }).exec();

    return true;
  } catch (error) {
    logger.error(error);
    throw new Error('Error deleting event agenda');
  }
};

const getEventAgendasById = async (eventId) => {
  try {
    const identifierValidationErrors = identifierValidator(eventId);
    if (identifierValidationErrors.length) {
      const error = new Error(identifierValidationErrors.map((err) => err.message).join(','));
      error.invalidArgs = identifierValidationErrors.map((err) => err.field).join(',');
      throw error;
    }

    const event = await Event.findById(eventId);

    if (!event) {
      throw new Error('Event not found');
    }

    const agendas = event.agenda.sort((a, b) => a.sequency_no - b.sequency_no);
    return agendas;
  } catch (error) {
    logger.error(error);
    throw new Error('Error fetching agendas');
  }
};

export { addEventAgenda, updateEventAgenda, removeEventAgenda, getEventAgendasById };
