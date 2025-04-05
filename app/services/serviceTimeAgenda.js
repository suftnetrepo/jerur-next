import { serviceTimeValidator } from '../validation/serviceTimeValidator';
import { identifierValidator, identifierValidators } from '../validation/identifierValidator';
import { logger } from '../../utils/logger';
import ServiceTime from '../models/serviceTime';
import { mongoConnect } from '@/utils/connectDb';

mongoConnect();

const addServiceTimeAgenda = async (suid, body) => {
  try {
    const identifierValidateResult = identifierValidator(suid);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }

    const bodyErrors = serviceTimeValidator(body);
    if (bodyErrors.length) {
      const error = new Error(bodyErrors.map((it) => it.message).join(','));
      error.invalidArgs = bodyErrors.map((it) => it.field).join(',');
      throw error;
    }
    const serviceTime = await ServiceTime.findOneAndUpdate(
      { _id: body.serviceTimeId },
      { $push: { agenda: body } },
      { new: true }
    ).exec();

    const newAgenda = serviceTime.agenda[serviceTime.agenda.length - 1];
    return newAgenda;
  } catch (error) {
    logger.error(error);
    throw new Error('Error adding service time agenda');
  }
};

const updateServiceTimeAgenda = async (id, body) => {
  const { start_time, end_time, title, status, description, facilitator, sequency_no, serviceTimeId } = body;

  try {
    const identifierValidateResult = identifierValidator(id);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }

    const bodyErrors = serviceTimeValidator(body);
    if (bodyErrors.length) {
      const error = new Error(bodyErrors.map((it) => it.message).join(','));
      error.invalidArgs = bodyErrors.map((it) => it.field).join(',');
      throw error;
    }
    await ServiceTime.updateOne(
      { serviceTimeId, 'agenda._id': id },
      {
        $set: {
          'agenda.$.start_time': start_time,
          'agenda.$.end_time': end_time,
          'agenda.$.title': title,
          'agenda.$.status': status,
          'agenda.$.facilitator': facilitator,
          'agenda.$.sequency_no': sequency_no,
          'agenda.$.description': description
        }
      }
    ).exec();

    return true;
  } catch (error) {
    logger.error(error);
    throw new Error('Error updating service time agenda');
  }
};

const removeServiceTimeAgenda = async (id, serviceTimeId) => {
  try {
    const identifierValidateResult = identifierValidators([{ id }, { serviceTimeId }]);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }
    await ServiceTime.findByIdAndUpdate(serviceTimeId, { $pull: { agenda: { _id: id } } }, { new: true }).exec();

    return true;
  } catch (error) {
    logger.error(error);
    throw new Error('Error deleting service time agenda');
  }
};

const getServiceTimeAgendasById = async (serviceTimeId) => {
  try {
    const identifierValidateResult = identifierValidator(serviceTimeId);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }

    const serviceTime = await ServiceTime.findById(serviceTimeId);
    if (!serviceTime) {
      throw new Error('ServiceTime not found');
    }

    const agendas = serviceTime.agenda.sort((a, b) => a.sequency_no - b.sequency_no);

    return agendas;
  } catch (error) {
    logger.error(error);
    throw new Error('Error fetching serviceTime agendas');
  }
};

export { addServiceTimeAgenda, updateServiceTimeAgenda, removeServiceTimeAgenda, getServiceTimeAgendasById };
