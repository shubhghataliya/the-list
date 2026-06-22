'use client';

import { useEffect } from 'react';
import type { RankConfig } from '@/utils/ranks';

interface Props {
  rank: RankConfig;
  onClose: () => void;
}

export default function RankCelebrationModal({ rank, onClose }: Props) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className={`relative bg-zinc-900 border-2 ${rank.borderClass} rounded-3xl p-8 text-center max-w-xs w-full animate-scale-in`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Badge */}
        <div className={`w-28 h-28 rounded-full ${rank.bgClass} border-2 ${rank.borderClass} flex items-center justify-center mx-auto mb-5`}>
          <span className="text-6xl leading-none">{rank.badge}</span>
        </div>

        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">Rank Up!</p>
        <h2 className={`text-2xl font-bold ${rank.textClass} mb-3`}>{rank.name}</h2>
        <p className="text-zinc-400 text-sm leading-relaxed">
          You&apos;ve unlocked a new rank. Your dedication is legendary!
        </p>

        <button
          onClick={onClose}
          className={`mt-6 w-full py-2.5 rounded-xl font-semibold text-sm border ${rank.bgClass} ${rank.textClass} ${rank.borderClass} hover:opacity-80 transition-opacity`}
        >
          Let&apos;s go!
        </button>

        <p className="text-zinc-700 text-xs mt-3">Closes automatically in 5s</p>
      </div>
    </div>
  );
}
