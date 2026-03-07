import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

const ROUTE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/projects': 'Projects',
  '/daily-reports': 'Daily Reports',
  '/monthly-reports': 'Monthly Reports',
  '/contractors': 'Contractors',
  '/agreements': 'Contractor Agreements',
  '/payments': 'Contractor Payments',
  '/contract-details': 'Contract Details',
  '/users': 'User Management',
};

function getTitle(pathname: string): string {
  const base = '/' + pathname.split('/')[1];
  return ROUTE_TITLES[base] || 'Operations';
}

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          title={getTitle(location.pathname)}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
