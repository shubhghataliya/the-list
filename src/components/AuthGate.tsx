'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Mail, Loader2, CheckCircle, Sparkles } from 'lucide-react';

export default function AuthGate() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: { shouldCreateUser: true },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
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

        {sent ? (
          /* ── Sent state ── */
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center animate-scale-in">
            <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-emerald-400" />
            </div>
            <h2 className="text-zinc-100 font-semibold mb-2">Check your inbox</h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Magic link sent to{' '}
              <span className="text-zinc-200 font-medium">{email}</span>.
              <br />Click it to sign in instantly.
            </p>
            <button
              onClick={() => { setSent(false); setEmail(''); }}
              className="mt-5 text-zinc-600 hover:text-zinc-400 text-xs transition-colors"
            >
              Use a different email
            </button>
          </div>
        ) : (
          /* ── Login form ── */
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 animate-scale-in">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <h2 className="text-zinc-100 font-semibold">Sign in</h2>
            </div>
            <p className="text-zinc-500 text-sm mb-5 leading-relaxed">
              Enter your email — we&apos;ll send a magic link. No password needed.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  autoFocus
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all text-sm"
                />
              </div>

              {error && <p className="text-red-400 text-xs">{error}</p>}

              <button
                type="submit"
                disabled={!email.trim() || loading}
                className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl py-3 font-semibold text-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                ) : (
                  'Send Magic Link'
                )}
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-zinc-800 flex items-center justify-center gap-4 text-zinc-600 text-xs">
              <span>📱 Works on mobile</span>
              <span>🔄 Syncs across devices</span>
              <span>🔒 Private</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
