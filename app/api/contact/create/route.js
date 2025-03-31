import { addContact } from '../../../services/contactService';
import { logger } from '../../../../utils/logger';
import { NextResponse } from 'next/server';

export const POST = async (req) => {
  try {
    const userData = req.headers.get('x-user-data');
    const user = userData ? JSON.parse(userData) : null;
    const url = new URL(req.url);

    const status = url.searchParams.get('status');
    const { data } = await addContact({ suid: user.church, status });
    return NextResponse.json({ data, success: true });
  } catch (error) {
    logger.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
};
