import {
  updateBulk,
  updateChurch,
  updateChurchStatus,
  updateChurchAddress,
  updateChurchContact,
  updateFeatures,
  updateOneChurch
} from '../../../services/churchService';
import { logger } from '../../utils/logger';
import { NextResponse } from 'next/server';

export const PUT = async (req) => {
  try {
    const url = new URL(req.url);
    const userData = req.headers.get('x-user-data');
    const user = userData ? JSON.parse(userData) : null;
    const action = url.searchParams.get('action');
    const body = await req.json();

    if (action === 'bulk') {
      const updated = await updateBulk({ suid: user?.church }, body);
      return NextResponse.json({ success: true, data: updated });
    }

    if (action === 'one') {
      const updated = await updateOneChurch({ suid: user?.church }, body);
      return NextResponse.json({ success: true, data: updated });
    }

    if (action === 'status') {
      const stripeCustomerId = url.searchParams.get('stripeCustomerId');
      const updated = await updateChurchStatus(stripeCustomerId, body);
      return NextResponse.json({ success: true, data: updated });
    }

    if (action === 'address') {
      const updated = await updateChurchAddress({ suid: user?.church }, body);
      return NextResponse.json({ success: true, data: updated });
    }

    if (action === 'contact') {
      const updated = await updateChurchContact({ suid: user?.church }, body);
      return NextResponse.json({ success: true, data: updated });
    }

    if (action === 'features') {
      const updated = await updateFeatures({ suid: user?.church }, body);
      return NextResponse.json({ success: true, data: updated });
    }

    if (action === 'church') {
      const updated = await updateChurch({ suid: user?.church }, body);
      return NextResponse.json({ success: true, data: updated });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    logger.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
};
