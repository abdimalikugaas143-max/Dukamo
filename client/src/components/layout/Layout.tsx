import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuth } from '@/context/AuthContext';

const ROUTE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/jobs': 'Job Board',
  '/jobs/post': 'Post a Job',
  '/gigs': 'Gig Market',
  '/gigs/post': 'Post a Task',
  '/skills': 'Skills Center',
  '/diaspora': 'Diaspora Hub',
  '/global': 'Global Talent',
  '/messages': 'Messages',
  '/payments': 'Payments',
  '/analytics': 'Analytics',
  '/referrals': 'Refer & Earn',
  '/dashboard': 'My Dashboard',
  '/users': 'User Management',
  '/onboarding': 'Setup Your Profile',
};

function getTitle(pathname: string): string {
  if (ROUTE_TITLES[pathname]) return ROUTE_TITLES[pathname];
  const base = '/' + pathname.split('/')[1];
  return ROUTE_TITLES[base] || 'Dukamo';
}

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const role = user?.role;

  function resolveTitle(pathname: string) {
    if (pathname === '/' && role === 'worker') return 'My Dashboard';
    if (pathname === '/' && role === 'employer') return 'My Dashboard';
    if (pathname === '/' && role === 'admin') return 'Admin Dashboard';
    return getTitle(pathname);
  }

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header title={resolveTitle(location.pathname)} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 pb-20 lg:pb-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
