import { getPublishedArticles, getPublishedArticleById } from '../../../services/articleService';
import { logger } from '../../../../utils/logger';
import { NextResponse } from 'next/server';
import { decrypt } from '../../../../utils/helpers';

// Trims an article down to what the mobile app actually needs, same
// reasoning as sermon/get/route.js's shapeSermonForMobile - content is
// deliberately excluded from the list shape (summary is what the list
// screen shows; content is only needed by the single-article detail call
// below, which is otherwise the same trim).
const shapeArticleForList = (article) => ({
  id: String(article._id),
  title: article.title || '',
  summary: article.summary || '',
  secure_url: article.secure_url || '',
  publishedAt: article.publishedAt || null
});

const shapeArticleForDetail = (article) => ({
  ...shapeArticleForList(article),
  content: article.content || ''
});

// Public, per-church-key endpoint - same auth pattern as
// /api/sermon/get, /api/regularService/get, /api/fellowship/get,
// /api/event/get: no staff session, just the encrypted per-church
// "nj-api-key" every mobile request already carries once a church is
// selected. Only ever returns published articles - draft articles never
// reach this route (getPublishedArticles/getPublishedArticleById both
// filter on status in the query itself, not as an after-the-fact check).
//
// Phase 2 preparation only - no mobile UI consumes this yet:
//   action=latest  -> most recent published articles (defaults to 10)
//   action=detail  -> single published article by id (article reader screen)
//   (default)      -> paginated published list (page/limit), newest first
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

    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    if (action === 'detail') {
      const id = url.searchParams.get('id');
      if (!id) {
        return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
      }

      const article = await getPublishedArticleById(id, identifier);
      if (!article) {
        return NextResponse.json({ success: false, error: 'Article not found' }, { status: 404 });
      }

      return NextResponse.json({ data: shapeArticleForDetail(article), success: true });
    }

    if (action === 'latest') {
      const limit = parseInt(url.searchParams.get('limit') || '10', 10);
      const { data } = await getPublishedArticles({ churchId: identifier, page: 1, limit });
      return NextResponse.json({ data: data.map(shapeArticleForList), success: true });
    }

    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const { data, totalCount } = await getPublishedArticles({ churchId: identifier, page, limit });

    return NextResponse.json({
      data: data.map(shapeArticleForList),
      success: true,
      totalCount,
      pagination: { page, limit, totalCount }
    });
  } catch (error) {
    logger.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
};
