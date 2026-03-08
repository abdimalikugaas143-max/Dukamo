import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuth } from '@/context/AuthContext';

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
  '/dukamo': 'Dukamo Marketplace',
  '/dukamo/jobs': 'Job Board',
  '/dukamo/jobs/post': 'Post a Job',
  '/dukamo/gigs': 'Gig Market',
  '/dukamo/gigs/post': 'Post a Task',
  '/dukamo/skills': 'Skills Center',
  '/dukamo/diaspora': 'Diaspora Hub',
  '/dukamo/dashboard/worker': 'My Dashboard',
  '/dukamo/dashboard/employer': 'My Dashboard',
  '/dukamo/analytics': 'Analytics',
};

const WORKER_HOME_TITLE = 'My Dashboard';
const EMPLOYER_HOME_TITLE = 'My Dashboard';

function getTitle(pathname: string): string {
  // Try exact match first
  if (ROUTE_TITLES[pathname]) return ROUTE_TITLES[pathname];
  // Try multi-segment dukamo routes
  const dukamoMatch = Object.keys(ROUTE_TITLES).find(k => pathname.startsWith(k) && k !== '/');
  if (dukamoMatch) return ROUTE_TITLES[dukamoMatch];
  const base = '/' + pathname.split('/')[1];
  return ROUTE_TITLES[base] || 'Operations';
}

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const role = user?.role;

  // Workers and employers landing at '/' should show "My Dashboard"
  function resolveTitle(pathname: string) {
    if (pathname === '/' && role === 'worker') return WORKER_HOME_TITLE;
    if (pathname === '/' && role === 'employer') return EMPLOYER_HOME_TITLE;
    return getTitle(pathname);
  }

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          title={resolveTitle(location.pathname)}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
