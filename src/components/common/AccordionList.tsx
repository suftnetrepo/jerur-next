import { FC } from 'react';
import Accordion from '@/components/reuseable/accordion';
// -------- data -------- //
const accordions = [
  {
    no: '1',
    expand: true,
    heading: 'All-in-One Platform',
    body: 'Manage everything from service planning to media content, member engagement, and online giving—seamlessly in one place.'
  },
  {
    no: '2',
    expand: false,
    heading: 'Member-Centric Tools',
    body: 'Designed to support pastors, AV teams, admin staff, and volunteers—collaborate and communicate with ease.'
  },
  {
    no: '3',
    expand: false,
    heading: 'Intuitive and Accessible',
    body: 'No steep learning curve. Jerur is easy to navigate for everyone, from tech teams to first-time users.'
  },
  {
    no: '4',
    expand: false,
    heading: 'Responsive Support',
    body: 'We walk with you every step of the way—from onboarding to ongoing support—so your church never feels alone.'
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
