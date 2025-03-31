import { pushNotificationValidator } from '../validation/pushNotificationValidator';
import { identifierValidator, identifierValidators } from '../validation/identifierValidator';
import { logger } from '../../utils/logger';
import Church from '../models';
import { sendNotification } from '../../utils/push-notification';
import { MESSAGE_TYPE_ENUMS } from '../../utils/enums';
import { mongoConnect } from '@/utils/connectDb';

mongoConnect();

const addPushNotification = async (suid , body) => {
  const { title, message, send_notification } = body;

  try {
    const identifierValidateResult = identifierValidator(suid);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }

    const bodyErrors = pushNotificationValidator(body);
    if (bodyErrors.length) {
      const error = new Error(bodyErrors.map((it) => it.message).join(','));
      error.invalidArgs = bodyErrors.map((it) => it.field).join(',');
      throw error;
    }

    const church = await Church.findOneAndUpdate(
      { _id: suid },
      { $push: { push_notifications: body } },
      { new: true }
    ).exec();

    const pushNotifications = church.push_notifications[church.push_notifications.length - 1];

    if (send_notification) {
      await sendNotification(title, message, suid, MESSAGE_TYPE_ENUMS.NOTIFY);
    }

    return pushNotifications;
  } catch (error) {
    logger.error(error);
    throw new Error('Error adding push notifications');
  }
};

const updatePushNotification = async (notificationId, body,  suid ) => {
  const { title, status, message, send_notification } = body;

  try {
    const identifierValidateResult = identifierValidator(suid);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }

    const bodyErrors = pushNotificationValidator(body);
    if (bodyErrors.length) {
      const error = new Error(bodyErrors.map((it) => it.message).join(','));
      error.invalidArgs = bodyErrors.map((it) => it.field).join(',');
      throw error;
    }
    await Church.updateOne(
      { suid, 'push_notifications._id': notificationId },
      {
        $set: {
          'push_notifications.$.message': message,
          'push_notifications.$.title': title,
          'push_notifications.$.status': status
        }
      }
    ).exec();

    if (send_notification) {
      await sendNotification(title, message, suid, MESSAGE_TYPE_ENUMS.NOTIFY);
    }

    return true;
  } catch (error) {
    logger.error(error);
    throw new Error('Error updating push notifications');
  }
};

const removePushNotification = async ( suid , notificationId) => {
  try {
    const identifierValidateResult = identifierValidators([{ suid }, { notificationId }]);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }
    await Church.findByIdAndUpdate(
      suid,
      { $pull: { push_notifications: { _id: notificationId } } },
      { new: true }
    ).exec();

    return true;
  } catch (error) {
    logger.error(error);
    throw new Error('Error deleting push notifications');
  }
};
const getFilteredAndSortedPushNotifications = (notifications) =>
  notifications.filter((notification) => notification.status === true).sort((a, b) => b.createdAt - a.createdAt);

const getAllPushNotifications = async ( suid, status = false ) => {
  try {
    const identifierValidateResult = identifierValidator(suid);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }
    const church = await Church.findOne({ _id: suid });

    if (!church) {
      throw new Error('Church not found');
    }

    return status ?  getFilteredAndSortedPushNotifications(church.push_notifications): church.push_notifications.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    logger.error(error);
    throw new Error('Error fetching push notification');
  }
};
export {
  addPushNotification,
  updatePushNotification,
  removePushNotification,
  getAllPushNotifications
};
