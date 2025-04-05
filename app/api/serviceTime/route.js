import { addServiceTime, editServiceTime, deleteServiceTime, getAllServiceTimes } from '../../services/serviceTime';
import { logger } from '../../../utils/logger';
import { NextResponse } from 'next/server';

export const GET = async (req) => {
  try {
    const userData = req.headers.get('x-user-data');
    const user = userData ? JSON.parse(userData) : null;
    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const data = await getAllServiceTimes(user?.church, status);
    return NextResponse.json({ data, success: true });
  } catch (error) {
    logger.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
};

export const DELETE = async (req) => {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    const deleted = await deleteServiceTime(id);
    return NextResponse.json({ success: true, data: deleted });
  } catch (error) {
    logger.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
};

export const PUT = async (req) => {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    const body = await req.json();

    const updated = await editServiceTime(id, body);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    logger.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
};

export const POST = async (req) => {
  try {
    const userData = req.headers.get('x-user-data');
    const user = userData ? JSON.parse(userData) : null;
    const body = await req.json();

    const result = await addServiceTime(user?.church, body);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    logger.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
};
