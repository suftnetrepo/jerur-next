import { getTestimonies } from '../../../services/testimoniesService';
import { logger } from '../../../utils/logger';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export const GET = async () => {
  try {
    const h = headers();
   
    const suid = h.get('nj-client-id');

    if (!suid) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await getTestimonies(suid, 1, 100);
    return NextResponse.json({ data, success: true });
  } catch (error) {
    logger.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
};
