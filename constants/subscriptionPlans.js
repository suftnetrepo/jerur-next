/**
 * Canonical Stripe plan catalogue.
 *
 * Keep billing identifiers here so checkout validation, webhook processing and
 * the pricing UI all resolve the same plans. Legacy live price IDs remain as
 * aliases so existing subscriptions continue to resolve after price changes.
 */
export const SUBSCRIPTION_PLANS = [
  {
    id: 'basic',
    planName: 'Basic Plan',
    price: '£25',
    raw_price: 25,
    duration: '30 days',
    billingCycle: 'Monthly',
    currency: '£',
    testPriceId: 'price_1HDVRhJ9QQF7JMlNSdnkB7l4',
    livePriceId: 'price_1TvzmRJ9QQF7JMlNn5Ik7tAG',
    legacyLivePriceIds: ['price_1HiLxAJ9QQF7JMlNBZvGeR43']
  },
  {
    id: 'premium',
    planName: 'Premium',
    price: '£140',
    raw_price: 140,
    duration: '6 months',
    billingCycle: 'Every 6 months',
    currency: '£',
    testPriceId: 'price_1HDVRhJ9QQF7JMlNxp77CsjK',
    livePriceId: 'price_1Tvzo4J9QQF7JMlNnpzMdacv',
    legacyLivePriceIds: ['price_1HiLxAJ9QQF7JMlNAiqlLjPv']
  },
  {
    id: 'premium-plus',
    planName: 'Premium Plus',
    price: '£280',
    raw_price: 280,
    duration: '1 Year',
    billingCycle: 'Yearly',
    currency: '£',
    testPriceId: 'price_1HHWPsJ9QQF7JMlN2X4BTJC3',
    livePriceId: 'price_1TvzpLJ9QQF7JMlNBXe8Yscy',
    legacyLivePriceIds: ['price_1JJEZ2LJUyk9CjU7WqYguOQ6']
  }
];

const stripeKeyMode = (key) => {
  if (typeof key !== 'string') return null;
  if (/^(sk|pk|rk)_live_/.test(key)) return 'live';
  if (/^(sk|pk|rk)_test_/.test(key)) return 'test';
  return null;
};

/**
 * Live vs test billing follows the configured Stripe key, because live price
 * IDs only exist in live mode and vice versa. NODE_ENV cannot decide this:
 * `next build`/`next start` always set it to 'production', even on test
 * deployments. The secret key is only visible on the server; the publishable
 * key is inlined at build time so the client resolves the same mode.
 */
export function isProductionBillingEnvironment() {
  const mode = stripeKeyMode(process.env.STRIPE_SECRET_KEY)
    || stripeKeyMode(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  if (mode) return mode === 'live';

  return process.env.NEXT_PUBLIC_ENV === 'production' || process.env.NODE_ENV === 'production';
}

export function getPlanPriceId(plan, live = isProductionBillingEnvironment()) {
  return live ? plan.livePriceId : plan.testPriceId;
}

export function findSubscriptionPlanByPriceId(priceId) {
  if (!priceId || typeof priceId !== 'string') return null;

  return SUBSCRIPTION_PLANS.find((plan) => (
    plan.testPriceId === priceId
    || plan.livePriceId === priceId
    || plan.legacyLivePriceIds.includes(priceId)
  )) || null;
}

export function isCurrentPriceForEnvironment(priceId, live = isProductionBillingEnvironment()) {
  const plan = findSubscriptionPlanByPriceId(priceId);
  return Boolean(plan && getPlanPriceId(plan, live) === priceId);
}
