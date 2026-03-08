import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, Mail, ArrowLeft } from 'lucide-react';

const IS_DUKAMO = import.meta.env.VITE_APP_MODE === 'dukamo';

export function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Something went wrong'); return; }
      setSent(true);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const accent = IS_DUKAMO ? 'emerald' : 'blue';
  const Icon = IS_DUKAMO ? Briefcase : Mail;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-14 h-14 bg-${accent}-600 shadow-${accent}-600/40 rounded-2xl mb-4 shadow-lg`}>
            <Icon size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Forgot password?</h1>
          <p className="text-slate-400 text-sm mt-1">We'll send a reset code to your email</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-2xl">
          {sent ? (
            <div className="text-center space-y-4">
              <div className={`w-12 h-12 rounded-full bg-${accent}-500/20 flex items-center justify-center mx-auto`}>
                <Mail size={22} className={`text-${accent}-400`} />
              </div>
              <p className="text-white font-medium">Check your email</p>
              <p className="text-slate-400 text-sm">If <span className="text-white">{email}</span> has an account, a 6-digit code is on its way.</p>
              <button
                onClick={() => navigate('/reset-password', { state: { email } })}
                className={`w-full bg-${accent}-600 hover:bg-${accent}-500 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors`}
              >
                Enter reset code →
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
                  {error}
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
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-${accent}-600 hover:bg-${accent}-500 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors`}
              >
                {loading ? 'Sending...' : 'Send reset code'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-slate-400 text-sm mt-5">
          <Link to="/" className="inline-flex items-center gap-1.5 hover:text-slate-300 transition-colors">
            <ArrowLeft size={14} /> Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
