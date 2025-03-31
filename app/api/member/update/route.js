import { updateMember } from '../../../services/memberService';
import { logger } from '../../../../utils/logger';
import { NextResponse } from 'next/server';

export const PUT = async (req) => {
  try {
    const url = new URL(req.url);
    const body = await req.json();
    const id = url.searchParams.get('id');
    const { data } = await updateMember(id, body);
    return NextResponse.json({ data, success: true });
  } catch (error) {
    logger.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
};
