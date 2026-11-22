import React, { useState } from 'react';
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles, LogIn, UserPlus } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useDemoMode } from '../hooks/useDemoMode';

/** Only same-app paths are allowed as a post-login destination (no open redirects). */
function safeNext(value: string | null): string {
  return value && value.startsWith('/') && !value.startsWith('//') ? value : '/dashboard';
}

export const AuthPage: React.FC = () => {
  const [params] = useSearchParams();
  const next = safeNext(params.get('next'));
  const [mode, setMode] = useState<'signin' | 'signup'>(params.get('mode') === 'signup' ? 'signup' : 'signin');
  const [identifier, setIdentifier] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { login, register, demoLogin } = useAuthStore();
  const demoMode = useDemoMode();
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === 'signin') {
        await login(identifier.trim(), password);
      } else {
        await register({ email: email.trim(), username: username.trim(), password, full_name: fullName.trim() || undefined });
      }
      navigate(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  const tryDemo = async () => {
    setError(null);
    try {
      await demoLogin('student');
      navigate(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Demo login is unavailable');
    }
  };

  const input =
    'w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-violet-500/60 outline-none text-sm text-slate-100 placeholder:text-slate-500';

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 flex items-center justify-center px-4 py-12 bg-radial-glow bg-grid-pattern">
      <div className="w-full max-w-md">
        <NavLink to="/" className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 p-0.5">
            <div className="w-full h-full bg-[#0d0f17] rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-violet-400" />
            </div>
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white">SkillForge</span>
        </NavLink>

        <div className="rounded-2xl border border-slate-800 bg-[#0d0f17]/90 p-6 shadow-xl">
          <div className="grid grid-cols-2 gap-1 p-1 mb-6 rounded-xl bg-slate-900/90 border border-slate-800" role="tablist">
            {(['signin', 'signup'] as const).map((m) => (
              <button
                key={m}
                role="tab"
                aria-selected={mode === m}
                onClick={() => {
                  setMode(m);
                  setError(null);
                }}
                className={`py-2 rounded-lg text-sm font-semibold transition ${
                  mode === m ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {m === 'signin' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-3.5">
            {mode === 'signin' ? (
              <input
                className={input}
                placeholder="Email or username"
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            ) : (
              <>
                <input className={input} placeholder="Full name (optional)" autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                <input className={input} type="email" placeholder="Email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <input
                  className={input}
                  placeholder="Username (3-30 letters, digits, . _ -)"
                  autoComplete="username"
                  pattern="[A-Za-z0-9_.\-]{3,30}"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </>
            )}
            <input
              className={input}
              type="password"
              placeholder={mode === 'signup' ? 'Password (8+ characters)' : 'Password'}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              minLength={mode === 'signup' ? 8 : undefined}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && (
              <p role="alert" className="text-sm text-rose-400">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={busy}
              className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white text-sm font-semibold flex items-center justify-center gap-2 transition"
            >
              {mode === 'signin' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          {demoMode && (
            <button
              onClick={tryDemo}
              className="w-full mt-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-violet-500/60 text-slate-200 text-sm font-semibold transition"
            >
              Try the demo account instead
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
