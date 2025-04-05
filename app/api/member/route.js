import { getMember, getMembers, getMemberCount } from '../../services/memberService';
import { logger } from '../../../utils/logger';
import { NextResponse } from 'next/server';

export const GET = async (req) => {
  try {
    const userData = req.headers.get('x-user-data');
    const user = userData ? JSON.parse(userData) : null;

    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    if (action === 'getAll') {
      const data = await getMembers(user?.church);
      return NextResponse.json({ data, success: true });
    }

    if (action === 'count') {
      const data = await getMemberCount(user?.church);
      return NextResponse.json({ data, success: true });
    }

    if (action === 'get') {
      const id = url.searchParams.get('id');
      const data = await getMember(id);
      return NextResponse.json({ data, success: true });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    logger.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
};
