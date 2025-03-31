import { addFellowship } from '../../../services/fellowshipService';
import { logger } from '../../../../utils/logger';
import { NextResponse } from 'next/server';

export const POST = async (req) => {
  try {
    const userData = req.headers.get('x-user-data');
    const user = userData ? JSON.parse(userData) : null;
   
    const body = await req.json();
    const { data } = await addFellowship(user.church, body);
    return NextResponse.json({ data, success: true });
  } catch (error) {
    logger.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
};
