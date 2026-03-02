import { verificationPin } from '../../../../services/memberService';
import { logger } from '../../../../../utils/logger';
import { NextResponse } from 'next/server';

export const POST = async (req) => {
  try {
    const body = await req.json();
    const data = await verificationPin(body.email, body.pin);
    return NextResponse.json({ data, success: true });
  } catch (error) {
    logger.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
};
