import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Briefcase, Zap, Award, Globe, BarChart3, LogOut,
  Home, UserCog, MessageSquare, Gift, CreditCard, TrendingUp, Users, X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  end?: boolean;
}

const ADMIN_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/jobs', label: 'Job Board', icon: Briefcase },
  { to: '/gigs', label: 'Gig Market', icon: Zap },
  { to: '/skills', label: 'Skills Center', icon: Award },
  { to: '/global', label: 'Global Talent', icon: Globe },
  { to: '/diaspora', label: 'Diaspora Hub', icon: TrendingUp },
  { to: '/messages', label: 'Messages', icon: MessageSquare },
  { to: '/payments', label: 'Payments', icon: CreditCard },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/users', label: 'User Management', icon: UserCog },
];

const WORKER_ITEMS: NavItem[] = [
  { to: '/', label: 'My Dashboard', icon: Home, end: true },
  { to: '/jobs', label: 'Browse Jobs', icon: Briefcase },
  { to: '/gigs', label: 'Browse Gigs', icon: Zap },
  { to: '/global', label: 'Global Jobs', icon: Globe },
  { to: '/skills', label: 'Skills Center', icon: Award },
  { to: '/diaspora', label: 'Diaspora Hub', icon: TrendingUp },
  { to: '/messages', label: 'Messages', icon: MessageSquare },
  { to: '/payments', label: 'Payments', icon: CreditCard },
  { to: '/referrals', label: 'Refer & Earn', icon: Gift },
];

const EMPLOYER_ITEMS: NavItem[] = [
  { to: '/', label: 'My Dashboard', icon: Home, end: true },
  { to: '/jobs/post', label: 'Post a Job', icon: Briefcase },
  { to: '/jobs', label: 'Job Listings', icon: LayoutDashboard },
  { to: '/gigs/post', label: 'Post a Task', icon: Zap },
  { to: '/gigs', label: 'Gig Market', icon: Zap },
  { to: '/global', label: 'Global Talent', icon: Globe },
  { to: '/diaspora', label: 'Diaspora Hub', icon: TrendingUp },
  { to: '/messages', label: 'Messages', icon: MessageSquare },
  { to: '/payments', label: 'Payments', icon: CreditCard },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/referrals', label: 'Refer & Earn', icon: Gift },
];

interface SidebarProps { isOpen: boolean; onClose: () => void; }

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleSignOut() {
    logout();
    navigate('/');
  }

  const role = user?.role;
  const isAdmin = role === 'admin';
  const isWorker = role === 'worker';

  const navItems = isAdmin ? ADMIN_ITEMS : isWorker ? WORKER_ITEMS : EMPLOYER_ITEMS;
  const activeClass = 'bg-emerald-600 text-white shadow-sm';
  const appSub = isAdmin ? 'Admin Portal' : isWorker ? 'Worker Account' : 'Employer Account';

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={onClose} />}
      <aside className={`sidebar fixed top-0 left-0 h-full w-64 bg-slate-900 text-white z-30 flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto`}>

        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-700/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-600/30">
              <Users size={17} className="text-white" />
            </div>
            <div>
              <div className="text-sm font-bold text-white leading-tight">Dukamo</div>
              <div className="text-xs text-slate-400">{appSub}</div>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white"><X size={18} /></button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to + label}
              to={to}
              end={end}
              onClick={() => { if (window.innerWidth < 1024) onClose(); }}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                ${isActive ? activeClass : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`
              }
            >
              <Icon size={17} />
              <span className="flex-1">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User info + Sign out */}
        <div className="px-4 py-4 border-t border-slate-700/60">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user?.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
          >
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
