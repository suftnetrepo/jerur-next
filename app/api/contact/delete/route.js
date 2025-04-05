import { removeContact } from '../../../services/contactService';
import { logger } from '../../../../utils/logger';
import { NextResponse } from 'next/server';

export const DELETE = async (req) => {
  try {
    const userData = req.headers.get('x-user-data');
    const user = userData ? JSON.parse(userData) : null;
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    const data = await removeContact(user.church, id );
    return NextResponse.json({ data, success: true });
  } catch (error) {
    logger.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
};
