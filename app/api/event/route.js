import {
  creatEvent,
  editEvent,
  deleteEvent,
  getEventById,
  getEvents,
  getTop10Events
} from '../../services/eventServices';
import { logger } from '../../../utils/logger';
import { NextResponse } from 'next/server';
import { getUserSession } from '@/utils/generateToken';
import { parseEventFormData } from '../shared/parseEventFormData';

export const GET = async (req) => {
  try {
    const user = await getUserSession(req);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    if (action === 'paginate') {
      const sortField = url.searchParams.get('sortField');
      const sortOrder = url.searchParams.get('sortOrder');
      const searchQuery = url.searchParams.get('searchQuery');
      const status = url.searchParams.get('status');
      const page = parseInt(url.searchParams.get('page') || '1', 10);
      const limit = parseInt(url.searchParams.get('limit') || '10', 10);

      const { data, totalCount } = await getEvents({
        suid: user?.church,
        page,
        limit,
        sortField,
        sortOrder,
        searchQuery,
        status
      });
      return NextResponse.json({ data, success: true, totalCount });
    }

    if (action === 'single') {
      const id = url.searchParams.get('id');
      const data = await getEventById(id);
      return NextResponse.json({ data, success: true });
    }

    if (action === 'top10') {
      const data = await getTop10Events(user?.church);
      return NextResponse.json({ data, success: true });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
};

export const DELETE = async (req) => {
  try {

    const user = await getUserSession(req);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    const deleted = await deleteEvent(id);
    return NextResponse.json({ success: true, data: deleted });
  } catch (error) {
    logger.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
};

export const PUT = async (req) => {
  try {

    const user = await getUserSession(req);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    const eventData = await parseEventFormData(req, user);
    const updated = await editEvent(id, eventData);

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    logger.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
};

export const POST = async (req) => {
  try {
    const user = await getUserSession(req);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const eventData = await parseEventFormData(req, user);
    const data = await creatEvent(user.church, eventData);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    logger.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
};
