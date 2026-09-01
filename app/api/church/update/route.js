import { logger } from '../../../../utils/logger';
import {
  updateBulk,
  updateChurchStatus,
  updateChurchAddress,
  updateChurchContact,
  updateFeatures,
  updateOnboarding
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

    if (action === 'onboarding') {
      const body = await req.json();
      const updated = await updateOnboarding(user?.church, body);
      return NextResponse.json({ success: true, data: updated });
    }

    if (action === 'one') {
      const formData = await req.formData();

      const name = formData.get('name');
      const email = formData.get('email');
      const mobile = formData.get('mobile');
      const description = formData.get('description');
      const denomination = formData.get('denomination');
      const short_message = formData.get('short_message');
      const verse = formData.get('verse');
      // `file`/`removeBanner` -> the church BANNER (secure_url/public_id).
      // `logoFile`/`removeLogo` -> the church LOGO (logo_url/logo_id), a
      // fully independent asset - see churchService.updateBulk.
      const file = formData.get('file');
      const removeBanner = formData.get('removeBanner');
      const logoFile = formData.get('logoFile');
      const removeLogo = formData.get('removeLogo');

      // Uploading (and, on edit, replacing/deleting the previous image) is
      // handled by churchService.updateBulk via CloudinaryService - this
      // route only extracts the raw form fields.
      const body = {
        description,
        name,
        email,
        mobile,
        denomination,
        short_message,
        verse,
        file: file || null,
        removeBanner: removeBanner === 'true',
        logoFile: logoFile || null,
        removeLogo: removeLogo === 'true'
      };

      const updated = await updateBulk(user?.church, body);
      return NextResponse.json({ success: true, data: updated });
    }

    if (action === 'status') {
      // Subscription state is normally written by verified Stripe webhooks.
      // Retain this legacy action for platform administration only; church
      // users must never be able to update another church by customer ID.
      if (user.church) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const body = await req.json();
      const stripeCustomerId = url.searchParams.get('stripeCustomerId');
      if (!stripeCustomerId) {
        return NextResponse.json({ error: 'stripeCustomerId is required' }, { status: 400 });
      }

      const allowedFields = [
        'status', 'plan', 'priceId', 'subscriptionId',
        'startDate', 'endDate', 'trial_start', 'trial_end'
      ];
      const statusUpdate = Object.fromEntries(
        Object.entries(body).filter(([key]) => allowedFields.includes(key))
      );

      if (!Object.keys(statusUpdate).length) {
        return NextResponse.json({ error: 'No valid subscription fields supplied' }, { status: 400 });
      }

      const updated = await updateChurchStatus(stripeCustomerId, statusUpdate);
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
