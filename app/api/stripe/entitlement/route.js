import { NextResponse } from 'next/server';
import Church from '../../../models/church';
import { subscriptionStatusAllowsAdminAccess } from '../../../services/entitlementService';
import { getUserSession } from '../../../../utils/generateToken';
import { logger } from '../../../../utils/logger';
import { mongoConnect } from '../../../../utils/connectDb';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    await mongoConnect();
    const user = await getUserSession(req, { requireActiveSubscription: false });

    if (!user?.church) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const church = await Church.findById(user.church)
      .select('name plan status startDate endDate trial_start trial_end stripeCustomerId')
      .lean();

    if (!church) {
      return NextResponse.json({ error: 'Church account not found' }, { status: 404 });
    }

    const status = String(church.status || '').trim().toLowerCase();

    return NextResponse.json({
      data: {
        churchName: church.name || '',
        plan: church.plan || '',
        status,
        hasAccess: subscriptionStatusAllowsAdminAccess(status),
        hasStripeCustomer: Boolean(church.stripeCustomerId),
        startDate: church.startDate || null,
        endDate: church.endDate || null,
        trialStart: church.trial_start || null,
        trialEnd: church.trial_end || null
      }
    }, {
      status: 200,
      headers: { 'Cache-Control': 'no-store' }
    });
  } catch (error) {
    logger.error(error, 'Failed to check church subscription entitlement');
    return NextResponse.json(
      { error: 'Unable to verify your subscription right now. Please try again.' },
      { status: 500 }
    );
  }
}
