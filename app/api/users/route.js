import { logger } from '@/utils/logger';
import { getUsers } from '../../services/userServices';
import { NextResponse } from 'next/server';

export const GET = async (req) => {
  try {
    const url = new URL(req.url);
    const sortField = url.searchParams.get('sortField');
    const sortOrder = url.searchParams.get('sortOrder');
    const searchQuery = url.searchParams.get('searchQuery');
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);

    const { data, success, totalCount } = await getUsers({
      page,
      limit,
      sortField,
      sortOrder,
      searchQuery
    });

    return NextResponse.json({ data, success, totalCount }, { status: 200 });
  } catch (error) {
    logger.log(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
};
