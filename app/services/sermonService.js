import Sermon from '../models/sermon';
import User from '../models/user';
import '../models/serviceTime';
import { identifierValidator } from '../validation/identifierValidator';
import { sermonValidator } from '../validation/sermonValidator';
import { logger } from '../../utils/logger';
import { mongoConnect } from '../../utils/connectDb';

mongoConnect();

const DEFAULT_SERMON_SORT_FIELD = 'preachedAt';

const normalizeChurchId = (currentUser) => {
  return currentUser?.church?._id || currentUser?.church || currentUser?.suid || currentUser?.churchId || null;
};

const normalizeUserId = (currentUser) => {
  return currentUser?._id || currentUser?.id || currentUser?.userId || null;
};

const buildRegex = (value) => new RegExp(value.trim(), 'i');

const validateIdentifier = (id) => {
  const validationResult = identifierValidator(id);

  if (validationResult.length) {
    const error = new Error(validationResult.map((it) => it.message).join(','));
    error.invalidArgs = validationResult.map((it) => it.field).join(',');
    throw error;
  }
};

const buildSortOptions = (sortField, sortOrder, defaultField) => {
  const sortOptions = {};
  sortOptions[sortField || defaultField] = sortOrder === 'asc' ? 1 : -1;
  return sortOptions;
};

const sanitizeSermonPayload = (data = {}) => {
  const media = {
    youtubeUrl: data.media?.youtubeUrl || '',
    audioUrl: data.media?.audioUrl || '',
    videoUrl: data.media?.videoUrl || '',
    thumbnail: data.media?.thumbnail || ''
  };

  const payload = {
    title: data.title,
    speakerName: data.speakerName,
    serviceId: data.serviceId || undefined,
    summary: data.summary,
    media,
    durationMinutes: data.durationMinutes,
    preachedAt: data.preachedAt ? new Date(data.preachedAt) : data.preachedAt,
    status: data.status
  };

  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined));
};

const populateSermonQuery = (query) => {
  return query
    .populate('serviceId', 'title start_time end_time days')
    .populate('createdBy', 'first_name last_name email')
    .populate('updatedBy', 'first_name last_name email');
};

const validateSermonPayload = (payload) => {
  const errors = sermonValidator(payload);

  if (errors.length) {
    const error = new Error(errors.map((it) => it.message).join(','));
    error.invalidArgs = errors.map((it) => it.field).join(',');
    throw error;
  }
};

const buildSpeakerNameFilter = async ({ churchId, speakerId, speakerName }) => {
  if (speakerName && speakerName.trim()) {
    return { speakerName: buildRegex(speakerName) };
  }

  if (speakerId) {
    validateIdentifier(speakerId);

    const speaker = await User.findOne({ _id: speakerId, church: churchId }).select('first_name last_name').lean();

    if (!speaker) {
      return { _id: null };
    }

    const fullName = `${speaker.first_name || ''} ${speaker.last_name || ''}`.trim();
    return { speakerName: buildRegex(`^${fullName}$`) };
  }

  return {};
};

const buildSermonQuery = async ({ churchId, search, query, status, speakerId, speakerName, serviceId, startDate, endDate } = {}) => {
  const scopedQuery = { churchId };
  const searchTerm = (search || query || '').trim();

  if (status && status !== 'ALL') {
    scopedQuery.status = status;
  }

  if (serviceId && serviceId !== 'ALL') {
    validateIdentifier(serviceId);
    scopedQuery.serviceId = serviceId;
  }

  if (startDate || endDate) {
    scopedQuery.preachedAt = {};
    if (startDate) scopedQuery.preachedAt.$gte = new Date(startDate);
    if (endDate) scopedQuery.preachedAt.$lte = new Date(endDate);
  }

  const speakerFilter = await buildSpeakerNameFilter({ churchId, speakerId, speakerName });
  Object.assign(scopedQuery, speakerFilter);

  if (searchTerm) {
    scopedQuery.$text = { $search: searchTerm };
  }

  return scopedQuery;
};

const createSermon = async (data, currentUser) => {
  try {
    const churchId = normalizeChurchId(currentUser);
    const createdBy = normalizeUserId(currentUser);

    if (!churchId || !createdBy) {
      throw new Error('Authenticated user context is required');
    }

    validateIdentifier(churchId);
    validateIdentifier(createdBy);

    if (data.serviceId) validateIdentifier(data.serviceId);
    const payload = {
      churchId,
      createdBy,
      ...sanitizeSermonPayload(data)
    };

    validateSermonPayload(payload);

    const sermon = await Sermon.create(payload);
    return populateSermonQuery(Sermon.findById(sermon._id));
  } catch (error) {
    logger.error(error);
    throw new Error(error.message || 'Error creating sermon');
  }
};

const updateSermon = async (id, data, currentUser) => {
  try {
    validateIdentifier(id);

    const churchId = normalizeChurchId(currentUser);
    const updatedBy = normalizeUserId(currentUser);

    if (!churchId || !updatedBy) {
      throw new Error('Authenticated user context is required');
    }

    const existing = await Sermon.findOne({ _id: id, churchId });

    if (!existing) {
      throw new Error('Sermon not found');
    }

    if (data.serviceId) validateIdentifier(data.serviceId);

    const updatePayload = {
      ...sanitizeSermonPayload(data),
      updatedBy
    };

    const validationPayload = {
      churchId: String(existing.churchId),
      title: updatePayload.title ?? existing.title,
      speakerName: updatePayload.speakerName ?? existing.speakerName,
      serviceId: updatePayload.serviceId !== undefined ? String(updatePayload.serviceId) : existing.serviceId ? String(existing.serviceId) : '',
      summary: updatePayload.summary ?? existing.summary,
      media: updatePayload.media ?? existing.media,
      durationMinutes: updatePayload.durationMinutes ?? existing.durationMinutes,
      preachedAt: updatePayload.preachedAt ?? existing.preachedAt,
      status: updatePayload.status ?? existing.status,
      createdBy: String(existing.createdBy),
      updatedBy: String(updatedBy)
    };

    validateSermonPayload(validationPayload);

    const sermon = await Sermon.findOneAndUpdate(
      { _id: id, churchId },
      updatePayload,
      { new: true, runValidators: true }
    );

    return populateSermonQuery(Sermon.findById(sermon._id));
  } catch (error) {
    logger.error(error);
    throw new Error(error.message || 'Error updating sermon');
  }
};

const deleteSermon = async (id, currentUser) => {
  try {
    validateIdentifier(id);
    const churchId = normalizeChurchId(currentUser);

    const sermon = await Sermon.findOneAndDelete({ _id: id, churchId });

    if (!sermon) {
      throw new Error('Sermon not found');
    }

    return true;
  } catch (error) {
    logger.error(error);
    throw new Error(error.message || 'Error deleting sermon');
  }
};

const getSermonById = async (id, churchId) => {
  try {
    validateIdentifier(id);
    validateIdentifier(churchId);

    const sermon = await populateSermonQuery(Sermon.findOne({ _id: id, churchId }));

    if (!sermon) {
      throw new Error('Sermon not found');
    }

    return sermon;
  } catch (error) {
    logger.error(error);
    throw new Error(error.message || 'Error fetching sermon');
  }
};

const getAllSermons = async ({ churchId, page = 1, limit = 10, search = '', status = 'ALL', speakerId, speakerName, serviceId, startDate, endDate, sortField = DEFAULT_SERMON_SORT_FIELD, sortOrder = 'desc' } = {}) => {
  try {
    validateIdentifier(churchId);
    const skip = (page - 1) * limit;
    const query = await buildSermonQuery({ churchId, search, status, speakerId, speakerName, serviceId, startDate, endDate });
    const sortOptions = search && search.trim()
      ? { score: { $meta: 'textScore' }, [sortField]: sortOrder === 'asc' ? 1 : -1 }
      : buildSortOptions(sortField, sortOrder, DEFAULT_SERMON_SORT_FIELD);

    const [sermons, totalCount] = await Promise.all([
      populateSermonQuery(
        Sermon.find(query, search && search.trim() ? { score: { $meta: 'textScore' } } : undefined)
          .sort(sortOptions)
          .skip(skip)
          .limit(limit)
      ),
      Sermon.countDocuments(query)
    ]);

    return {
      data: sermons,
      totalCount,
      page,
      limit,
      pages: Math.ceil(totalCount / limit)
    };
  } catch (error) {
    logger.error(error);
    throw new Error(error.message || 'Error fetching sermons');
  }
};

const getLatestSermons = async ({ churchId, limit = 10 } = {}) => {
  try {
    validateIdentifier(churchId);

    return populateSermonQuery(
      Sermon.find({ churchId })
        .sort({ preachedAt: -1, createdAt: -1 })
        .limit(limit)
    );
  } catch (error) {
    logger.error(error);
    throw new Error(error.message || 'Error fetching latest sermons');
  }
};

const searchSermons = async ({ churchId, query, page = 1, limit = 10 } = {}) => {
  try {
    return getAllSermons({ churchId, page, limit, search: query });
  } catch (error) {
    logger.error(error);
    throw new Error(error.message || 'Error searching sermons');
  }
};

const getSermonsBySpeaker = async ({ churchId, speakerId, speakerName, page = 1, limit = 10 } = {}) => {
  try {
    return getAllSermons({ churchId, page, limit, speakerId, speakerName, search: '', serviceId: undefined, status: 'ALL', startDate: undefined, endDate: undefined, sortField: DEFAULT_SERMON_SORT_FIELD, sortOrder: 'desc' });
  } catch (error) {
    logger.error(error);
    throw new Error(error.message || 'Error fetching sermons by speaker');
  }
};

const publishSermon = async (id, currentUser) => {
  try {
    return updateSermon(id, { status: 'PUBLISHED' }, currentUser);
  } catch (error) {
    logger.error(error);
    throw new Error(error.message || 'Error publishing sermon');
  }
};

const archiveSermon = async (id, currentUser) => {
  try {
    return updateSermon(id, { status: 'ARCHIVED' }, currentUser);
  } catch (error) {
    logger.error(error);
    throw new Error(error.message || 'Error archiving sermon');
  }
};

export {
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
};
