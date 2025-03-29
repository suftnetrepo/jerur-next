
import { updateUser } from '../../../services/userServices';
import { NextResponse } from 'next/server';
import { logger } from '@/utils/logger';

export const PUT = async (req) => {

  try{
  const body = await req.json();
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  const response = await updateUser(id, body);
  return Response.json({ data: response }, { status: 200 });
} catch (error) {
  logger.error(error);
  return NextResponse.json({ success: false, error: error.message }, { status: 500 });
}
};