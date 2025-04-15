import {
  getMember,
  getMembers,
  getMemberCount,
  getRecentMembers,
  aggregateMemberByRole
} from '../../services/memberService';
import { logger } from '../../../utils/logger';
import { NextResponse } from 'next/server';
import { getUserSession } from '@/utils/generateToken';

export const GET = async (req) => {
  try {
    const user = await getUserSession(req);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    if (action === 'getAll') {
      const sortField = url.searchParams.get('sortField');
      const sortOrder = url.searchParams.get('sortOrder');
      const searchQuery = url.searchParams.get('searchQuery');
      const page = parseInt(url.searchParams.get('page') || '1', 10);
      const limit = parseInt(url.searchParams.get('limit') || '10', 10);

      const { data, totalCount } = await getMembers({
        suid: user?.church,
        page,
        limit,
        sortField,
        sortOrder,
        searchQuery
      });

      return NextResponse.json({ data, success: true, totalCount }, { status: 200 });
    }

    if (action === 'count') {
      const data = await getMemberCount(user?.church);
      return NextResponse.json({ data, success: true });
    }

    if (action === 'recent') {
      const data = await getRecentMembers(user?.church);
      return NextResponse.json({ data, success: true });
    }

    if (action === 'get') {
      const id = url.searchParams.get('id');
      const data = await getMember(id);
      return NextResponse.json({ data, success: true });
    }

    if (action === 'chart') {
      const data = await aggregateMemberByRole(user?.church);
      return NextResponse.json({ data, success: true });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    logger.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
};
