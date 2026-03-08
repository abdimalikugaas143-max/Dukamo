import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, BarChart3, Users, FileSignature, CreditCard,
  FolderOpen, Wrench, X, FolderKanban, UserCog, Briefcase, Zap, Award,
  Globe, BarChart2, LogOut, Home,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  end?: boolean;
}

// Admin/Ops operations nav
const OPS_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/daily-reports', label: 'Daily Reports', icon: FileText },
  { to: '/monthly-reports', label: 'Monthly Reports', icon: BarChart3 },
  { to: '/contractors', label: 'Contractors', icon: Users },
  { to: '/agreements', label: 'Agreements', icon: FileSignature },
  { to: '/payments', label: 'Payments', icon: CreditCard },
  { to: '/contract-details', label: 'Contract Details', icon: FolderOpen },
  { to: '/users', label: 'User Management', icon: UserCog },
];

const ADMIN_DUKAMO_ITEMS: NavItem[] = [
  { to: '/dukamo', label: 'Dukamo Home', icon: Globe, end: true },
  { to: '/dukamo/jobs', label: 'Job Board', icon: Briefcase },
  { to: '/dukamo/gigs', label: 'Gig Market', icon: Zap },
  { to: '/dukamo/skills', label: 'Skills Center', icon: Award },
  { to: '/dukamo/diaspora', label: 'Diaspora Hub', icon: Globe },
  { to: '/dukamo/analytics', label: 'Analytics', icon: BarChart3 },
];

// Worker: apply for jobs, bid on gigs, build profile
const WORKER_ITEMS: NavItem[] = [
  { to: '/', label: 'My Dashboard', icon: Home, end: true },
  { to: '/dukamo/jobs', label: 'Browse Jobs', icon: Briefcase },
  { to: '/dukamo/gigs', label: 'Browse Gigs', icon: Zap },
  { to: '/dukamo/skills', label: 'Skills Center', icon: Award },
  { to: '/dukamo/diaspora', label: 'Diaspora Hub', icon: Globe },
];

// Employer: post jobs, find workers, see analytics
const EMPLOYER_ITEMS: NavItem[] = [
  { to: '/', label: 'My Dashboard', icon: Home, end: true },
  { to: '/dukamo/jobs/post', label: 'Post a Job', icon: Briefcase },
  { to: '/dukamo/jobs', label: 'My Job Listings', icon: LayoutDashboard },
  { to: '/dukamo/gigs/post', label: 'Post a Task', icon: Zap },
  { to: '/dukamo/gigs', label: 'Gig Market', icon: Zap },
  { to: '/dukamo/diaspora', label: 'Diaspora Hub', icon: Globe },
  { to: '/dukamo/analytics', label: 'Analytics', icon: BarChart2 },
];

interface SidebarProps { isOpen: boolean; onClose: () => void; }

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const role = user?.role;

  function handleSignOut() {
    logout();
    navigate('/');
  }

  // Pick nav items and branding based on role
  const isWorker = role === 'worker';
  const isEmployer = role === 'employer';
  const isAdmin = role === 'admin' || role === 'ops';
  const isDukamoUser = isWorker || isEmployer;

  const accentColor = isAdmin ? 'bg-blue-600 shadow-blue-600/30' : 'bg-emerald-600 shadow-emerald-600/30';
  const activeClass = isAdmin ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white';
  const appName = isAdmin ? 'Sahidmie Ops' : 'Dukamo';
  const appSub = isAdmin
    ? (role === 'admin' ? 'Admin Portal' : 'Manager Portal')
    : isWorker ? 'Worker Account' : 'Employer Account';

  function NavItems({ items, sectionLabel }: { items: NavItem[]; sectionLabel?: string }) {
    return (
      <>
        {sectionLabel && (
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2 mt-3">
            {sectionLabel}
          </p>
        )}
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to + label}
            to={to}
            end={end}
            onClick={() => { if (window.innerWidth < 1024) onClose(); }}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
              ${isActive ? `${activeClass} shadow-sm` : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`
            }
          >
            <Icon size={17} />
            <span className="flex-1">{label}</span>
          </NavLink>
        ))}
      </>
    );
  }

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={onClose} />}
      <aside className={`sidebar fixed top-0 left-0 h-full w-64 bg-slate-900 text-white z-30 flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto`}>

        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-700/60">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 ${accentColor} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
              {isAdmin ? <Wrench size={17} className="text-white" /> : <Briefcase size={17} className="text-white" />}
            </div>
            <div>
              <div className="text-sm font-bold text-white leading-tight">{appName}</div>
              <div className="text-xs text-slate-400">{appSub}</div>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white"><X size={18} /></button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {isAdmin && (
            <>
              <NavItems items={OPS_ITEMS} sectionLabel="Operations" />
              <NavItems items={ADMIN_DUKAMO_ITEMS} sectionLabel="Dukamo Marketplace" />
            </>
          )}
          {isWorker && <NavItems items={WORKER_ITEMS} />}
          {isEmployer && <NavItems items={EMPLOYER_ITEMS} />}
        </nav>

        {/* User info + Sign out */}
        <div className="px-4 py-4 border-t border-slate-700/60">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-8 h-8 rounded-full ${isDukamoUser ? 'bg-emerald-600' : 'bg-blue-600'} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
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
