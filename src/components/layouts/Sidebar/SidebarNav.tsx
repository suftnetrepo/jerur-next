import {
  faHome,
  faProjectDiagram,
  faCogs,
  faUser,
  faBuildingUser,
  faCalendar,
  faDonate,
  faLocation,
  faUsers
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
    <ul className="list-unstyled mt-4">
      <SidebarNavItem icon={faHome} href="/protected/church/dashboard">
        Dashboard
      </SidebarNavItem>
      <SidebarNavItem icon={faUsers} href="/protected/church/member">
        Member
      </SidebarNavItem>
      <SidebarNavItem icon={faProjectDiagram} href="/protected/church/regular-service">
       Service
      </SidebarNavItem>
      <SidebarNavItem icon={faCalendar} href="/protected/church/event">
        Event 
      </SidebarNavItem>
      <SidebarNavItem icon={faLocation} href="/protected/church/fellowship">
        Fellowship
      </SidebarNavItem>
      <SidebarNavItem icon={faDonate} href="/protected/church/donation">
        Donation
      </SidebarNavItem>
      <SidebarNavItem icon={faDonate} href="/protected/church/testimony">
        Testimony
      </SidebarNavItem>
      <SidebarNavItem icon={faUser} href="/protected/church/user">
        User
      </SidebarNavItem>
      <SidebarNavItem icon={faCogs} href="/protected/church/settings">
        Setting
      </SidebarNavItem>
    </ul>
  );
};

export { ChurchSidebarNav };
