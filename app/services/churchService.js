import Church from '../models/church';
import { identifierValidator } from '../validation/identifierValidator';
import {
  contactValidator,
  updateAddressValidator,
  updateOneValidator,
  updateFeatureValidator,
  churchUpdateValidator,
  pastorValidator,
  propheticValidator,
  notificationValidator
} from '../validation/churchValidator';
import { logger } from '../../utils/logger';
import { mongoConnect } from '../../utils/connectDb';
import CloudinaryService from '../../lib/CloudinaryService';

mongoConnect();

const churchImageFolder = (suid) => `${process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_FOLDER}/${suid}`;

async function updateProphetic(suid, body) {
  try {
    const identifierValidateResult = identifierValidator(suid);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }

    const bodyErrors = propheticValidator(body);
    if (bodyErrors.length) {
      const error = new Error(bodyErrors.map((it) => it.message).join(','));
      error.invalidArgs = bodyErrors.map((it) => it.field).join(',');
      throw error;
    }

    const updateData = {
      prophetic_focus: body
    };

    const updated = await Church.findByIdAndUpdate(suid, updateData, {
      new: true
    });

    return updated;
  } catch (error) {
    logger.error(error);
    throw new Error(error.message || 'Error updating church prophetic verse');
  }
}

const buildNotificationResponse = (notification) => {
  const type = notification?.type || 'announcement';
  const title = notification?.title || '';
  const message = notification?.message || '';
  const secure_url = notification?.secure_url || '';
  const public_id = notification?.public_id || '';
  const priority = notification?.priority || 'normal';
  const status = notification?.status ?? true;
  const start_date = notification?.start_date || null;
  const expiry_date = notification?.expiry_date || null;

  return {
    type,
    title,
    message,
    secure_url,
    public_id,
    priority,
    status,
    start_date,
    expiry_date,
    isExpired: expiry_date ? new Date(expiry_date) < new Date() : false
  };
};

async function getNotification(suid) {
  try {
    const identifierValidateResult = identifierValidator(suid);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }

    const church = await Church.findById(suid).select('notification').lean();
    return buildNotificationResponse(church?.notification);
  } catch (error) {
    logger.error(error);
    throw new Error(error.message || 'Error fetching church notification');
  }
}

async function updateNotification(suid, body) {
  try {
    const identifierValidateResult = identifierValidator(suid);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }

    const { file, removeImage, ...notificationFields } = body;
    const bodyErrors = notificationValidator(notificationFields);
    if (bodyErrors.length) {
      const error = new Error(bodyErrors.map((it) => it.message).join(','));
      error.invalidArgs = bodyErrors.map((it) => it.field).join(',');
      throw error;
    }

    const { type, title, message, priority, status, start_date, expiry_date } = notificationFields;

    if (start_date && expiry_date && new Date(expiry_date) < new Date(start_date)) {
      const error = new Error('Expiry date must not be before the start date');
      error.invalidArgs = 'expiry_date';
      throw error;
    }

    const existingChurch = await Church.findById(suid).select('notification');
    const existingNotification = existingChurch?.notification || {};

    // No new file, no removal requested -> CASE 1: keep the existing
    // secure_url/public_id.
    // New file -> CASE 2: delete the old Cloudinary image, upload the new
    // one, and persist its secure_url/public_id.
    // No new file, removal requested -> CASE 3: delete the old Cloudinary
    // image and clear secure_url/public_id back to empty - a file always
    // wins over a removal request if both are somehow sent together.
    //
    // notification is a single embedded (non-array) subdocument, same as
    // pastor_section - a plain `{ notification: {...} }` update fully
    // replaces it rather than merging, so secure_url/public_id must always
    // be explicitly included (new, cleared, or carried-forward) or they'd
    // be reset to their schema defaults on every save.
    let uploaded = await CloudinaryService.replaceImage(file, existingNotification.public_id, {
      folder: churchImageFolder(suid)
    });

    if (!uploaded && removeImage && existingNotification.public_id) {
      await CloudinaryService.deleteImage(existingNotification.public_id);
      uploaded = { secure_url: '', public_id: '' };
    }

    const notification = {
      type: type || 'announcement',
      title,
      message,
      priority: priority || 'normal',
      status: status ?? true,
      start_date: start_date || null,
      expiry_date: expiry_date || null,
      public_id: uploaded ? uploaded.public_id : existingNotification.public_id,
      secure_url: uploaded ? uploaded.secure_url : existingNotification.secure_url
    };

    // $set only the notification object so the existing value is overwritten in place,
    // never appended, and the rest of the Church document is left untouched.
    await Church.findByIdAndUpdate(suid, { $set: { notification } }, { new: true });

    return buildNotificationResponse(notification);
  } catch (error) {
    logger.error(error);
    throw new Error(error.message || 'Error updating church notification');
  }
}

async function updatePastor(suid, body) {
  try {
    const identifierValidateResult = identifierValidator(suid);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }

    const { file, ...pastorFields } = body;
    const bodyErrors = pastorValidator(pastorFields);
    if (bodyErrors.length) {
      const error = new Error(bodyErrors.map((it) => it.message).join(','));
      error.invalidArgs = bodyErrors.map((it) => it.field).join(',');
      throw error;
    }

    const existingChurch = await Church.findById(suid).select('pastor_section');
    const existingPastorSection = existingChurch?.pastor_section || {};

    // No new file -> CASE 1: keep the existing secure_url/public_id.
    // New file -> CASE 2: delete the old Cloudinary image, upload the new
    // one, and persist its secure_url/public_id.
    //
    // pastor_section is a single embedded (non-array) subdocument, so a
    // plain `{ pastor_section: {...} }` update fully replaces it rather
    // than merging - public_id/secure_url must always be explicitly
    // included (new or carried-forward) or they'd be reset to their schema
    // defaults on every save.
    const uploaded = await CloudinaryService.replaceImage(file, existingPastorSection.public_id, {
      folder: churchImageFolder(suid)
    });

    const pastor_section = {
      title: pastorFields.title,
      description: pastorFields.description,
      first_name: pastorFields.first_name,
      last_name: pastorFields.last_name,
      public_id: uploaded ? uploaded.public_id : existingPastorSection.public_id,
      secure_url: uploaded ? uploaded.secure_url : existingPastorSection.secure_url
    };

    await Church.findByIdAndUpdate(suid, { pastor_section }, { new: true });

    return true;
  } catch (error) {
    console.error(error);
    throw new Error('Error updating church pastor');
  }
}

async function updateChurchContact(suid, body) {
  try {
    const identifierValidateResult = identifierValidator(suid);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }

    const bodyErrors = contactValidator(body);
    if (bodyErrors.length) {
      const error = new Error(bodyErrors.map((it) => it.message).join(','));
      error.invalidArgs = bodyErrors.map((it) => it.field).join(',');
      throw error;
    }
    await Church.findByIdAndUpdate(suid, body, {
      new: true
    });

    return true;
  } catch (error) {
    logger.error(error);
    throw new Error('Error updating church contact');
  }
}
async function updateFeatures(suid, features) {
  try {
    const validateResult = updateFeatureValidator({ features });
    if (validateResult.length) {
      const error = new Error(validateResult.map((it) => it.message).join(','));
      error.invalidArgs = validateResult.map((it) => it.field).join(',');
      throw error;
    }

    await Church.updateOne({ _id: suid }, { $set: { features } });
    return true;
  } catch (error) {
    logger.error(error);
    throw new Error('Error while trying to update church features.');
  }
}
async function updateChurchAddress(suid, body) {
  try {
    const identifierValidateResult = identifierValidator(suid);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }

    const bodyErrors = updateAddressValidator(body);
    if (bodyErrors.length) {
      const error = new Error(bodyErrors.map((it) => it.message).join(','));
      error.invalidArgs = bodyErrors.map((it) => it.field).join(',');
      throw error;
    }
    await Church.updateOne(
      { _id: suid },
      {
        $set: {
          address: body
        }
      }
    );

    return true;
  } catch (error) {
    logger.error(error);
    throw new Error('Error updating church address');
  }
}
async function deleteChurch(id) {
  try {
    const identifierValidateResult = identifierValidator(id);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }

    const church = await Church.findById(id).select('public_id pastor_section sliders');

    if (church) {
      // Every Cloudinary image that lives directly on this Church document
      // (logo, pastor photo, slider images) is about to become unreachable
      // once the document is removed - clean each one up first. Best-effort:
      // logged failures must not block the record deletion itself.
      const publicIds = [
        church.public_id,
        church.pastor_section?.public_id,
        ...(church.sliders || []).map((slider) => slider.public_id)
      ].filter(Boolean);

      await Promise.all(publicIds.map((publicId) => CloudinaryService.deleteImage(publicId)));
    }

    await Church.findByIdAndDelete(id);
    return true;
  } catch (error) {
    logger.error(error);
    throw new Error('Error deleting church');
  }
}
async function getChurch(id) {
  try {
    const identifierValidateResult = identifierValidator(id);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }

    // secure_url/public_id: the church's official banner image (uploaded on
    // the admin's About Us page - see updateBulk above). Was previously
    // missing from this whitelist, so the mobile app's "get selected
    // church" call (GET /api/church/get) never received it even though the
    // search endpoint did.
    // giving_url: the church's external online-giving link (Settings ->
    // Config, admin portal). Same gap as secure_url above - present on the
    // Church model but missing from this whitelist, so GET /church/get
    // never returned it. Backs the mobile app's "Give online" card
    // (app/(app)/give.tsx).
    const data = await Church.findById(id).select('name pastor_section prophetic_focus mobile email description denomination short_message verse address features sliders contacts currency bank_name account_number sort_code tax_rate notification secure_url public_id conference_link support_email logo_url logo_id giving_url').lean();
    return {
      ...data,
      notification: buildNotificationResponse(data?.notification)
    };
  } catch (error) {
    logger.error(error);
    throw new Error(error.message || 'Error fetching church');
  }
}
async function getChurchByIdentifier(id) {
  try {
    const identifierValidateResult = identifierValidator(id);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }

    const result = await Church.findById(id).lean();
    return result;
  } catch (error) {
    logger.error(error);
    throw new Error('Error fetching church');
  }
}
async function getChurchesByName(churchName) {
  try {
    const churches = await Church.find({ name: new RegExp(churchName, 'i') });
    return churches;
  } catch (error) {
    logger.error(error);
    throw new Error('Error fetching churches');
  }
}
async function updateBulk(suid, body) {
  try {
    const identifierValidateResult = identifierValidator(suid);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }

    // Only the "About Us" save passes any of these four, and it manages
    // two entirely independent images: `file`/`removeBanner` for the
    // church BANNER (secure_url/public_id), `logoFile`/`removeLogo` for
    // the church LOGO (logo_url/logo_id) - see app/models/church.js.
    // Every other caller of this generic bulk-update (bank transfer,
    // social media, config, ...) never includes any of them, so this
    // whole block is a no-op for them.
    const { file, removeBanner, logoFile, removeLogo, ...fields } = body;

    const needsExisting = file || removeBanner || logoFile || removeLogo;
    const existingChurch = needsExisting ? await Church.findById(suid).select('public_id logo_id') : null;

    if (file || removeBanner) {
      // Same CASE 1/2/3 lifecycle as updateNotification() above: neither a
      // file nor a removal request reaches here at all (banner untouched,
      // simply omitted from `fields`, below). A file -> CASE 2: delete the
      // old banner (if any), upload the new one, and persist its
      // secure_url/public_id. No file but removal requested -> CASE 3:
      // delete the old banner and clear both fields. A file always wins
      // over a removal request if somehow both are sent together (mirrors
      // CloudinaryService.replaceImage, which only ever acts on a file).
      let uploaded = await CloudinaryService.replaceImage(file, existingChurch?.public_id, {
        folder: churchImageFolder(suid)
      });

      if (!uploaded && removeBanner && existingChurch?.public_id) {
        await CloudinaryService.deleteImage(existingChurch.public_id);
        uploaded = { secure_url: '', public_id: '' };
      }

      if (uploaded) {
        fields.public_id = uploaded.public_id;
        fields.secure_url = uploaded.secure_url;
      }
    }

    if (logoFile || removeLogo) {
      // Identical lifecycle, entirely independent asset/fields - removing
      // or replacing the logo never touches the banner's Cloudinary asset
      // or its secure_url/public_id, and vice versa.
      let uploadedLogo = await CloudinaryService.replaceImage(logoFile, existingChurch?.logo_id, {
        folder: churchImageFolder(suid)
      });

      if (!uploadedLogo && removeLogo && existingChurch?.logo_id) {
        await CloudinaryService.deleteImage(existingChurch.logo_id);
        uploadedLogo = { secure_url: '', public_id: '' };
      }

      if (uploadedLogo) {
        fields.logo_id = uploadedLogo.public_id;
        fields.logo_url = uploadedLogo.secure_url;
      }
    }

    await Church.findByIdAndUpdate(suid, fields);
    return true;
  } catch (error) {
    console.error(error);
    throw new Error('Error updating church settings');
  }
}
async function updateOneChurch(suid, name, value) {
  try {
    const validateResult = updateOneValidator({ name, value });

    if (validateResult.length) {
      const error = new Error(validateResult.map((it) => it.message).join(','));
      error.invalidArgs = validateResult.map((it) => it.field).join(',');
      throw error;
    }
    const updatedChurch = await Church.findByIdAndUpdate(suid, { $set: { [name]: value } }, { new: true });

    if (!updatedChurch) {
      throw new Error('Church not found or invalid ID');
    }

    return true;
  } catch (error) {
    logger.error(error);
    throw new Error('Error updating church');
  }
}
async function getChurchesByCountryCode(countryCode) {
  try {
    const churches = await Church.find({
      'address.country_code': new RegExp(countryCode, 'i')
    });
    return churches;
  } catch (error) {
    logger.error(error);
    throw new Error('Error fetching churches');
  }
}
async function searchChurches(searchTerm) {
  try {
    const churches = await Church.find({
      $text: { $search: searchTerm }
    }).limit(100);
    return churches;
  } catch (error) {
    logger.error(error);
    throw new Error('Error searching for churches');
  }
}
async function searchChurchesWithinRadius(latitude, longitude, radius) {
  try {
    const churches = await Church.find({
      'address.location': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseFloat(radius) * 1000
        }
      }
    }).limit(100);

    return churches;
  } catch (error) {
    logger.error(error);
    throw new Error('Error searching for churches');
  }
}
const getAggregateChurchStatus = async () => {
  try {
    const result = await Church.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    return result;
  } catch (error) {
    throw new Error('Error aggregating churches status. Please try again.');
  }
};
const getRecentChurches = async (limit = 10) => {
  try {
    const recentChurches = await Church.find({}).sort({ createdAt: -1 }).limit(limit);

    return recentChurches;
  } catch (error) {
    logger.error(error);
    throw new Error('Error fetching recent churches. Please try again.');
  }
};
async function getChurches({ page = 1, limit = 10, sortField, sortOrder, searchQuery }) {
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
          { mobile: { $regex: searchQuery, $options: 'i' } },
          { email: { $regex: searchQuery, $options: 'i' } },
          { plan: { $regex: searchQuery, $options: 'i' } }
        ]
      }
      : {};

    const query = {
      ...searchFilter
    };

    const [churches, totalCount] = await Promise.all([
      Church.find(query).sort(sortOptions).skip(skip).limit(limit).exec(),
      Church.countDocuments({})
    ]);

    return {
      data: churches,
      totalCount
    };
  } catch (error) {
    logger.error(error);
    throw new Error('An unexpected error occurred. Please try again.');
  }
}
async function getWeeklyChurchSignOnData() {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const result = await Church.aggregate([
      {
        $match: {
          startDate: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$startDate' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const data = [];
    const dateMap = result.reduce((acc, cur) => {
      acc[cur._id] = cur.count;
      return acc;
    }, {});

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      data.push(dateMap[dateString] || 0);
    }

    return data;
  } catch (error) {
    logger.error(error);
    throw new Error('Error fetching church sign-on data.');
  }
}
async function updateChurch(id, body) {
  try {
    const bodyErrors = churchUpdateValidator(body);
    if (bodyErrors.length) {
      const error = new Error(bodyErrors.map((it) => it.message).join(','));
      error.invalidArgs = bodyErrors.map((it) => it.field).join(',');
      throw error;
    }

    const updated = await Church.findByIdAndUpdate(id, body, {
      new: true
    });

    return updated;
  } catch (error) {
    logger.error(error);
    throw new Error('An unexpected error occurred. Please try again.');
  }
}
async function updateChurchStatus(stripeCustomerId, body) {
  try {
    const updated = await Church.findOneAndUpdate({ stripeCustomerId: stripeCustomerId }, body, { new: true });

    if (!updated) {
      logger.warn({ stripeCustomerId, body }, 'Church not found for status update');
      return null;
    }

    return updated;
  } catch (error) {
    logger.error(error);
    throw new Error('Error updating church status');
  }
}
async function getVerifySubscriptionStatus(id) {
  try {
    const result = await Church.findOne({ stripeCustomerId: id });

    console.log(`Subscription status for customer ${id}:`, result);
    
    return {
      active: result?.status === 'active'
    };
  } catch (error) {
    logger.error(`Failed to verify subscription for customer ${id}:`, error);
    throw new Error(`Unable to verify subscription status`);
  }
}

export {
  getVerifySubscriptionStatus,
  getAggregateChurchStatus,
  getRecentChurches,
  getChurches,
  getWeeklyChurchSignOnData,
  updateChurch,
  updateChurchStatus,
  updateChurchAddress,
  deleteChurch,
  getChurch,
  getChurchesByName,
  updateBulk,
  updateOneChurch,
  getChurchesByCountryCode,
  searchChurches,
  searchChurchesWithinRadius,
  getChurchByIdentifier,
  updateFeatures,
  updateChurchContact,
  updatePastor,
  updateProphetic,
  getNotification,
  updateNotification
};
