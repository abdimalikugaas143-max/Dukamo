import { Outlet } from 'react-router-dom';
import { useRole } from '@/context/RoleContext';
import { HardHat, LogOut } from 'lucide-react';

export function SupervisorLayout() {
  const { supervisorName, clearRole } = useRole();

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Top bar */}
      <header className="bg-slate-900 text-white h-14 px-4 lg:px-6 flex items-center gap-4">
        <div className="flex items-center gap-2.5 flex-1">
          <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <HardHat size={15} className="text-white" />
          </div>
          <div>
            <span className="text-sm font-bold text-white">Sahidmie Ops</span>
            <span className="text-slate-500 text-xs ml-2">Supervisor Portal</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">
            {supervisorName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          </div>
          <button
            onClick={clearRole}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs transition-colors"
          >
            <LogOut size={13} /> Sign out
          </button>
        </div>
      </header>

      <main className="p-4 lg:p-6 max-w-5xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
