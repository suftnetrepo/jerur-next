import { removePushNotification } from '../../../services/pushNotificationService';
import { logger } from '../../../../utils/logger';
import { NextResponse } from 'next/server';

export const DELETE = async (req) => {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    const notificationId = url.searchParams.get('notificationId');
    const { data } = await removePushNotification(id, notificationId);
    return NextResponse.json({ data, success: true });
  } catch (error) {
    logger.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
};
