import {
  addEventAgenda,
  updateEventAgenda,
  removeEventAgenda,
  getEventAgendasById
} from '../../../services/eventAgendaServices';
import { logger } from '../../../../utils/logger';
import { NextResponse } from 'next/server';
import { getUserSession } from '../../../../utils/generateToken';

export const GET = async (req) => {
  try {

    const user = await getUserSession(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const url = new URL(req.url);
    const id = url.searchParams.get('id')

    const data  = await getEventAgendasById(id);
    return NextResponse.json({ data, success: true });

  } catch (error) {
    logger.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
};

export const DELETE = async (req) => {
  try {

    const user = await getUserSession(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);

    const id = url.searchParams.get('id');
    const serviceId = url.searchParams.get('eventId');
    const deleted = await removeEventAgenda(id, serviceId);

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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    const body = await req.json();

    const updated = await updateEventAgenda(id, body);
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const body = await req.json();

    const result = await addEventAgenda(body);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    logger.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
};
