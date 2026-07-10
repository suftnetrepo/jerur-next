import {
  createSermon,
  updateSermon,
  deleteSermon,
  getSermonById,
  getAllSermons,
  getLatestSermons,
  searchSermons,
  getSermonsBySpeaker,
  publishSermon,
  archiveSermon
} from '../../services/sermonService';
import { sermonValidator } from '../../validation/sermonValidator';
import { logger } from '../../../utils/logger';
import { NextResponse } from 'next/server';
import { getUserSession } from '../../../utils/generateToken';

const WRITE_ROLES = ['admin', 'ADMIN', 'pastor', 'PASTOR', 'media_team', 'MEDIA_TEAM'];

const normalizeChurchId = (user) => user?.church?._id || user?.church || user?.suid || user?.churchId || null;
const normalizeUserId = (user) => user?._id || user?.id || user?.userId || null;

const ensureWriteAccess = (user) => {
  if (!WRITE_ROLES.includes(user?.role)) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  return null;
};

const normalizeSermonValidationPayload = (body, user, overrides = {}) => {
  const churchId = normalizeChurchId(user);
  const userId = normalizeUserId(user);
  const payload = {
    ...body,
    ...overrides,
    churchId,
    createdBy: overrides.createdBy || userId
  };

  if (payload.preachedAt) {
    payload.preachedAt = new Date(payload.preachedAt);
  }

  if (payload.durationMinutes !== undefined && payload.durationMinutes !== '') {
    payload.durationMinutes = Number(payload.durationMinutes);
  }

  payload.media = {
    youtubeUrl: payload.media?.youtubeUrl || '',
    audioUrl: payload.media?.audioUrl || '',
    videoUrl: payload.media?.videoUrl || '',
    thumbnail: payload.media?.thumbnail || ''
  };

  return payload;
};

export const POST = async (req) => {
  try {
    const user = await getUserSession(req);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const forbiddenResponse = ensureWriteAccess(user);
    if (forbiddenResponse) {
      return forbiddenResponse;
    }

    const body = await req.json();

    const validation = sermonValidator(normalizeSermonValidationPayload(body, user));
    if (validation !== true) {
      return NextResponse.json({ error: 'Validation failed', details: validation }, { status: 400 });
    }

    const data = await createSermon(body, user);
    return NextResponse.json({ data, success: true }, { status: 201 });
  } catch (error) {
    logger.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
};

export const GET = async (req) => {
  try {
    const user = await getUserSession(req);
    const churchId = normalizeChurchId(user);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);

    if (action === 'getById') {
      const id = url.searchParams.get('id');
      if (!id) {
        return NextResponse.json({ error: 'ID is required' }, { status: 400 });
      }
      const data = await getSermonById(id, churchId);
      return NextResponse.json({ data, success: true });
    }

    if (action === 'latest') {
      const limitParam = parseInt(url.searchParams.get('limit') || '10', 10);
      const data = await getLatestSermons({ churchId, limit: limitParam });
      return NextResponse.json({ data, success: true });
    }

    if (action === 'search') {
      const query = url.searchParams.get('query') || url.searchParams.get('q');
      if (!query) {
        return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
      }
      const result = await searchSermons({ churchId, query, page, limit });
      return NextResponse.json({ ...result, success: true });
    }

    if (action === 'bySpeaker') {
      const speakerId = url.searchParams.get('speakerId');
      const speakerName = url.searchParams.get('speakerName');
      if (!speakerId && !speakerName) {
        return NextResponse.json({ error: 'speakerId or speakerName is required' }, { status: 400 });
      }
      const result = await getSermonsBySpeaker({ churchId, speakerId, speakerName, page, limit });
      return NextResponse.json({ ...result, success: true });
    }

    const sortField = url.searchParams.get('sortField') || 'preachedAt';
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || 'ALL';
    const speakerId = url.searchParams.get('speakerId');
    const speakerName = url.searchParams.get('speakerName');
    const serviceId = url.searchParams.get('serviceId');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    const result = await getAllSermons({
      churchId,
      page,
      limit,
      search,
      status,
      speakerId,
      speakerName,
      serviceId,
      startDate,
      endDate,
      sortField,
      sortOrder
    });
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

    const forbiddenResponse = ensureWriteAccess(user);
    if (forbiddenResponse) {
      return forbiddenResponse;
    }

    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const body = await req.json();

    if (action === 'publish') {
      const data = await publishSermon(id, user);
      return NextResponse.json({ data, success: true });
    }

    if (action === 'archive') {
      const data = await archiveSermon(id, user);
      return NextResponse.json({ data, success: true });
    }

    const validation = sermonValidator(normalizeSermonValidationPayload(body, user, {
      preachedAt: body.preachedAt || new Date(),
      title: body.title || 'Existing Title',
      speakerName: body.speakerName || 'Existing Speaker',
      serviceId: body.serviceId || '000000000000000000000000',
      status: body.status || 'DRAFT',
      media: body.media || { youtubeUrl: 'https://example.com/sermon' }
    }));
    if (validation !== true) {
      const nonRequiredFieldErrors = validation.filter((detail) => !['title', 'speakerName', 'preachedAt', 'serviceId', 'status', 'media'].includes(detail.field));
      if (nonRequiredFieldErrors.length) {
        return NextResponse.json({ error: 'Validation failed', details: nonRequiredFieldErrors }, { status: 400 });
      }
    }

    const data = await updateSermon(id, body, user);
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

    const forbiddenResponse = ensureWriteAccess(user);
    if (forbiddenResponse) {
      return forbiddenResponse;
    }

    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const data = await deleteSermon(id, user);
    return NextResponse.json({ data, success: true });
  } catch (error) {
    logger.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
};
