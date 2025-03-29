import { logger } from '@/utils/logger';
import { mongoConnect } from '../../../../utils/connectDb';
import { removeUser } from '../../../services/userServices';
import { NextResponse } from 'next/server';

mongoConnect();

export const DELETE = async (req) => {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    const response = await removeUser(id);
    return Response.json({ message: response }, { status: 200 });
  } catch (error) {
    logger.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
};
