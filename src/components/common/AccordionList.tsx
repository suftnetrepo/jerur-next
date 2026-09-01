import { FC } from 'react';
import Accordion from '../reuseable/accordion';
// -------- data -------- //
const accordions = [
  {
    no: '1',
    expand: true,
    heading: 'One Connected Platform',
    body: 'Manage church information, members, services, events, giving and ministry content from one dashboard.'
  },
  {
    no: '2',
    expand: false,
    heading: 'A Configurable Mobile Experience',
    body: 'Choose the mobile features that fit your ministry and publish current church information directly to members.'
  },
  {
    no: '3',
    expand: false,
    heading: 'Intuitive and Accessible',
    body: 'Guided onboarding helps church administrators add the essentials and start publishing without a complicated setup process.'
  },
  {
    no: '4',
    expand: false,
    heading: 'Secure Subscription Management',
    body: 'Payments and subscription management are handled securely through Stripe, with clear access to your current billing status.'
  }
];

const AccordionList: FC = () => {
  return (
    <div className="accordion accordion-wrapper" id="accordionExample">
      {accordions.map((item) => (
        <Accordion type="plain" key={item.no} {...item} />
      ))}
    </div>
  );
};

export default AccordionList;
