import { Menu, Bell } from 'lucide-react';

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

export function Header({ title, onMenuClick }: HeaderProps) {
  return (
    <header className="header bg-white border-b border-slate-200 px-4 lg:px-6 h-14 flex items-center gap-4 flex-shrink-0">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700"
      >
        <Menu size={20} />
      </button>

      <h1 className="text-lg font-semibold text-slate-800 flex-1">{title}</h1>

      <div className="flex items-center gap-2">
        <button className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700">
          <Bell size={18} />
        </button>
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
          OP
        </div>
      </div>
    </header>
  );
}
