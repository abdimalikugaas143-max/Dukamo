import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Briefcase, Mail } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import type { AuthUser } from '@/context/AuthContext';

export function VerifyEmail() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { userId, email } = (location.state || {}) as { userId: number; email: string };

  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => { if (!userId) navigate('/register'); }, [userId, navigate]);

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

  async function handleVerify() {
    const code = digits.join('');
    if (code.length !== 6) { setError('Enter the full 6-digit code'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, code }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Verification failed'); return; }
      login(data.token, data.user as AuthUser);
      navigate(data.user.role === 'employer' ? '/dukamo/dashboard/employer' : '/dukamo/dashboard/worker');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResent(false);
    try {
      await fetch('/api/auth/resend-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      setResent(true);
      setDigits(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } catch {}
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-600 rounded-2xl mb-4 shadow-lg shadow-emerald-600/40">
            <Briefcase size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Check your email</h1>
          <p className="text-slate-400 text-sm mt-2 flex items-center justify-center gap-1.5">
            <Mail size={14} /> We sent a 6-digit code to
          </p>
          <p className="text-emerald-400 text-sm font-medium mt-0.5">{email}</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-2xl">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}
          {resent && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm px-4 py-3 rounded-xl mb-4">
              New code sent! Check your inbox.
            </div>
          )}

          <div className="flex justify-center gap-2 mb-6">
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
                className="w-11 h-14 text-center text-xl font-bold bg-slate-700 border-2 border-slate-600 text-white rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
              />
            ))}
          </div>

          <button
            onClick={handleVerify}
            disabled={loading || digits.join('').length !== 6}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </div>

        <p className="text-center text-slate-400 text-sm mt-5">
          Didn't receive it?{' '}
          <button onClick={handleResend} className="text-emerald-400 hover:text-emerald-300 font-medium">
            Resend code
          </button>
        </p>
      </div>
    </div>
  );
}
