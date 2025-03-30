import Church from '../models';
import { identifierValidator } from '../validation/identifierValidator';
import {
  contactValidator,
  updateAddressValidator,
  updateOneValidator,
  updateFeatureValidator
} from '../validation/churchValidator';
import { logger } from '../../utils/logger';

async function updateChurchContact({ suid }, body) {
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

async function updateFeatures({ suid }, features) {
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

async function updateChurchAddress({ suid }, body) {
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
    await Church.findByIdAndRemove(id);
    return true;
  } catch (error) {
    logger.error(error);
    throw new Error('Error deleting church');
  }
}
async function getChurchById(id) {
  try {
    const identifierValidateResult = identifierValidator(id);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }
    const church = await Church.findById(id);
    return church;
  } catch (error) {
    logger.error(error);
    throw new Error('Error fetching church');
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

    const church = await Church.findById(id, {
      name: 1,
      mobile: 1,
      email: 1,
      address: 1,
      contacts: 1,
      sliders: 1,
      secure_url: 1,
      public_id: 1,
      logo_url: 1,
      logo_id: 1,
      currency: 1,
      description: 1
    });
    return church;
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
async function updateBulk({ suid }, body) {
  try {
    const identifierValidateResult = identifierValidator(suid);
    if (identifierValidateResult.length) {
      const error = new Error(identifierValidateResult.map((it) => it.message).join(','));
      error.invalidArgs = identifierValidateResult.map((it) => it.field).join(',');
      throw error;
    }
    await Church.findByIdAndUpdate(suid, body);
    return true;
  } catch (error) {
    logger.error(error);
    throw new Error('Error updating contacts');
  }
}
async function updateOneChurch({ suid }, name, value) {
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

export {
  updateChurchContact,
  updateChurchAddress,
  deleteChurch,
  getChurchById,
  getChurchesByName,
  updateBulk,
  updateOneChurch,
  getChurchesByCountryCode,
  searchChurches,
  searchChurchesWithinRadius,
  getChurchByIdentifier,
  updateFeatures,
  updateChurchContact
};
