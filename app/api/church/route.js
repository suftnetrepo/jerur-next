import {
  getChurchById,
} from '../../services/churchService';
import { logger } from '../../../utils/logger';
import { NextResponse } from 'next/server';

export const GET = async (req) => {
  try {

    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    if (action === 'byId') {
      const id = url.searchParams.get('id');
      const { data } = await getChurchById(id);
      return NextResponse.json({ data, success: true });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    logger.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
};

