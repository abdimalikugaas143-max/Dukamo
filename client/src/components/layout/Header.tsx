import { Menu } from 'lucide-react';
import { useRole } from '@/context/RoleContext';

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

export function Header({ title, onMenuClick }: HeaderProps) {
  const { role, supervisorName, clearRole } = useRole();

  const initials = role === 'supervisor'
    ? supervisorName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'OM';

  const avatarBg = role === 'supervisor' ? 'bg-emerald-600' : 'bg-blue-600';
  const roleLabel = role === 'supervisor' ? 'Supervisor' : 'Operations Manager';

  return (
    <header className="header bg-white border-b border-slate-200 px-4 lg:px-6 h-14 flex items-center gap-4 flex-shrink-0">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700"
      >
        <Menu size={20} />
      </button>

      <h1 className="text-lg font-semibold text-slate-800 flex-1">{title}</h1>

      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-xs font-medium text-slate-700 leading-tight">
            {role === 'supervisor' ? supervisorName : 'Operations Manager'}
          </p>
          <p className="text-xs text-slate-400">{roleLabel}</p>
        </div>
        <div className="relative group">
          <div className={`w-8 h-8 rounded-full ${avatarBg} flex items-center justify-center text-white text-xs font-bold cursor-pointer`}>
            {initials}
          </div>
          <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-slate-200 rounded-xl shadow-lg py-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50">
            <button
              onClick={clearRole}
              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              Switch Role
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
