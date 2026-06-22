'use client';

import { X, Lock, CheckCircle2 } from 'lucide-react';
import { RANKS, getRank, getNextRank, getRankProgress } from '@/utils/ranks';

interface Props {
  seriesCount: number;
  onClose: () => void;
}

export default function RankRoadmapModal({ seriesCount, onClose }: Props) {
  const currentRank = getRank(seriesCount);
  const nextRank = getNextRank(seriesCount);
  const progress = getRankProgress(seriesCount);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm max-h-[85vh] flex flex-col animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800 flex-shrink-0">
          <div>
            <h2 className="text-zinc-100 font-bold text-base">Rank Journey</h2>
            <p className="text-zinc-500 text-xs mt-0.5">{seriesCount} series watched</p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current rank summary */}
        <div className={`mx-4 mt-4 p-3 rounded-xl border ${currentRank.bgClass} ${currentRank.borderClass} flex-shrink-0`}>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl leading-none">{currentRank.badge}</span>
            <div className="flex-1 min-w-0">
              <p className={`font-bold text-sm ${currentRank.textClass}`}>{currentRank.name}</p>
              {nextRank ? (
                <p className="text-zinc-500 text-xs">
                  {nextRank.min - seriesCount} more to reach {nextRank.name}
                </p>
              ) : (
                <p className="text-zinc-500 text-xs">Max rank — you&apos;re a legend</p>
              )}
            </div>
          </div>
          {nextRank && (
            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${currentRank.progressClass}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>

        {/* Rank list */}
        <div className="overflow-y-auto flex-1 p-4 space-y-2">
          {RANKS.map((rank) => {
            const unlocked = seriesCount >= rank.min;
            const isCurrent = rank.name === currentRank.name;
            const isNext = nextRank?.name === rank.name;

            return (
              <div
                key={rank.name}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  isCurrent
                    ? `${rank.bgClass} ${rank.borderClass}`
                    : unlocked
                    ? 'bg-zinc-800/40 border-zinc-700/50'
                    : 'bg-zinc-900/50 border-zinc-800/30 opacity-40'
                }`}
              >
                <span className="text-xl w-8 text-center leading-none">{rank.badge}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${isCurrent ? rank.textClass : unlocked ? 'text-zinc-300' : 'text-zinc-600'}`}>
                    {rank.name}
                  </p>
                  <p className="text-zinc-600 text-xs">
                    {rank.max === -1 ? `${rank.min}+` : `${rank.min}–${rank.max}`} series
                  </p>
                </div>
                <div className="flex-shrink-0">
                  {isCurrent ? (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${rank.bgClass} ${rank.textClass} ${rank.borderClass}`}>
                      You
                    </span>
                  ) : unlocked ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : isNext ? (
                    <span className="text-zinc-600 text-xs tabular-nums">{rank.min - seriesCount} away</span>
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-zinc-700" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
