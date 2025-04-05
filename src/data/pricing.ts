// -------- icons -------- //
import Home from '@/icons/lineal/Home';
import BriefcaseTwo from '@/icons/lineal/BriefcaseTwo';
import ShoppingBasket from '@/icons/lineal/ShoppingBasket';

export const pricingList = [
  {
    monthlyPrice: 9,
    yearlyPrice: 992,
    Icon: ShoppingBasket,
    price: '£50',
    raw_price: 50,
    duration: '30 days',
    billingCycle: 'Monthly',
    index: 1,
    currency: '£',
    live_priceId: 'price_1HiLxAJ9QQF7JMlNBZvGeR43',
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
    monthlyPrice: 19,
    yearlyPrice: 199,
    price: '£250',
    raw_price: 250,
    duration: '6 months',
    billingCycle: 'Every 6 months',
    planName: 'Premium',
    currency: '£',
    index: 2,
    live_priceId: 'price_1HiLxAJ9QQF7JMlNAiqlLjPv',
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
    monthlyPrice: 49,
    yearlyPrice: 499,
    Icon: BriefcaseTwo,
    price: '£500',
    raw_price: 500,
    duration: '1 Year',
    billingCycle: 'Yearly',
    planName: 'Premium Plus',
    currency: '£',
    index: 3,
    live_priceId: 'price_1JJEZ2LJUyk9CjU7WqYguOQ6',
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

