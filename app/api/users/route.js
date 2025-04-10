import { logger } from '@/utils/logger';
import { getUsers } from '../../services/userServices';
import { NextResponse } from 'next/server';
import { getUserSession } from '@/utils/generateToken';

export const GET = async (req) => {
  try {
    const user = await getUserSession(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    if (action === 'getAll') {
      const sortField = url.searchParams.get('sortField');
      const sortOrder = url.searchParams.get('sortOrder');
      const searchQuery = url.searchParams.get('searchQuery');
      const page = parseInt(url.searchParams.get('page') || '1', 10);
      const limit = parseInt(url.searchParams.get('limit') || '10', 10);

      const { data, totalCount } = await getUsers({
        page,
        limit,
        sortField,
        sortOrder,
        searchQuery
      });

      return NextResponse.json({ data, success: true, totalCount }, { status: 200 });
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
};
