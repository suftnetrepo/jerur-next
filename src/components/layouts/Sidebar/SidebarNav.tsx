import {
  faGauge,
  faProjectDiagram,
  faCogs,
  faUser,
  faBuildingUser,
  faComment,
  faMoneyCheck
} from '@fortawesome/free-solid-svg-icons';
import {} from 'react-icons/ti';
import React from 'react';
import SidebarNavItem from './SidebarNavItem';

export default function SidebarNav() {
  return (
    <ul className="list-unstyled mt-4">
      <SidebarNavItem icon={faGauge} href="/protected/admin/dashboard">
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
    <ul className="list-unstyled mt-4">
      <SidebarNavItem icon={faGauge} href="/protected/church/dashboard">
        Dashboard
      </SidebarNavItem>
      <SidebarNavItem icon={faMoneyCheck} href="/protected/church/member">
        Member
      </SidebarNavItem>
      <SidebarNavItem icon={faProjectDiagram} href="/protected/church/regular-services">
        Regular Service
      </SidebarNavItem>
      <SidebarNavItem icon={faMoneyCheck} href="/protected/church/events">
        Event calendar
      </SidebarNavItem>
      <SidebarNavItem icon={faMoneyCheck} href="/protected/church/fellowship">
        Fellowship
      </SidebarNavItem>
      <SidebarNavItem icon={faBuildingUser} href="/protected/church/user">
        User
      </SidebarNavItem>
      <SidebarNavItem icon={faCogs} href="/protected/church/settings">
        Setting
      </SidebarNavItem>
    </ul>
  );
};

export { ChurchSidebarNav };
