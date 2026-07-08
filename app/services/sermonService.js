import Sermon from '../models/sermon';
import { logger } from '../../utils/logger';
import { mongoConnect } from '../../utils/connectDb';

mongoConnect();

const createSermon = async (body) => {
  try {
    const { title, preacher, scripture, description, audioUrl, videoUrl, thumbnailUrl, sermonDate, tags, createdBy } = body;

    if (!title || !createdBy) {
      throw new Error('title and createdBy are required');
    }

    const sermon = new Sermon({
      title,
      preacher,
      scripture,
      description,
      audioUrl,
      videoUrl,
      thumbnailUrl,
      sermonDate: sermonDate ? new Date(sermonDate) : null,
      tags: tags || [],
      createdBy
    });

    await sermon.save();
    return sermon;
  } catch (error) {
    logger.error(error);
    throw new Error(error.message || 'Error creating sermon');
  }
};

const updateSermon = async (id, body) => {
  try {
    const { title, preacher, scripture, description, audioUrl, videoUrl, thumbnailUrl, sermonDate, tags } = body;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (preacher !== undefined) updateData.preacher = preacher;
    if (scripture !== undefined) updateData.scripture = scripture;
    if (description !== undefined) updateData.description = description;
    if (audioUrl !== undefined) updateData.audioUrl = audioUrl;
    if (videoUrl !== undefined) updateData.videoUrl = videoUrl;
    if (thumbnailUrl !== undefined) updateData.thumbnailUrl = thumbnailUrl;
    if (sermonDate !== undefined) updateData.sermonDate = sermonDate ? new Date(sermonDate) : null;
    if (tags !== undefined) updateData.tags = tags;

    const sermon = await Sermon.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    if (!sermon) {
      throw new Error('Sermon not found');
    }

    return sermon;
  } catch (error) {
    logger.error(error);
    throw new Error(error.message || 'Error updating sermon');
  }
};

const deleteSermon = async (id) => {
  try {
    const sermon = await Sermon.findByIdAndDelete(id);

    if (!sermon) {
      throw new Error('Sermon not found');
    }

    return sermon;
  } catch (error) {
    logger.error(error);
    throw new Error(error.message || 'Error deleting sermon');
  }
};

const getSermonById = async (id) => {
  try {
    const sermon = await Sermon.findById(id).populate('createdBy', 'first_name last_name email');

    if (!sermon) {
      throw new Error('Sermon not found');
    }

    return sermon;
  } catch (error) {
    logger.error(error);
    throw new Error(error.message || 'Error fetching sermon');
  }
};

const getAllSermons = async ({ page = 1, limit = 10, sortField = 'createdAt', sortOrder = 'desc' } = {}) => {
  try {
    const skip = (page - 1) * limit;
    const sortOptions = {};
    sortOptions[sortField] = sortOrder === 'desc' ? -1 : 1;

    const [sermons, totalCount] = await Promise.all([
      Sermon.find()
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'first_name last_name email'),
      Sermon.countDocuments()
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

const getLatestSermons = async (limit = 10) => {
  try {
    const sermons = await Sermon.find()
      .sort({ sermonDate: -1, createdAt: -1 })
      .limit(limit)
      .populate('createdBy', 'first_name last_name email');

    return sermons;
  } catch (error) {
    logger.error(error);
    throw new Error(error.message || 'Error fetching latest sermons');
  }
};

const searchSermons = async (searchQuery, { page = 1, limit = 10 } = {}) => {
  try {
    const skip = (page - 1) * limit;

    const [sermons, totalCount] = await Promise.all([
      Sermon.find(
        { $text: { $search: searchQuery } },
        { score: { $meta: 'textScore' } }
      )
        .sort({ score: { $meta: 'textScore' } })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'first_name last_name email'),
      Sermon.countDocuments({ $text: { $search: searchQuery } })
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
    throw new Error(error.message || 'Error searching sermons');
  }
};

const getSermonsByPreacher = async (preacher, { page = 1, limit = 10 } = {}) => {
  try {
    const skip = (page - 1) * limit;

    const [sermons, totalCount] = await Promise.all([
      Sermon.find({ preacher })
        .sort({ sermonDate: -1 })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'first_name last_name email'),
      Sermon.countDocuments({ preacher })
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
    throw new Error(error.message || 'Error fetching sermons by preacher');
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
  getSermonsByPreacher
};
