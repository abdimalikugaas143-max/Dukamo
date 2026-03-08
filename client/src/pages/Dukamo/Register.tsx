import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Briefcase, Mail, Lock, User, Eye, EyeOff, Zap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import type { AuthUser } from '@/context/AuthContext';

export function DukamoRegister() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<'worker' | 'employer'>('worker');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, role }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Registration failed'); return; }
      login(data.token, data.user as AuthUser);
      navigate(role === 'employer' ? '/dukamo/dashboard/employer' : '/dukamo/dashboard/worker');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-600 rounded-2xl mb-4 shadow-lg shadow-emerald-600/40">
            <Briefcase size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Join Dukamo</h1>
          <p className="text-slate-400 text-sm mt-1">Ethiopia's Job & Gig Marketplace</p>
        </div>

        {/* Role picker */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => setRole('worker')}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${role === 'worker' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'}`}
          >
            <Zap size={22} />
            <span className="text-sm font-semibold">I'm a Worker</span>
            <span className="text-xs text-center leading-tight opacity-70">Find jobs & gigs</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('employer')}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${role === 'employer' ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'}`}
          >
            <Briefcase size={22} />
            <span className="text-sm font-semibold">I'm Hiring</span>
            <span className="text-xs text-center leading-tight opacity-70">Post jobs & tasks</span>
          </button>
        </div>

        {/* Form */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Full Name</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                  placeholder="Abebe Bekele"
                  className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-500 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Email address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                  placeholder="abebe@example.com"
                  className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-500 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                  placeholder="Min. 6 characters"
                  className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-500 rounded-xl pl-9 pr-10 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                />
                <button type="button" onClick={() => setShowPwd(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors mt-2"
            >
              {loading ? 'Creating account...' : `Create ${role === 'employer' ? 'Employer' : 'Worker'} Account`}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-400 text-sm mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
