import { logger } from '../../../../utils/logger';
import {
  updateBulk,
  updateChurchStatus,
  updateChurchAddress,
  updateChurchContact,
  updateFeatures
} from '../../../services/churchService';
import { NextResponse } from 'next/server';
import { getUserSession } from '../../../../utils/generateToken';

export const config = {
  api: { bodyParser: false }
};

export const PUT = async (req) => {
  try {
    const url = new URL(req.url);
    const user = await getUserSession(req);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const action = url.searchParams.get('action');

    if (action === 'bulk') {
      const body = await req.json();
      const updated = await updateBulk(user?.church, body);
      return NextResponse.json({ success: true, data:updated });
    }

    if (action === 'one') {
      const formData = await req.formData();

      const name = formData.get('name');
      const email = formData.get('email');
      const mobile = formData.get('mobile');
      const description = formData.get('description');
      const denomination = formData.get('denomination');
      const file = formData.get('file');

      // Uploading (and, on edit, replacing/deleting the previous logo) is
      // handled by churchService.updateBulk via CloudinaryService - this
      // route only extracts the raw form fields.
      const body = {
        description,
        name,
        email,
        mobile,
        denomination,
        file: file || null
      };

      const updated = await updateBulk(user?.church, body);
      return NextResponse.json({ success: true, data: updated });
    }

    if (action === 'status') {
      const body = await req.json();
      const stripeCustomerId = url.searchParams.get('stripeCustomerId');
      const updated = await updateChurchStatus(stripeCustomerId, body);
      return NextResponse.json({ success: true, data: updated });
    }

    if (action === 'address') {
      const body = await req.json();
      const updated = await updateChurchAddress(user?.church, body);
      return NextResponse.json({ success: true, data: updated });
    }

    if (action === 'contact') {
      const body = await req.json();
      const updated = await updateChurchContact(user?.church, body);
      return NextResponse.json({ success: true, data: updated });
    }

    if (action === 'features') {
      const body = await req.json();
      // updateFeatures expects the plain features array, not the request
      // body wrapper ({ features: [...] }) the client actually sends.
      const updated = await updateFeatures(user?.church, body.features);
      return NextResponse.json({ success: true, data: updated });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    logger.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
};
