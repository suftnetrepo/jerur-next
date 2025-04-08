import User from './../models/user';
import mongoose from 'mongoose'
import Church from './../models/church';
import { logger } from '../../utils/logger';
import { userValidator, userEditValidator } from '@/validator';
import { isValidObjectId, generatePassword, comparePassword } from '@/utils/helpers';
import { mongoConnect } from '@/utils/connectDb';

mongoConnect();

async function getUsers({ page = 1, limit = 10, sortField = 'createdAt', sortOrder = 'desc', searchQuery }) {
  const skip = (page - 1) * limit;

  try {
    // Provide default sort options if none specified
    const sortOptions = {};
    sortOptions[sortField || 'createdAt'] = sortOrder === 'desc' ? -1 : 1;

    const pipeline = [
      // Join with church collection
      { $lookup: {
          from: 'churches',
          localField: 'church',
          foreignField: '_id',
          as: 'churchData'
      }},
      // Unwind the churchData array
      { $unwind: '$churchData' },
      // Match based on all fields including church name
      { $match: searchQuery ? {
          $or: [
            { first_name: { $regex: searchQuery, $options: 'i' } },
            { last_name: { $regex: searchQuery, $options: 'i' } },
            { email: { $regex: searchQuery, $options: 'i' } },
            { role: { $regex: searchQuery, $options: 'i' } },
            { 'churchData.name': { $regex: searchQuery, $options: 'i' } }
          ]
        } : {} },
      // Sort results
      { $sort: sortOptions },
      // Skip for pagination
      { $skip: skip },
      // Limit results
      { $limit: parseInt(limit) },
      // Project to reshape the document - maintain church name and exclude password
      { $project: {
          _id: 1,
          first_name: 1,
          last_name: 1,
          email: 1,
          role: 1,
          mobile: 1,
          user_status: 1,
          profilePicture: 1,
          bio: 1,
          secure_url: 1,
          public_id: 1,
          fcm: 1,
          createdAt: 1,
          updatedAt: 1,
          church: {
            _id: '$churchData._id',
            name: '$churchData.name'
          }
      }}
    ];

    // Count documents using similar query
    const countPipeline = [
      { $lookup: {
          from: 'churches',
          localField: 'church',
          foreignField: '_id',
          as: 'churchData'
      }},
      { $unwind: '$churchData' },
      { $match: searchQuery ? {
          $or: [
            { first_name: { $regex: searchQuery, $options: 'i' } },
            { last_name: { $regex: searchQuery, $options: 'i' } },
            { email: { $regex: searchQuery, $options: 'i' } },
            { role: { $regex: searchQuery, $options: 'i' } },
            { 'churchData.name': { $regex: searchQuery, $options: 'i' } }
          ]
        } : {} },
      { $count: "total" }
    ];

    const [users, countResult] = await Promise.all([
      User.aggregate(pipeline),
      User.aggregate(countPipeline)
    ]);

    const totalCount = countResult.length > 0 ? countResult[0].total : 0;

    return {
      data: users,
      totalCount
    };
  } catch (error) {
    logger.error(error);
    throw new Error('An unexpected error occurred. Please try again.');
  }
}

async function getUserById(id) {
  if (!isValidObjectId(id)) {
    throw new Error(JSON.stringify([{ field: 'id', message: 'Invalid MongoDB ObjectId' }]));
  }

  try {
    try {
      const results = await User.findOne({ _id: id }).select('-password').exec();
      return results;
    } catch (error) {
      throw error;
    }
  } catch (error) {
    logger.error(error);
    throw new Error('An unexpected error occurred. Please try again.');
  }
}

async function createUser(body) {
  const { email } = body;

  const existingUser = await User.findOne({ email: email });
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  const bodyErrors = userValidator(body);
  if (bodyErrors.length) {
    throw new Error(bodyErrors.map((it) => it.message).join(','));
  }

  try {
    const newUser = await User.create({
      password: await generatePassword('12345!'),
      ...body
    });

    if (!newUser) {
      throw new Error('create new user failed');
    }

    return newUser;
  } catch (error) {
    logger.error(error);
    throw new Error('An unexpected error occurred. Please try again.');
  }
}

async function updateUser(id, body) {
  if (!isValidObjectId(id)) {
    throw new Error(JSON.stringify([{ field: 'id', message: 'Invalid MongoDB ObjectId' }]));
  }

  const bodyErrors = userEditValidator(body);
  if (bodyErrors.length) {
    throw new Error(bodyErrors.map((it) => it.message).join(','));
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(id, body, {
      new: true
    });

    if (!updatedUser) {
      throw new Error('User not found or update failed');
    }

    return true;
  } catch (error) {
    logger.error(error);
    throw new Error('An unexpected error occurred. Please try again.');
  }
}

async function changePassword(id, body) {
  if (!isValidObjectId(id)) {
    throw new Error(JSON.stringify([{ field: 'id', message: 'Invalid MongoDB ObjectId' }]));
  }

  const newPassword = {
    password: await generatePassword(body?.password)
  };

  try {
    await User.findByIdAndUpdate(id, newPassword);
    return true;
  } catch (error) {
    console.error(error);
    throw new Error('An unexpected error occurred. Please try again.');
  }
}

async function removeUser(id) {
  if (!isValidObjectId(id)) {
    throw new Error(JSON.stringify([{ field: 'id', message: 'Invalid MongoDB ObjectId' }]));
  }

  try {
    await User.findOneAndDelete({ _id: id });
    return true;
  } catch (error) {
    console.error(error);
    throw new Error('An unexpected error occurred. Please try again.');
  }
}

async function searchUsers(searchTerm) {
  try {
    const regex = new RegExp(searchTerm, 'i');
    return User.find({
      $or: [{ first_name: regex }, { last_name: regex }, { email: regex }]
    }).limit(10);
  } catch (error) {
    logger.error(error);
    throw new Error('An unexpected error occurred. Please try again.');
  }
}

const aggregateUserDataByRole = async (church) => {
  try {
    const data = await User.aggregate([
      { $match: { church: new mongoose.Types.ObjectId(church) } },
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          role: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);

    return data;
  } catch (error) {
    console.error(error);
    throw new Error('Error aggregating user data. Please try again.');
  }
};

const authenticateUser = async (email, password) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('User not found. Please sign up for an account.');
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    return user;
  } catch (error) {
    logger.error(error);
    throw new Error('An unexpected error occurred. Please try again.');
  }
};

export {
  searchUsers,
  aggregateUserDataByRole,
  getUsers,
  removeUser,
  updateUser,
  getUserById,
  changePassword,
  createUser,
  authenticateUser
};
