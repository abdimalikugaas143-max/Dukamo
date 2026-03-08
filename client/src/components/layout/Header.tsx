import { useState } from 'react';
import { Menu, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface HeaderProps { title: string; onMenuClick: () => void; }

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  ops: 'Operations Manager',
  supervisor: 'Supervisor',
  worker: 'Worker',
  employer: 'Employer',
};

export function Header({ title, onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const initials = user?.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';
  const roleLabel = ROLE_LABELS[user?.role ?? ''] ?? user?.role ?? '';
  const isDukamoUser = user?.role === 'worker' || user?.role === 'employer';
  const avatarColor = isDukamoUser ? 'bg-emerald-600' : 'bg-blue-600';

  function handleSignOut() {
    setMenuOpen(false);
    logout();
    navigate('/');
  }

  return (
    <header className="bg-white border-b border-slate-200 px-4 lg:px-6 h-14 flex items-center gap-4 flex-shrink-0 relative">
      <button onClick={onMenuClick} className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100">
        <Menu size={20} />
      </button>
      <h1 className="text-base font-semibold text-slate-800 flex-1 truncate">{title}</h1>

      <div className="flex items-center gap-2">
        {/* Desktop: name + role */}
        <div className="text-right hidden sm:block">
          <p className="text-xs font-semibold text-slate-700 leading-tight">{user?.name}</p>
          <p className="text-xs text-slate-400 capitalize">{roleLabel}</p>
        </div>

        {/* Avatar + dropdown — click/tap to open */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="flex items-center gap-1 focus:outline-none"
          >
            <div className={`w-8 h-8 rounded-full ${avatarColor} flex items-center justify-center text-white text-xs font-bold select-none`}>
              {initials}
            </div>
            <ChevronDown size={13} className="text-slate-400 hidden sm:block" />
          </button>

          {menuOpen && (
            <>
              {/* Backdrop to close on outside tap */}
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50">
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <p className="text-xs font-semibold text-slate-700 truncate">{user?.name}</p>
                  <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                  <span className="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 capitalize">{roleLabel}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={13} /> Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
