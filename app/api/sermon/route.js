import {
  createSermon,
  updateSermon,
  deleteSermon,
  getSermonById,
  getAllSermons,
  getLatestSermons,
  searchSermons,
  getSermonsByPreacher
} from '../../services/sermonService';
import { sermonValidator } from '../../validation/sermonValidator';
import { logger } from '../../../utils/logger';
import { NextResponse } from 'next/server';
import { getUserSession } from '../../../utils/generateToken';

export const POST = async (req) => {
  try {
    const user = await getUserSession(req);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    
    // Validate request
    const validation = sermonValidator({ ...body, createdBy: user._id });
    if (validation !== true) {
      return NextResponse.json({ error: 'Validation failed', details: validation }, { status: 400 });
    }

    body.createdBy = user._id;
    const data = await createSermon(body);
    return NextResponse.json({ data, success: true }, { status: 201 });
  } catch (error) {
    logger.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
};

export const GET = async (req) => {
  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);

    if (action === 'getById') {
      const id = url.searchParams.get('id');
      if (!id) {
        return NextResponse.json({ error: 'ID is required' }, { status: 400 });
      }
      const data = await getSermonById(id);
      return NextResponse.json({ data, success: true });
    }

    if (action === 'latest') {
      const limitParam = parseInt(url.searchParams.get('limit') || '10', 10);
      const data = await getLatestSermons(limitParam);
      return NextResponse.json({ data, success: true });
    }

    if (action === 'search') {
      const searchQuery = url.searchParams.get('q');
      if (!searchQuery) {
        return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
      }
      const result = await searchSermons(searchQuery, { page, limit });
      return NextResponse.json({ ...result, success: true });
    }

    if (action === 'byPreacher') {
      const preacher = url.searchParams.get('preacher');
      if (!preacher) {
        return NextResponse.json({ error: 'Preacher name is required' }, { status: 400 });
      }
      const result = await getSermonsByPreacher(preacher, { page, limit });
      return NextResponse.json({ ...result, success: true });
    }

    // Default: get all sermons
    const sortField = url.searchParams.get('sortField') || 'createdAt';
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';
    const result = await getAllSermons({ page, limit, sortField, sortOrder });
    return NextResponse.json({ ...result, success: true });
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

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const body = await req.json();
    const data = await updateSermon(id, body);
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const data = await deleteSermon(id);
    return NextResponse.json({ data, success: true });
  } catch (error) {
    logger.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
};
