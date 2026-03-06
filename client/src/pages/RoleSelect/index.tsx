import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, HardHat, Wrench, ArrowRight } from 'lucide-react';
import { useRole } from '@/context/RoleContext';

export function RoleSelect() {
  const { setRole } = useRole();
  const navigate = useNavigate();
  const [supervisorName, setSupervisorName] = useState('');
  const [nameError, setNameError] = useState('');
  const [hovering, setHovering] = useState<'manager' | 'supervisor' | null>(null);

  function handleManager() {
    setRole('manager');
    navigate('/');
  }

  function handleSupervisor() {
    if (!supervisorName.trim()) {
      setNameError('Please enter your name to continue');
      return;
    }
    setRole('supervisor', supervisorName.trim());
    navigate('/supervisor');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-6">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-600/30">
          <Wrench size={30} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Sahidmie Operations</h1>
        <p className="text-slate-400 mt-2 text-sm">Select your role to continue</p>
      </div>

      {/* Role Cards */}
      <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-5">

        {/* Operations Manager */}
        <button
          onClick={handleManager}
          onMouseEnter={() => setHovering('manager')}
          onMouseLeave={() => setHovering(null)}
          className="group relative bg-slate-800 border border-slate-700 hover:border-blue-500 rounded-2xl p-7 text-left transition-all duration-200 hover:bg-slate-800/80 hover:shadow-xl hover:shadow-blue-500/10 cursor-pointer"
        >
          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 transition-colors ${hovering === 'manager' ? 'bg-blue-600' : 'bg-blue-600/20'}`}>
            <ShieldCheck size={24} className={`transition-colors ${hovering === 'manager' ? 'text-white' : 'text-blue-400'}`} />
          </div>
          <h2 className="text-lg font-bold text-white mb-1">Operations Manager</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Full access — manage contractors, approve reports, track payments and oversee all operations.
          </p>
          <div className="flex items-center gap-1 mt-5 text-blue-400 text-sm font-medium group-hover:gap-2 transition-all">
            Enter as Manager <ArrowRight size={15} />
          </div>
        </button>

        {/* Supervisor */}
        <div
          onMouseEnter={() => setHovering('supervisor')}
          onMouseLeave={() => setHovering(null)}
          className={`relative bg-slate-800 border rounded-2xl p-7 transition-all duration-200 ${hovering === 'supervisor' ? 'border-emerald-500 shadow-xl shadow-emerald-500/10' : 'border-slate-700'}`}
        >
          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 transition-colors ${hovering === 'supervisor' ? 'bg-emerald-600' : 'bg-emerald-600/20'}`}>
            <HardHat size={24} className={`transition-colors ${hovering === 'supervisor' ? 'text-white' : 'text-emerald-400'}`} />
          </div>
          <h2 className="text-lg font-bold text-white mb-1">Supervisor</h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-4">
            Submit daily reports, view assigned plans, and track your team's performance.
          </p>
          <div className="space-y-2">
            <input
              type="text"
              value={supervisorName}
              onChange={e => { setSupervisorName(e.target.value); setNameError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleSupervisor()}
              placeholder="Enter your full name"
              className={`w-full bg-slate-700 border rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:ring-2 transition-all ${nameError ? 'border-red-500 focus:ring-red-500/30' : 'border-slate-600 focus:border-emerald-500 focus:ring-emerald-500/20'}`}
            />
            {nameError && <p className="text-xs text-red-400">{nameError}</p>}
            <button
              onClick={handleSupervisor}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              Enter as Supervisor <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>

      <p className="text-slate-600 text-xs mt-8">Sahidmie Operation Team &mdash; v2.0</p>
    </div>
  );
}
