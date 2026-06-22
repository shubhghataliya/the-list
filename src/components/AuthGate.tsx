'use client';

import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Mail, Lock, Loader2, Eye, EyeOff, ArrowLeft, ShieldCheck } from 'lucide-react';

type Mode = 'signin' | 'signup';
type SignupStep = 'email' | 'otp' | 'password';

export default function AuthGate() {
  const [mode, setMode] = useState<Mode>('signin');

  // Sign in state
  const [siEmail, setSiEmail] = useState('');
  const [siPassword, setSiPassword] = useState('');
  const [showSiPassword, setShowSiPassword] = useState(false);

  // Sign up state
  const [suEmail, setSuEmail] = useState('');
  const [suStep, setSuStep] = useState<SignupStep>('email');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [suPassword, setSuPassword] = useState('');
  const [showSuPassword, setShowSuPassword] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((v) => v - 1), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  const switchMode = (m: Mode) => {
    setMode(m);
    setError('');
    setSuStep('email');
    setOtp(['', '', '', '', '', '']);
    setSuPassword('');
    setSiPassword('');
  };

  /* ── Sign In ── */
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siEmail.trim() || !siPassword) return;
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email: siEmail.trim(), password: siPassword });
    if (error) setError(error.message);
    setLoading(false);
  };

  /* ── Sign Up: send OTP ── */
  const sendOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!suEmail.trim()) return;
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithOtp({
      email: suEmail.trim(),
      options: { shouldCreateUser: true },
    });
    setLoading(false);
    if (error) { setError(error.message); return; }
    setSuStep('otp');
    setOtp(['', '', '', '', '', '']);
    setResendCooldown(60);
    setTimeout(() => otpRefs.current[0]?.focus(), 100);
  };

  /* ── Sign Up: verify OTP ── */
  const verifyOtp = async (digits = otp) => {
    const token = digits.join('');
    if (token.length < 6) return;
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.verifyOtp({ email: suEmail.trim(), token, type: 'email' });
    setLoading(false);
    if (error) {
      setError('Invalid or expired code.');
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    } else {
      setSuStep('password');
    }
  };

  /* ── Sign Up: set password ── */
  const setPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (suPassword.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.updateUser({ password: suPassword });
    setLoading(false);
    if (error) setError(error.message);
    // on success useAuth picks up the session automatically
  };

  /* ── OTP input helpers ── */
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

          {/* Mode toggle — only show on first steps */}
          {(mode === 'signin' || suStep === 'email') && (
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

          {/* ── Sign In form ── */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-3">
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                <input type="email" value={siEmail} onChange={(e) => setSiEmail(e.target.value)}
                  placeholder="Email" autoFocus autoComplete="email"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all text-sm" />
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                <input type={showSiPassword ? 'text' : 'password'} value={siPassword} onChange={(e) => setSiPassword(e.target.value)}
                  placeholder="Password" autoComplete="current-password"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-10 py-3 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all text-sm" />
                <button type="button" onClick={() => setShowSiPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors">
                  {showSiPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {error && <p className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{error}</p>}
              <button type="submit" disabled={!siEmail.trim() || !siPassword || loading}
                className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl py-3 font-semibold text-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</> : 'Sign In'}
              </button>
            </form>
          )}

          {/* ── Sign Up: step 1 — email ── */}
          {mode === 'signup' && suStep === 'email' && (
            <form onSubmit={sendOtp} className="space-y-3">
              <p className="text-zinc-500 text-xs mb-1">We&apos;ll send a 6-digit code to verify your email.</p>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                <input type="email" value={suEmail} onChange={(e) => setSuEmail(e.target.value)}
                  placeholder="your@email.com" autoFocus autoComplete="email"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all text-sm" />
              </div>
              {error && <p className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{error}</p>}
              <button type="submit" disabled={!suEmail.trim() || loading}
                className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl py-3 font-semibold text-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : 'Send Code'}
              </button>
            </form>
          )}

          {/* ── Sign Up: step 2 — OTP ── */}
          {mode === 'signup' && suStep === 'otp' && (
            <>
              <button onClick={() => { setSuStep('email'); setError(''); }}
                className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 text-xs mb-5 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Change email
              </button>
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-4 h-4 text-violet-400" />
                <h2 className="text-zinc-100 font-semibold text-sm">Enter the 6-digit code</h2>
              </div>
              <p className="text-zinc-500 text-xs mb-5">Sent to <span className="text-zinc-300">{suEmail}</span></p>
              <div className="flex gap-2 justify-between mb-4" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input key={i} ref={(el) => { otpRefs.current[i] = el; }}
                    type="text" inputMode="numeric" maxLength={1} value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKey(i, e)}
                    disabled={loading}
                    className={`w-11 text-center text-xl font-bold rounded-xl border bg-zinc-950 text-zinc-100 focus:outline-none transition-all
                      ${digit ? 'border-violet-500/60 bg-violet-500/5' : 'border-zinc-800'}
                      focus:border-violet-500/80 focus:ring-1 focus:ring-violet-500/30 disabled:opacity-40`}
                    style={{ height: '3.25rem' }} />
                ))}
              </div>
              {error && <p className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2 mb-3">{error}</p>}
              <button onClick={() => verifyOtp()} disabled={otp.join('').length < 6 || loading}
                className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl py-3 font-semibold text-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying…</> : 'Verify'}
              </button>
              <div className="text-center mt-4">
                {resendCooldown > 0
                  ? <p className="text-zinc-600 text-xs">Resend in {resendCooldown}s</p>
                  : <button onClick={() => sendOtp()} disabled={loading}
                      className="text-violet-400 hover:text-violet-300 text-xs font-medium transition-colors disabled:opacity-40">
                      Resend code
                    </button>}
              </div>
            </>
          )}

          {/* ── Sign Up: step 3 — set password ── */}
          {mode === 'signup' && suStep === 'password' && (
            <form onSubmit={setPassword} className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <p className="text-zinc-300 text-sm">Email verified! Set a password to finish.</p>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                <input type={showSuPassword ? 'text' : 'password'} value={suPassword}
                  onChange={(e) => setSuPassword(e.target.value)}
                  placeholder="Choose a password" autoFocus autoComplete="new-password"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-10 py-3 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all text-sm" />
                <button type="button" onClick={() => setShowSuPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors">
                  {showSuPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {error && <p className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{error}</p>}
              <button type="submit" disabled={suPassword.length < 6 || loading}
                className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl py-3 font-semibold text-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : 'Create Account'}
              </button>
              <p className="text-zinc-600 text-xs text-center">Minimum 6 characters</p>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
