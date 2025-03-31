import { deleteChurch } from '../../../services/churchService';
import { logger } from '../../utils/logger';
import { NextResponse } from 'next/server';

export const DELETE = async (req) => {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    const deleted = await deleteChurch(id);
    return NextResponse.json({ success: true, data: deleted });
  } catch (error) {
    logger.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
};
