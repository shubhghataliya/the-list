'use client';

import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Mail, Lock, Loader2, Eye, EyeOff, ArrowLeft, ShieldCheck } from 'lucide-react';

type Mode = 'signin' | 'signup';
type SignupStep = 'form' | 'otp';

export default function AuthGate() {
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [signupStep, setSignupStep] = useState<SignupStep>('form');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const switchMode = (m: Mode) => {
    setMode(m);
    setError('');
    setPassword('');
    setSignupStep('form');
    setOtp(['', '', '', '', '', '']);
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

  /* ── Sign Up: create account ── */
  const handleSignUp = async (e?: React.FormEvent | React.KeyboardEvent) => {
    (e as React.FormEvent)?.preventDefault?.();
    if (!email.trim() || password.length < 6) return;
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signUp({ email: email.trim(), password });
    setLoading(false);
    if (error) {
      setError(toMsg(error));
    } else {
      setSignupStep('otp');
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }
  };

  /* ── Verify OTP ── */
  const verifyOtp = async (digits = otp) => {
    const token = digits.join('');
    if (token.length < 6) return;
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token,
      type: 'signup',
    });
    setLoading(false);
    if (error) {
      setError('Invalid or expired code. Try again.');
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    }
  };

  const handleOtpChange = (i: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[i] = digit;
    setOtp(next);
    if (digit && i < 5) otpRefs.current[i + 1]?.focus();
    if (digit && i === 5) verifyOtp([...next]);
  };

  const handleOtpKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (otp[i]) { const n = [...otp]; n[i] = ''; setOtp(n); }
      else if (i > 0) otpRefs.current[i - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const digits = pasted.split('');
      setOtp(digits);
      otpRefs.current[5]?.focus();
      verifyOtp(digits);
    }
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

          {/* Mode toggle */}
          {(mode === 'signin' || signupStep === 'form') && (
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
          )}

          {/* ── Sign In ── */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-3" autoComplete="on">
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
                  type="text"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  autoComplete="off"
                  data-lpignore="true"
                  data-1p-ignore
                  style={showPassword ? {} : { WebkitTextSecurity: 'disc' } as React.CSSProperties}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-10 py-3 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 transition-all text-sm"
                />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {error && <p className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{error}</p>}
              <button type="submit" disabled={!email.trim() || !password || loading}
                className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl py-3 font-semibold text-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Signing in…</> : 'Sign In'}
              </button>
            </form>
          )}

          {/* ── Sign Up: step 1 — email + password ── */}
          {mode === 'signup' && signupStep === 'form' && (
            <div className="space-y-3">
              <p className="text-zinc-500 text-xs">Enter your email and choose a password. We&apos;ll send a code to verify.</p>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                <input
                  type="text"
                  inputMode="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSignUp(e as never)}
                  placeholder="your@email.com"
                  autoFocus
                  autoComplete="off"
                  data-lpignore="true"
                  data-1p-ignore
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 transition-all text-sm"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSignUp(e as never)}
                  placeholder="Choose a password (min 6 chars)"
                  autoComplete="off"
                  data-lpignore="true"
                  data-1p-ignore
                  style={showPassword ? {} : { WebkitTextSecurity: 'disc' } as React.CSSProperties}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-10 py-3 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 transition-all text-sm"
                />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {error && <p className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{error}</p>}
              <button onClick={handleSignUp} disabled={!email.trim() || password.length < 6 || loading}
                className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl py-3 font-semibold text-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Creating account…</> : 'Create Account'}
              </button>
            </div>
          )}

          {/* ── Sign Up: step 2 — OTP ── */}
          {mode === 'signup' && signupStep === 'otp' && (
            <>
              <button onClick={() => { setSignupStep('form'); setError(''); }}
                className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 text-xs mb-5 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-4 h-4 text-violet-400" />
                <h2 className="text-zinc-100 font-semibold text-sm">Check your email</h2>
              </div>
              <p className="text-zinc-500 text-xs mb-5">
                We sent a 6-digit code to <span className="text-zinc-300">{email}</span>
              </p>
              <div className="flex gap-2 justify-between mb-4" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => { otpRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKey(i, e)}
                    disabled={loading}
                    className={`w-11 text-center text-xl font-bold rounded-xl border bg-zinc-950 text-zinc-100 focus:outline-none transition-all disabled:opacity-40
                      ${digit ? 'border-violet-500/60 bg-violet-500/5' : 'border-zinc-800'}
                      focus:border-violet-500/80`}
                    style={{ height: '3.25rem' }}
                  />
                ))}
              </div>
              {error && <p className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2 mb-3">{error}</p>}
              <button onClick={() => verifyOtp()} disabled={otp.join('').length < 6 || loading}
                className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl py-3 font-semibold text-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Verifying…</> : 'Verify & Sign In'}
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
