'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Mail, Lock, Loader2, Eye, EyeOff, MailCheck } from 'lucide-react';

type Mode = 'signin' | 'signup';

export default function AuthGate() {
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const switchMode = (m: Mode) => {
    setMode(m);
    setError('');
    setPassword('');
    setDone(false);
  };

  const toMsg = (err: { message?: string } | null) =>
    err?.message && typeof err.message === 'string' && err.message.trim() && err.message !== '{}'
      ? err.message
      : 'Something went wrong. Please try again.';

  /* ── Sign In ── */
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) setError(toMsg(error));
    setLoading(false);
  };

  /* ── Sign Up ── */
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || password.length < 6) return;
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signUp({ email: email.trim(), password });
    setLoading(false);
    if (error) setError(toMsg(error));
    else setDone(true);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Branding */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-violet-500/10 border border-violet-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📋</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">The List</h1>
          <p className="text-zinc-500 text-sm mt-1">Your personal watched library</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 animate-scale-in">

          {/* ── Check email confirmation screen ── */}
          {done ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-violet-500/10 border border-violet-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MailCheck className="w-7 h-7 text-violet-400" />
              </div>
              <h2 className="text-zinc-100 font-bold text-base mb-2">Check your email</h2>
              <p className="text-zinc-500 text-sm leading-relaxed">
                We sent a confirmation link to<br />
                <span className="text-zinc-300 font-medium">{email}</span>
              </p>
              <p className="text-zinc-600 text-xs mt-4">Click the link to activate your account, then sign in.</p>
              <button
                onClick={() => { setDone(false); switchMode('signin'); }}
                className="mt-5 text-violet-400 hover:text-violet-300 text-sm transition-colors"
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <>
              {/* Mode toggle */}
              <div className="flex bg-zinc-950 rounded-xl p-1 mb-5">
                <button onClick={() => switchMode('signin')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'signin' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}>
                  Sign In
                </button>
                <button onClick={() => switchMode('signup')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'signup' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}>
                  Sign Up
                </button>
              </div>

              <form onSubmit={mode === 'signin' ? handleSignIn : handleSignUp} className="space-y-3" autoComplete="on">
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    autoFocus
                    autoComplete="email"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 transition-all text-sm"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === 'signup' ? 'Password (min 6 chars)' : 'Password'}
                    autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-10 py-3 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 transition-all text-sm"
                  />
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {error && <p className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{error}</p>}

                <button
                  type="submit"
                  disabled={!email.trim() || (mode === 'signup' ? password.length < 6 : !password) || loading}
                  className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl py-3 font-semibold text-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  {loading
                    ? <><Loader2 className="w-4 h-4 animate-spin" />{mode === 'signin' ? 'Signing in…' : 'Creating account…'}</>
                    : mode === 'signin' ? 'Sign In' : 'Create Account'
                  }
                </button>
              </form>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
