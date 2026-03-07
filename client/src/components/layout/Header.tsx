import { Menu, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface HeaderProps { title: string; onMenuClick: () => void; }

export function Header({ title, onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const initials = user?.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'OP';
  const roleLabel = user?.role === 'admin' ? 'Admin' : 'Operations Manager';

  return (
    <header className="bg-white border-b border-slate-200 px-4 lg:px-6 h-14 flex items-center gap-4 flex-shrink-0">
      <button onClick={onMenuClick} className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100">
        <Menu size={20} />
      </button>
      <h1 className="text-base font-semibold text-slate-800 flex-1">{title}</h1>
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-xs font-semibold text-slate-700 leading-tight">{user?.name}</p>
          <p className="text-xs text-slate-400">{roleLabel}</p>
        </div>
        <div className="relative group">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold cursor-pointer select-none">
            {initials}
          </div>
          <div className="absolute right-0 top-full mt-2 w-44 bg-white border border-slate-200 rounded-xl shadow-lg py-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50">
            <div className="px-4 py-2.5 border-b border-slate-100">
              <p className="text-xs font-semibold text-slate-700 truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
            <button onClick={logout} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
              <LogOut size={13} /> Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
