import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, BarChart3, Users, FileSignature, CreditCard, FolderOpen, Wrench, X, FolderKanban, UserCog } from 'lucide-react';
import { apiGet } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

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

interface SidebarProps { isOpen: boolean; onClose: () => void; }

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user } = useAuth();
  const [pendingReviews, setPendingReviews] = useState(0);

  useEffect(() => {
    apiGet<any>('/api/dashboard')
      .then(data => setPendingReviews(data?.stats?.pendingReviews || 0))
      .catch(() => {});
  }, []);

  const navItems = NAV_ITEMS.filter(item => !item.adminOnly || user?.role === 'admin');

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={onClose} />}
      <aside className={`sidebar fixed top-0 left-0 h-full w-64 bg-slate-900 text-white z-30 flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto`}>
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-700/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-600/30">
              <Wrench size={17} className="text-white" />
            </div>
            <div>
              <div className="text-sm font-bold text-white leading-tight">Sahidmie Ops</div>
              <div className="text-xs text-slate-400">{user?.role === 'admin' ? 'Admin Portal' : 'Manager Portal'}</div>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white"><X size={18} /></button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
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
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-700/60">
          <p className="text-xs text-slate-500">v2.0 &mdash; Sahidmie Ops System</p>
        </div>
      </aside>
    </>
  );
}
