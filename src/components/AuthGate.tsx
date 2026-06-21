'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Mail, Lock, Loader2, CheckCircle, Eye, EyeOff } from 'lucide-react';

type Mode = 'signin' | 'signup';

export default function AuthGate() {
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [signedUp, setSignedUp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setLoading(true);
    setError('');

    if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) setError(error.message);
    } else {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });
      if (error) {
        setError(error.message);
      } else {
        setSignedUp(true);
      }
    }

    setLoading(false);
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setError('');
    setPassword('');
    setSignedUp(false);
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

        {signedUp ? (
          /* ── Confirm email state ── */
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center animate-scale-in">
            <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-emerald-400" />
            </div>
            <h2 className="text-zinc-100 font-semibold mb-2">Confirm your email</h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              We sent a confirmation link to{' '}
              <span className="text-zinc-200 font-medium">{email}</span>.
              <br />Click it then come back to sign in.
            </p>
            <button
              onClick={() => { setSignedUp(false); setMode('signin'); }}
              className="mt-5 text-violet-400 hover:text-violet-300 text-sm font-medium transition-colors"
            >
              Back to sign in
            </button>
          </div>
        ) : (
          /* ── Auth form ── */
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 animate-scale-in">
            {/* Mode toggle */}
            <div className="flex bg-zinc-950 rounded-xl p-1 mb-5">
              <button
                onClick={() => switchMode('signin')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  mode === 'signin'
                    ? 'bg-zinc-800 text-zinc-100'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => switchMode('signup')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  mode === 'signup'
                    ? 'bg-zinc-800 text-zinc-100'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Email */}
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  autoFocus
                  autoComplete="email"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all text-sm"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-10 py-3 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {error && (
                <p className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={!email.trim() || !password || loading}
                className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl py-3 font-semibold text-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> {mode === 'signin' ? 'Signing in…' : 'Creating account…'}</>
                ) : (
                  mode === 'signin' ? 'Sign In' : 'Create Account'
                )}
              </button>
            </form>

            {mode === 'signup' && (
              <p className="text-zinc-600 text-xs text-center mt-4">
                Password must be at least 6 characters
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
