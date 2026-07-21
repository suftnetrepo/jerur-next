import { getChurchByIdentifier } from '../../services/churchService';
import { logger } from '../../../utils/logger';
import { encrypt } from '../../../utils/helpers';
import { NextResponse } from 'next/server';
import { getUserSession } from '../../../utils/generateToken';

export const GET = async (req) => {
  try {
    const user = await getUserSession(req);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await getChurchByIdentifier(user.church);
    const responseData = { ...data, client_secret: encrypt(data._id.toString()) };
    return NextResponse.json({ data: responseData, success: true });
  } catch (error) {
    logger.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
};
