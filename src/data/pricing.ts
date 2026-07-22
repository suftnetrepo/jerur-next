// -------- icons -------- //
import Home from '../icons/lineal/Home';
import BriefcaseTwo from '../icons/lineal/BriefcaseTwo';
import ShoppingBasket from '../icons/lineal/ShoppingBasket';

export const pricingList = [
  {
    monthlyPrice: 25,
    yearlyPrice: 280,
    Icon: ShoppingBasket,
    price: '£25',
    raw_price: 25,
    duration: '30 days',
    billingCycle: 'Monthly',
    index: 1,
    currency: '£',
    live_priceId: 'price_1TvzmRJ9QQF7JMlNn5Ik7tAG',
    priceId: 'price_1HDVRhJ9QQF7JMlNSdnkB7l4',
    planName: 'Basic Plan',
    features: [
     'Service Time Management',
      'Fundraising Campaigns',
      'Online Giving ',
      'Multi-Platform Access',
      'Event Management',
      'Dedicated Customer Support',
      'Data Security and Privacy',    
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
    planName: 'Premium',
    currency: '£',
    index: 2,
    live_priceId: 'price_1Tvzo4J9QQF7JMlNnpzMdacv',
    priceId: 'price_1HDVRhJ9QQF7JMlNxp77CsjK',
    features: [
      'Service Time Management',
      'Fundraising Campaigns',
      'Online Giving ',
      'Multi-Platform Access',
      'Event Management',
      'Dedicated Customer Support',
      'Data Security and Privacy',     
    ]
  },
  {
    monthlyPrice: 25,
    yearlyPrice: 280,
    Icon: BriefcaseTwo,
    price: '£280',
    raw_price: 280,
    duration: '1 Year',
    billingCycle: 'Yearly',
    planName: 'Premium Plus',
    currency: '£',
    index: 3,
    live_priceId: 'price_1TvzpLJ9QQF7JMlNBXe8Yscy',
    priceId: 'price_1HHWPsJ9QQF7JMlN2X4BTJC3',
    features: [
      'Service Time Management',
      'Fundraising Campaigns',
      'Online Giving ',
      'Multi-Platform Access',
      'Event Management',
      'Dedicated Customer Support',
      'Data Security and Privacy',
    ]
  }
];

const findPrice = (priceId : string, live : boolean) => {
  if (live) {
    return pricingList.find((x) => x.live_priceId === priceId) || {};
  }
  return pricingList.find((x) => x.priceId === priceId) || {};
};

export { findPrice };

