import Article from '../models/article';
import { identifierValidator } from '../validation/identifierValidator';
import { articleValidator } from '../validation/articleValidator';
import { logger } from '../../utils/logger';
import { mongoConnect } from '../../utils/connectDb';
import CloudinaryService from '../../lib/CloudinaryService';
import { MAX_ARTICLES_PER_CHURCH, ARTICLE_STATUS } from '../../constants/articles';

mongoConnect();

const articleImageFolder = (churchId) => `${process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_FOLDER}/${churchId}/articles`;

const requireValidId = (id) => {
  const result = identifierValidator(id);
  if (result.length) {
    const error = new Error(result.map((it) => it.message).join(','));
    error.invalidArgs = result.map((it) => it.field).join(',');
    throw error;
  }
};

// Whatever status transition happened, this decides what publishedAt
// should be afterward - the one place that rule lives, called from both
// create and update so they can never drift apart.
//   -> published, wasn't already published before -> stamp "now"
//   -> published, was already published            -> keep the original
//      publishedAt (re-saving/editing a live article isn't a republish)
//   -> draft                                        -> leave untouched,
//      preserving "this was live from X" even while temporarily drafted
const resolvePublishedAt = (nextStatus, existingStatus, existingPublishedAt) => {
  if (nextStatus !== ARTICLE_STATUS.PUBLISHED) {
    return existingPublishedAt ?? null;
  }

  if (existingStatus === ARTICLE_STATUS.PUBLISHED && existingPublishedAt) {
    return existingPublishedAt;
  }

  return new Date();
};

async function getArticleCount(churchId) {
  requireValidId(churchId);
  return Article.countDocuments({ church: churchId });
}

async function createArticle(churchId, body, userId) {
  try {
    requireValidId(churchId);

    const { file, ...fields } = body;
    const bodyErrors = articleValidator(fields);
    if (bodyErrors.length) {
      const error = new Error(bodyErrors.map((it) => it.message).join(','));
      error.invalidArgs = bodyErrors.map((it) => it.field).join(',');
      throw error;
    }

    // Server-side enforcement of MAX_ARTICLES_PER_CHURCH - the UI disabling
    // "+ Add Article" is a courtesy, not the actual gate. Friendly message,
    // not a raw validation error, since this isn't a mistake on the
    // admin's part.
    const existingCount = await getArticleCount(churchId);
    if (existingCount >= MAX_ARTICLES_PER_CHURCH) {
      const error = new Error(
        `You've reached the maximum of ${MAX_ARTICLES_PER_CHURCH} articles. Delete an existing article before adding a new one.`
      );
      error.invalidArgs = 'limit';
      throw error;
    }

    const status = fields.status || ARTICLE_STATUS.DRAFT;
    const uploaded = await CloudinaryService.uploadImage(file, { folder: articleImageFolder(churchId) });

    const article = await Article.create({
      church: churchId,
      title: fields.title,
      summary: fields.summary,
      content: fields.content,
      status,
      publishedAt: resolvePublishedAt(status, null, null),
      createdBy: userId || undefined,
      ...(uploaded && { secure_url: uploaded.secure_url, public_id: uploaded.public_id })
    });

    return article;
  } catch (error) {
    logger.error(error);
    throw new Error(error.message || 'Error creating article');
  }
}

async function updateArticle(id, churchId, body) {
  try {
    requireValidId(id);
    requireValidId(churchId);

    const { file, ...fields } = body;
    const bodyErrors = articleValidator(fields);
    if (bodyErrors.length) {
      const error = new Error(bodyErrors.map((it) => it.message).join(','));
      error.invalidArgs = bodyErrors.map((it) => it.field).join(',');
      throw error;
    }

    const existingArticle = await Article.findOne({ _id: id, church: churchId });
    if (!existingArticle) {
      throw new Error('Article not found');
    }

    const status = fields.status || ARTICLE_STATUS.DRAFT;

    // No new file -> CASE 1: keep the existing secure_url/public_id.
    // New file -> CASE 2: delete the old Cloudinary image, upload the new
    // one, and persist its secure_url/public_id. Same lifecycle as
    // Pastor/About Us/Sliders/Events/Notification, via CloudinaryService.
    const uploaded = await CloudinaryService.replaceImage(file, existingArticle.public_id, {
      folder: articleImageFolder(churchId)
    });

    const updated = await Article.findByIdAndUpdate(
      id,
      {
        title: fields.title,
        summary: fields.summary,
        content: fields.content,
        status,
        publishedAt: resolvePublishedAt(status, existingArticle.status, existingArticle.publishedAt),
        ...(uploaded && { secure_url: uploaded.secure_url, public_id: uploaded.public_id })
      },
      { new: true }
    );

    return updated;
  } catch (error) {
    logger.error(error);
    throw new Error(error.message || 'Error updating article');
  }
}

async function deleteArticle(id, churchId) {
  try {
    requireValidId(id);
    requireValidId(churchId);

    const existingArticle = await Article.findOne({ _id: id, church: churchId });
    if (!existingArticle) {
      throw new Error('Article not found');
    }

    // Best-effort: a failed Cloudinary cleanup is logged but must not block
    // the record deletion the caller asked for.
    await CloudinaryService.deleteImage(existingArticle.public_id);

    await Article.findOneAndDelete({ _id: id, church: churchId });
    return true;
  } catch (error) {
    logger.error(error);
    throw new Error(error.message || 'Error deleting article');
  }
}

async function getArticleById(id, churchId) {
  try {
    requireValidId(id);
    requireValidId(churchId);

    const article = await Article.findOne({ _id: id, church: churchId });
    if (!article) {
      throw new Error('Article not found');
    }

    return article;
  } catch (error) {
    logger.error(error);
    throw new Error(error.message || 'Error fetching article');
  }
}

// Admin list - every status, scoped to the requesting church only.
async function getArticles({ churchId, page = 1, limit = 10, search = '', status = 'ALL', sortField, sortOrder }) {
  try {
    requireValidId(churchId);
    const skip = (page - 1) * limit;

    const sortOptions = sortField ? { [sortField]: sortOrder === 'desc' ? -1 : 1 } : { createdAt: -1 };

    const query = { church: churchId };
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    if (status && status !== 'ALL') {
      query.status = status;
    }

    const [articles, totalCount] = await Promise.all([
      Article.find(query).sort(sortOptions).skip(skip).limit(limit).exec(),
      Article.countDocuments(query)
    ]);

    return { data: articles, totalCount };
  } catch (error) {
    logger.error(error);
    throw new Error('An unexpected error occurred. Please try again.');
  }
}

// ---------------------------------------------------------------------------
// Public/mobile - published only, never a draft, church-scoped via the same
// decrypted "nj-api-key" identifier every other public church-data endpoint
// uses (see app/api/article/get/route.js). Built with pagination in mind
// (page/limit + totalCount) even though the mobile app doesn't consume it
// yet - Phase 2 preparation per the spec.
// ---------------------------------------------------------------------------

async function getPublishedArticles({ churchId, page = 1, limit = 10 }) {
  try {
    requireValidId(churchId);
    const skip = (page - 1) * limit;

    const query = { church: churchId, status: ARTICLE_STATUS.PUBLISHED };

    const [articles, totalCount] = await Promise.all([
      Article.find(query).sort({ publishedAt: -1, createdAt: -1 }).skip(skip).limit(limit).exec(),
      Article.countDocuments(query)
    ]);

    return { data: articles, totalCount, page, limit };
  } catch (error) {
    logger.error(error);
    throw new Error('Error fetching articles');
  }
}

async function getPublishedArticleById(id, churchId) {
  try {
    requireValidId(id);
    requireValidId(churchId);

    // status included in the query itself, not checked after the fact -
    // a draft (or another church's article) simply doesn't match, same
    // "not found" either way, no separate "forbidden" leak.
    const article = await Article.findOne({ _id: id, church: churchId, status: ARTICLE_STATUS.PUBLISHED });
    return article;
  } catch (error) {
    logger.error(error);
    throw new Error('Error fetching article');
  }
}

export {
  createArticle,
  updateArticle,
  deleteArticle,
  getArticleById,
  getArticles,
  getArticleCount,
  getPublishedArticles,
  getPublishedArticleById
};
