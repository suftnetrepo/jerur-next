import Stripe from 'stripe';

export const STRIPE_API_VERSION = '2023-10-16';

let stripeClient;

export function getStripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }

  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: STRIPE_API_VERSION
    });
  }

  return stripeClient;
}

export function getStripeWebhookSecret() {
  const isProduction = process.env.NODE_ENV === 'production';
  const secret = isProduction
    ? process.env.STRIPE_WEBHOOK_SECRET
    : process.env.STRIPE_WEBHOOK_SECRET_LOCAL || process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret) {
    throw new Error(`Stripe webhook secret is not configured for ${isProduction ? 'production' : 'development'}`);
  }

  return secret;
}
