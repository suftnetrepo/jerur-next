import {
      getAllPushNotifications,
  } from '../../services/pushNotificationService';
  import { logger } from '../../../utils/logger';
  import { NextResponse } from 'next/server';
  
  export const GET = async (req) => {
    try {
      const url = new URL(req.url);
      const id = url.searchParams.get('id')
      const status = url.searchParams.get('status')
      const { data } = await getAllPushNotifications( id, status );
      return NextResponse.json({ data, success: true });
  
    } catch (error) {
      logger.error(error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
  };