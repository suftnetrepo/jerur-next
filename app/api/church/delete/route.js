import { getUserSession } from '../../../../utils/generateToken';
import { deleteChurch } from '../../../services/churchService';
import { logger } from '../../../../utils/logger';
import { NextResponse } from 'next/server';

export const DELETE = async (req) => {
  try {

    const user = await getUserSession(req, { requireActiveSubscription: false });

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    const targetChurchId = user.church || id;

    if (!targetChurchId) {
      return NextResponse.json({ success: false, error: 'Church id is required' }, { status: 400 });
    }

    if (user.church && id && id !== String(user.church)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const deleted = await deleteChurch(targetChurchId);
    return NextResponse.json({ success: true, data: deleted });
  } catch (error) {
    logger.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
};
