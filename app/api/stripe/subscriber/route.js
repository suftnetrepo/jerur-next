import { logger } from '../../../../utils/logger';
import { findSubscriptionPlanByPriceId, isCurrentPriceForEnvironment } from '../../../../constants/subscriptionPlans';
import { getStripeClient } from '../../../../lib/stripe';
import { createRegistrationProof, verifyRecaptchaToken } from '../../../../lib/recaptcha';
const { NextResponse } = require('next/server');

// POST handler for creating a subscription
export async function POST(req) {
    try {
        // Parse the request body
        const body = await req.json();
        const { priceId, contact, email, idempotencyKey, captchaToken } = body;
        const plan = findSubscriptionPlanByPriceId(priceId);

        if (!plan || !isCurrentPriceForEnvironment(priceId)) {
            return NextResponse.json(
                { error: 'The selected subscription plan is not available. Please return to pricing and try again.' },
                { status: 400 }
            );
        }

        if (!email || typeof email !== 'string') {
            return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 });
        }

        const forwardedFor = req.headers.get('x-forwarded-for');
        const remoteIp = forwardedFor?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || undefined;
        const captchaIsValid = await verifyRecaptchaToken(captchaToken, { remoteIp, action: 'checkout' });
        if (!captchaIsValid) {
            return NextResponse.json(
                { error: 'We could not verify your request. Please refresh the page and try again.' },
                { status: 400 }
            );
        }

        const stripe = getStripeClient();
        const requestKey = typeof idempotencyKey === 'string' && idempotencyKey.length >= 16
            ? idempotencyKey
            : null;

         // Create a new Stripe customer
        const customer = await stripe.customers.create(
            { email },
            requestKey ? { idempotencyKey: `${requestKey}:customer` } : undefined
        );

        // Create a subscription
        const subscription = await stripe.subscriptions.create({
            customer: customer.id,
            items: [{ price: priceId }],
            payment_behavior: 'default_incomplete',
            metadata: {
                stripeCustomerId: customer.id,
                contact: contact,
                email: email,
                planId: plan.id,
            },
            expand: ['latest_invoice.payment_intent'],
        }, requestKey ? { idempotencyKey: `${requestKey}:subscription` } : undefined);

        // Return subscription details
        return NextResponse.json(
            {
                data: {
                    subscriptionId: subscription.id,
                    customerId: customer.id,
                    clientSecret: subscription?.latest_invoice?.payment_intent?.client_secret,
                    registrationProof: createRegistrationProof({
                        email,
                        stripeCustomerId: customer.id,
                        subscriptionId: subscription.id
                    }),
                },
            },
            { status: 200 }
        );
    } catch (error) {
        // Log the error
        logger.error(error);

        // Return the error response
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
