import Category from '../models/category';
import { logger } from '../../utils/logger';
import { mongoConnect } from '@/utils/connectDb';

mongoConnect();

const createCategory = async (body) => {
  try {
    const newCategory = await Category.create(body);
    return newCategory
  } catch (error) {
    logger.error(error);
    throw error
  }
};

const getAllCategories = async ({page = 1, limit = 10, sortField, sortOrder, searchQuery}) => {
  const skip = (page - 1) * limit;

  try {
    const sortOptions = {};
    if (sortField) {
      sortOptions[sortField] = sortOrder === 'desc' ? -1 : 1;
    }

    const searchFilter = searchQuery
      ? {
          $or: [
            { name: { $regex: searchQuery, $options: 'i' } },
            { description: { $regex: searchQuery, $options: 'i' } }
          ]
        }
      : {};

    const query = {
      ...searchFilter
    };

    const [categories, totalCount] = await Promise.all([
      Category.find(query).sort(sortOptions).skip(skip).limit(limit).exec(),
      Category.countDocuments()
    ]);

    return {
      data: categories,
      totalCount
    };
  } catch (error) {
    logger.error(error);
    return error
  }
};

const updateCategory = async (categoryId, updateData) => {
  try {
    const updatedCategory = await Category.findByIdAndUpdate(categoryId, updateData, { new: true });
    return updatedCategory
  } catch (error) {
    logger.error(error);
    throw error
  }
};

const deleteCategory = async (categoryId) => {
  try {
    const deletedCategory = await Category.findByIdAndDelete(categoryId);
  
    return deletedCategory
  } catch (error) {
    logger.error(error);
    throw error
  }
};

export { createCategory, getAllCategories, updateCategory, deleteCategory };
