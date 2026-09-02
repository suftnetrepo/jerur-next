'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import SidebarProvider from '../../../src/components/layouts/SidebarProvider';
import SidebarOverlay from '../../../src/components/layouts/Sidebar/SidebarOverlay';
import Sidebar from '../../../src/components/layouts/Sidebar/Sidebar';
import { ChurchSidebarNav } from '../../../src/components/layouts/Sidebar/SidebarNav';
import Header from '../../../src/components/layouts/Header/Header';
import Footer from '../../../src/components/layouts/Footer/Footer';
import ChurchEntitlementGuard from '../../../src/components/billing/ChurchEntitlementGuard';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';

config.autoAddCss = false;

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === '/protected/church/billing-recovery') {
    return <ChurchEntitlementGuard>{children}</ChurchEntitlementGuard>;
  }

  return (
    <ChurchEntitlementGuard>
      <SidebarProvider>
        <SidebarOverlay />
        <Sidebar>
          <ChurchSidebarNav />
        </Sidebar>
        <div className="wrapper d-flex flex-column min-vh-100">
          <Header />
          <div className="body flex-grow-1 px-sm-2 mb-4">
            <div className="ms-0 me-0">{children}</div>
          </div>
          <Footer />
        </div>

        <SidebarOverlay />
      </SidebarProvider>
    </ChurchEntitlementGuard>
  );
}
