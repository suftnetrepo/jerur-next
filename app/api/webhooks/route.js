// import { logger } from '../../../utils/logger';
import { NextResponse } from 'next/server';
import { getStripeClient, getStripeWebhookSecret } from '../../../lib/stripe';

import {
  invoicePaymentSuccess,
  setDefaultPaymentMethod,
  invoicePaymentFailed,
  trialWillEnd,
  updateSubscription,
  createSubscription,
  cancelSubscription,
} from '../../services/webHooksService';

export async function POST(req) {
  let event = null;
  let rawBody;

  try {
    // Log request headers for debugging
    console.log('Webhook Headers:', {
      'content-type': req.headers.get('content-type'),
      'stripe-signature': req.headers.get('stripe-signature') ? 'present' : 'missing'
    });

    try {
      rawBody = Buffer.from(await req.arrayBuffer());
      console.log('Raw body length:', rawBody.length);
    } catch (bodyError) {
      console.error('Body parsing error:', bodyError);
      return NextResponse.json(
        { error: 'Could not parse request body' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    try {
      event = getStripeClient().webhooks.constructEvent(
        rawBody,
        req.headers.get('stripe-signature'),
        getStripeWebhookSecret()
      );
      console.log('Webhook event constructed successfully:', { type: event.type });
    } catch (signatureError) {
      console.error('Signature verification failed:', signatureError.message);
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    // Handle the verified event
    const handlers = {
      'customer.subscription.created': createSubscription,
      'customer.subscription.updated': updateSubscription,
      'customer.subscription.deleted': cancelSubscription,
      'invoice.payment_succeeded': async (event) => {
        await setDefaultPaymentMethod(event);
        await invoicePaymentSuccess(event);
      },
      'invoice.payment_failed': invoicePaymentFailed,
      'customer.subscription.trial_will_end': trialWillEnd,
    };

    if (handlers[event.type]) {
      await handlers[event.type](event);
      console.log(`Successfully processed ${event.type} event`);
    } else {
      console.warn(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error) {
    console.error('Webhook processing error:', {
      message: error.message,
      stack: error.stack,
      eventType: event?.type,
      rawBodyLength: rawBody?.length
    });

    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
