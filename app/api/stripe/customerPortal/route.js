import { logger } from '../../../../utils/logger';
import Church from '../../../models/church';
import { getUserSession } from '../../../../utils/generateToken';
import { getStripeClient } from '../../../../lib/stripe';
const { NextResponse } = require('next/server');

// POST handler to create a customer portal session
export async function POST(req) {
    try {
        const user = await getUserSession(req, { requireActiveSubscription: false });

        if (!user?.church) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const church = await Church.findById(user.church).select('stripeCustomerId').lean();
        if (!church?.stripeCustomerId) {
            return NextResponse.json({ error: 'No Stripe customer is linked to this church.' }, { status: 400 });
        }

        const stripe = getStripeClient();
        const returnUrl = process.env.NEXT_FRONTEND_URL
            || `${new URL(req.url).origin}/protected/church/settings`;

        // Create a Stripe Billing Portal session
        const session = await stripe.billingPortal.sessions.create({
            customer: church.stripeCustomerId,
            return_url: returnUrl,
        });

        // Return the session URL
        return NextResponse.json({ url: session.url }, { status: 200 });
    } catch (error) {
        // Log the error
        logger.error(error);

        // Return the error response
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
