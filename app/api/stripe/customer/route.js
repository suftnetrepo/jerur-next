import { logger } from '../../../../utils/logger';
import { getStripeClient } from '../../../../lib/stripe';
import { getUserSession } from '../../../../utils/generateToken';
const { NextResponse } = require('next/server');

// POST handler
export async function POST(req) {
    try {
        const user = await getUserSession(req, { requireActiveSubscription: false });
        if (!user?.church) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const stripe = getStripeClient();

        // Parse the request body
        const body = await req.json();
        const { email } = body;

        // Create a new Stripe customer
        const customer = await stripe.customers.create({
            email,
        });

        // Return the created customer
        return NextResponse.json({ data: customer }, { status: 200 });
    } catch (error) {
        // Log the error
        logger.error(error);

        // Return the error response
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
