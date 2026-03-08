import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wrench, Briefcase, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import type { AuthUser } from '@/context/AuthContext';

const IS_DUKAMO = import.meta.env.VITE_APP_MODE === 'dukamo';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [unverifiedUserId, setUnverifiedUserId] = useState<number | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setUnverifiedUserId(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.unverified && data.userId) {
          setUnverifiedUserId(data.userId);
        }
        setError(data.error || 'Login failed');
        return;
      }
      login(data.token, data.user as AuthUser);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const accent = IS_DUKAMO ? 'emerald' : 'blue';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-14 h-14 bg-${accent}-600 shadow-${accent}-600/40 rounded-2xl mb-4 shadow-lg`}>
            {IS_DUKAMO ? <Briefcase size={26} className="text-white" /> : <Wrench size={26} className="text-white" />}
          </div>
          <h1 className="text-2xl font-bold text-white">{IS_DUKAMO ? 'Dukamo' : 'Sahidmie Operations'}</h1>
          <p className="text-slate-400 text-sm mt-1">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
                {error}
                {unverifiedUserId && (
                  <button
                    type="button"
                    onClick={() => navigate('/verify-email', { state: { userId: unverifiedUserId, email } })}
                    className="mt-2 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 rounded-lg text-sm transition-colors"
                  >
                    Verify my email →
                  </button>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Email address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className={`w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-500 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-${accent}-500 focus:ring-2 focus:ring-${accent}-500/20 transition`}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-400">Password</label>
                <Link to="/forgot-password" className={`text-xs text-${accent}-400 hover:text-${accent}-300 transition-colors`}>Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className={`w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-500 rounded-xl pl-9 pr-10 py-2.5 text-sm outline-none focus:border-${accent}-500 focus:ring-2 focus:ring-${accent}-500/20 transition`}
                />
                <button type="button" onClick={() => setShowPwd(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-${accent}-600 hover:bg-${accent}-500 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors mt-2`}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        {IS_DUKAMO ? (
          <p className="text-center text-slate-400 text-sm mt-5">
            New to Dukamo?{' '}
            <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-medium">Create a free account</Link>
          </p>
        ) : (
          <p className="text-center text-slate-600 text-xs mt-6">
            Contact your administrator if you need access
          </p>
        )}
      </div>
    </div>
  );
}
