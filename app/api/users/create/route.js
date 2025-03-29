import { createUser } from '../../../services/userServices';
import { NextResponse } from 'next/server';
import { logger } from '@/utils/logger';

export const POST = async (req) => {
  try {
    const body = await req.json();

    const result = await createUser(body);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    logger.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
};
