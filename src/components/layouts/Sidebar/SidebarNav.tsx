import {
  faHome,
  faProjectDiagram,
  faCogs,
  faUser,
  faBuildingUser,
  faCalendar,
  faDonate,
  faLocation,
  faUsers,
  faFileImage
} from '@fortawesome/free-solid-svg-icons';
import {} from 'react-icons/ti';
import React from 'react';
import SidebarNavItem from './SidebarNavItem';

export default function SidebarNav() {
  return (
    <ul className="list-unstyled mt-4">
      <SidebarNavItem icon={faHome} href="/protected/admin/dashboard">
        Dashboard
      </SidebarNavItem>
      <SidebarNavItem icon={faUser} href="/protected/admin/users">
        Users
      </SidebarNavItem>
      <SidebarNavItem icon={faBuildingUser} href="/protected/admin/churches">
        Churches
      </SidebarNavItem>
      <SidebarNavItem icon={faCogs} href="/protected/admin/settings">
        Settings
      </SidebarNavItem>
    </ul>
  );
}

const ChurchSidebarNav = () => {
  return (
    <ul className="list-unstyled mt-0">
      <SidebarNavItem icon={faHome} href="/protected/church/dashboard">
        Dashboard
      </SidebarNavItem>
      <SidebarNavItem icon={faUsers} href="/protected/church/members">
        Members
      </SidebarNavItem>
      <SidebarNavItem icon={faProjectDiagram} href="/protected/church/regular-services">
       Services
      </SidebarNavItem>
      <SidebarNavItem icon={faCalendar} href="/protected/church/events">
        Events
      </SidebarNavItem>
      <SidebarNavItem icon={faLocation} href="/protected/church/fellowships">
        Fellowships
      </SidebarNavItem>
      <SidebarNavItem icon={faDonate} href="/protected/church/donations">
        Donations
      </SidebarNavItem>
      <SidebarNavItem icon={faFileImage} href="/protected/church/testimonies">
      Testimonies
      </SidebarNavItem>
      <SidebarNavItem icon={faUser} href="/protected/church/users">
        Users
      </SidebarNavItem>
      <SidebarNavItem icon={faCogs} href="/protected/church/settings">
        Settings
      </SidebarNavItem>
    </ul>
  );
};

export { ChurchSidebarNav };
