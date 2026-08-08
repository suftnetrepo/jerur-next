import { getLatestPublishedSermon } from '../../../services/sermonService';
import { logger } from '../../../../utils/logger';
import { NextResponse } from 'next/server';
import { decrypt } from '../../../../utils/helpers';

// Trims the full admin-shaped sermon (raw media.* object, populated
// serviceId/createdBy/updatedBy, timestamps, ...) down to what the mobile
// Home screen's "Latest Sermon" card actually needs. audioUrl/videoUrl
// are dropped here on purpose - they're deprecated fields the admin form
// no longer writes to (see renderOffcanvas.jsx), so there's nothing
// current to send. `thumbnail` is included even though it isn't one of
// the fields the mobile card strictly requires input for, because it's
// already derived server-side (see utils/youtube.js via sermonService's
// sanitizeSermonPayload) and is exactly what the card's image needs -
// no reason to make the client re-derive it from youtubeUrl when the
// backend already has it.
const shapeSermonForMobile = (sermon) => {
  if (!sermon) return null;

  return {
    id: String(sermon._id),
    title: sermon.title || '',
    speakerName: sermon.speakerName || '',
    summary: sermon.summary || '',
    preachedAt: sermon.preachedAt || null,
    durationMinutes: sermon.durationMinutes ?? null,
    youtubeUrl: sermon.media?.youtubeUrl || '',
    thumbnail: sermon.media?.thumbnail || '',
    service: sermon.serviceId?.title || '',
    status: sermon.status || ''
  };
};

// Public, per-church-key endpoint - same auth pattern as
// /api/regularService/get, /api/fellowship/get, /api/event/get: no staff
// session, just the encrypted per-church "nj-api-key" every mobile
// request already carries once a church is selected. This is
// deliberately a NEW route rather than reusing GET /api/sermon (which
// requires a real staff getUserSession and returns the full admin shape,
// unfiltered by status) - the mobile app has no staff session, and
// members should only ever see published sermons.
export const GET = async (req) => {
  try {
    const clientId = req.headers.get('x-nj-client-id');

    if (!clientId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const identifier = decrypt(clientId);

    if (!identifier) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const sermon = await getLatestPublishedSermon(identifier);
    return NextResponse.json({ data: shapeSermonForMobile(sermon), success: true });
  } catch (error) {
    logger.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
};
