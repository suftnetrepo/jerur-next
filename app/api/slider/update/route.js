import { updateSlider } from '../../../services/sliderService';
import { logger } from '../../../../utils/logger';
import { NextResponse } from 'next/server';

export const PUT = async (req) => {
  try {
    const userData = req.headers.get('x-user-data');
    const user = userData ? JSON.parse(userData) : null;
    const url = new URL(req.url);
    const body = await req.json();
    const id = url.searchParams.get('id');
    const data = await updateSlider(id, body, user.church);
    return NextResponse.json({ data, success: true });
  } catch (error) {
    logger.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
};
