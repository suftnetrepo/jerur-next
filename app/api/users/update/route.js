
import { updateUser } from '../../../services/userServices';
import { NextResponse } from 'next/server';
import { logger } from '../../../../utils/logger';
import { getUserSession } from '../../../../utils/generateToken';

export const PUT = async (req) => {

  try {

    const user = await getUserSession(req);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    const response = await updateUser(id, body);
    return NextResponse.json({ data: response }, { status: 200 });
  } catch (error) {
    logger.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
};