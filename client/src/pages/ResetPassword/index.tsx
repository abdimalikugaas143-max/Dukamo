import { useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Briefcase, Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';

const IS_DUKAMO = import.meta.env.VITE_APP_MODE === 'dukamo';

export function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const prefillEmail = (location.state as { email?: string })?.email ?? '';

  const [email, setEmail] = useState(prefillEmail);
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  function handleDigit(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const next = [...digits];
    next[index] = value.slice(-1);
    setDigits(next);
    if (value && index < 5) inputs.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const code = digits.join('');
    if (code.length !== 6) { setError('Enter the full 6-digit code'); return; }
    if (newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Reset failed'); return; }
      setDone(true);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const accent = IS_DUKAMO ? 'emerald' : 'blue';

  if (done) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center">
          <div className={`inline-flex items-center justify-center w-16 h-16 bg-${accent}-500/20 rounded-full mb-4`}>
            <Lock size={28} className={`text-${accent}-400`} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Password updated!</h2>
          <p className="text-slate-400 text-sm mb-6">You can now sign in with your new password.</p>
          <button
            onClick={() => navigate('/')}
            className={`w-full bg-${accent}-600 hover:bg-${accent}-500 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors`}
          >
            Go to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-14 h-14 bg-${accent}-600 shadow-${accent}-600/40 rounded-2xl mb-4 shadow-lg`}>
            <Briefcase size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Reset password</h1>
          <p className="text-slate-400 text-sm mt-1">Enter the code from your email</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            {!prefillEmail && (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className={`w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-${accent}-500 transition`}
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">6-digit reset code</label>
              <div className="flex justify-between gap-2">
                {digits.map((d, i) => (
                  <input
                    key={i}
                    ref={el => { inputs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={e => handleDigit(i, e.target.value)}
                    onKeyDown={e => handleKeyDown(i, e)}
                    className={`w-11 h-12 text-center text-lg font-bold bg-slate-700 border-2 border-slate-600 text-white rounded-xl outline-none focus:border-${accent}-500 focus:ring-2 focus:ring-${accent}-500/20 transition`}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">New password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                  placeholder="Min. 6 characters"
                  className={`w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-500 rounded-xl pl-9 pr-10 py-2.5 text-sm outline-none focus:border-${accent}-500 focus:ring-2 focus:ring-${accent}-500/20 transition`}
                />
                <button type="button" onClick={() => setShowPwd(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Confirm new password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Repeat password"
                  className={`w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-500 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-${accent}-500 focus:ring-2 focus:ring-${accent}-500/20 transition`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || digits.join('').length !== 6}
              className={`w-full bg-${accent}-600 hover:bg-${accent}-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors`}
            >
              {loading ? 'Updating...' : 'Reset password'}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-400 text-sm mt-5">
          <Link to="/forgot-password" className="inline-flex items-center gap-1.5 hover:text-slate-300 transition-colors">
            <ArrowLeft size={14} /> Request a new code
          </Link>
        </p>
      </div>
    </div>
  );
}
