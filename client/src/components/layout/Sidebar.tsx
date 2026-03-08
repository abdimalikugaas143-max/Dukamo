import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, BarChart3, Users, FileSignature, CreditCard, FolderOpen, Wrench, X, FolderKanban, UserCog, Briefcase, Zap, Award, Globe, BarChart2 } from 'lucide-react';
import { apiGet } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const IS_DUKAMO = import.meta.env.VITE_APP_MODE === 'dukamo';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/daily-reports', label: 'Daily Reports', icon: FileText, badge: 'pendingReviews' },
  { to: '/monthly-reports', label: 'Monthly Reports', icon: BarChart3 },
  { to: '/contractors', label: 'Contractors', icon: Users },
  { to: '/agreements', label: 'Agreements', icon: FileSignature },
  { to: '/payments', label: 'Payments', icon: CreditCard },
  { to: '/contract-details', label: 'Contract Details', icon: FolderOpen },
  { to: '/users', label: 'User Management', icon: UserCog, adminOnly: true },
];

const DUKAMO_ITEMS = [
  { to: IS_DUKAMO ? '/' : '/dukamo', label: 'Dukamo Home', icon: Globe, end: true },
  { to: IS_DUKAMO ? '/dukamo/jobs' : '/dukamo/jobs', label: 'Job Board', icon: Briefcase },
  { to: '/dukamo/gigs', label: 'Gig Market', icon: Zap },
  { to: '/dukamo/skills', label: 'Skills Center', icon: Award },
  { to: '/dukamo/diaspora', label: 'Diaspora Hub', icon: Globe },
  { to: '/dukamo/dashboard/worker', label: 'Worker Dashboard', icon: Users },
  { to: '/dukamo/dashboard/employer', label: 'Employer Dashboard', icon: BarChart2 },
  { to: '/dukamo/analytics', label: 'Analytics', icon: BarChart3 },
];

interface SidebarProps { isOpen: boolean; onClose: () => void; }

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user } = useAuth();
  const [pendingReviews, setPendingReviews] = useState(0);

  useEffect(() => {
    if (!IS_DUKAMO) {
      apiGet<any>('/api/dashboard')
        .then(data => setPendingReviews(data?.stats?.pendingReviews || 0))
        .catch(() => {});
    }
  }, []);

  const navItems = NAV_ITEMS.filter(item => !item.adminOnly || user?.role === 'admin');

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={onClose} />}
      <aside className={`sidebar fixed top-0 left-0 h-full w-64 bg-slate-900 text-white z-30 flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto`}>
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-700/60">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 ${IS_DUKAMO ? 'bg-emerald-600 shadow-emerald-600/30' : 'bg-blue-600 shadow-blue-600/30'} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
              {IS_DUKAMO ? <Briefcase size={17} className="text-white" /> : <Wrench size={17} className="text-white" />}
            </div>
            <div>
              <div className="text-sm font-bold text-white leading-tight">{IS_DUKAMO ? 'Dukamo' : 'Sahidmie Ops'}</div>
              <div className="text-xs text-slate-400">{IS_DUKAMO ? 'Job & Gig Marketplace' : user?.role === 'admin' ? 'Admin Portal' : 'Manager Portal'}</div>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white"><X size={18} /></button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {!IS_DUKAMO && (
            <>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">Operations</p>
              {navItems.map(({ to, label, icon: Icon, end, badge }) => {
                const badgeCount = badge === 'pendingReviews' ? pendingReviews : 0;
                return (
                  <NavLink
                    key={to} to={to} end={end}
                    onClick={() => { if (window.innerWidth < 1024) onClose(); }}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                      ${isActive ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`
                    }
                  >
                    <Icon size={17} />
                    <span className="flex-1">{label}</span>
                    {badgeCount > 0 && (
                      <span className="bg-amber-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                        {badgeCount}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </>
          )}

          {/* Dukamo Marketplace section */}
          <div className={IS_DUKAMO ? '' : 'pt-4'}>
            {!IS_DUKAMO && (
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span> Dukamo Marketplace
              </p>
            )}
            {DUKAMO_ITEMS.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to} to={to} end={end}
                onClick={() => { if (window.innerWidth < 1024) onClose(); }}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                  ${isActive ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`
                }
              >
                <Icon size={17} />
                <span className="flex-1">{label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-700/60">
          <p className="text-xs text-slate-500">{IS_DUKAMO ? 'v1.0 \u2014 Dukamo Marketplace' : 'v2.0 \u2014 Sahidmie Ops System'}</p>
        </div>
      </aside>
    </>
  );
}
