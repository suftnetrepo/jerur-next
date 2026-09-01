// -------- icons -------- //
import Home from '../icons/lineal/Home';
import BriefcaseTwo from '../icons/lineal/BriefcaseTwo';
import ShoppingBasket from '../icons/lineal/ShoppingBasket';
import { SUBSCRIPTION_PLANS, findSubscriptionPlanByPriceId } from '../../constants/subscriptionPlans';

const planDetails = SUBSCRIPTION_PLANS;

export const pricingList = [
  {
    monthlyPrice: 25,
    yearlyPrice: 280,
    Icon: ShoppingBasket,
    price: '£25',
    raw_price: 25,
    duration: 'month',
    billingCycle: 'Monthly',
    displayName: 'Monthly',
    description: 'Flexible month-to-month access to the complete Jerur platform.',
    badge: '',
    index: 1,
    currency: '£',
    live_priceId: planDetails[0].livePriceId,
    priceId: planDetails[0].testPriceId,
    planName: 'Basic Plan',
    features: [
      'Church profile and service times',
      'Members and attendance',
      'Events, sermons and articles',
      'Giving and fundraising campaigns',
      'Announcements and prayer requests',
      'Configurable member mobile features'
    ]
  },
  {
    Icon: Home,
    monthlyPrice: 25,
    yearlyPrice: 280,
    price: '£140',
    raw_price: 140,
    duration: '6 months',
    billingCycle: 'Every 6 months',
    displayName: 'Six Months',
    description: 'The complete Jerur platform with a saving for six-month billing.',
    badge: 'Save £10',
    planName: 'Premium',
    currency: '£',
    index: 2,
    live_priceId: planDetails[1].livePriceId,
    priceId: planDetails[1].testPriceId,
    features: [
      'Everything in the monthly option',
      'Church profile and service times',
      'Members and attendance',
      'Events, sermons and articles',
      'Giving and fundraising campaigns',
      'Configurable member mobile features'
    ]
  },
  {
    monthlyPrice: 25,
    yearlyPrice: 280,
    Icon: BriefcaseTwo,
    price: '£280',
    raw_price: 280,
    duration: 'year',
    billingCycle: 'Yearly',
    displayName: 'Annual',
    description: 'The best-value way to use the complete Jerur platform all year.',
    badge: 'Best value · Save £20',
    planName: 'Premium Plus',
    currency: '£',
    index: 3,
    live_priceId: planDetails[2].livePriceId,
    priceId: planDetails[2].testPriceId,
    features: [
      'Everything in the monthly option',
      'Church profile and service times',
      'Members and attendance',
      'Events, sermons and articles',
      'Giving and fundraising campaigns',
      'Configurable member mobile features'
    ]
  }
];

const findPrice = (priceId : string, _live? : boolean) => {
  const plan = findSubscriptionPlanByPriceId(priceId);
  if (!plan) return {};

  const index = SUBSCRIPTION_PLANS.findIndex((item) => item.id === plan.id);
  return pricingList[index] || {};
};

export { findPrice };
