import Church from '../models/church';
import { churchValidator } from '../validation/churchValidator';
import { logger } from '../../utils/logger';
import { mongoConnect } from '@/utils/connectDb';

mongoConnect();

async function createChurch(body) {
  try {
    const bodyErrors = churchValidator({ ...body });
    if (bodyErrors.length) {
      const error = new Error(bodyErrors.map((it) => it.message).join(','));
      error.invalidArgs = bodyErrors.map((it) => it.field).join(',');
      throw error;
    }

    const newChurch = await Church.create({
      ...body
    });

    if (!newChurch) {
      throw new Error('create new church failed');
    }

    return newChurch;
  } catch (error) {
    logger.error(error);
    throw error;
  }
}

export { createChurch };
