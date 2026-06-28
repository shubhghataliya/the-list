'use client';

import { useEffect, useState } from 'react';
import { X, Trophy } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getRank } from '@/utils/ranks';

interface LeaderboardEntry {
  user_id: string;
  username: string;
  series_count: number;
  is_vip: boolean;
}

interface LeaderboardModalProps {
  currentUserId: string;
  onClose: () => void;
}

const MEDAL = ['🥇', '🥈', '🥉'];

export default function LeaderboardModal({ currentUserId, onClose }: LeaderboardModalProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.rpc('get_leaderboard').then(({ data, error }) => {
      if (!error && data) setEntries(data as LeaderboardEntry[]);
      setLoading(false);
    });
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm shadow-2xl flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-zinc-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <p className="text-zinc-100 font-semibold">Leaderboard</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1 px-3 py-3 space-y-1">
          {loading ? (
            <div className="py-12 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : entries.length === 0 ? (
            <p className="text-zinc-500 text-sm text-center py-12">No one on the leaderboard yet</p>
          ) : (
            entries.map((entry, i) => {
              const rank = getRank(entry.series_count);
              const isMe = entry.user_id === currentUserId;
              const isTop3 = i < 3;

              return (
                <div
                  key={entry.user_id}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                    isMe ? 'bg-violet-500/10 border border-violet-500/25' : 'hover:bg-zinc-800/60'
                  }`}
                >
                  {/* Position */}
                  <div className="w-7 text-center flex-shrink-0">
                    {isTop3
                      ? <span className="text-base leading-none">{MEDAL[i]}</span>
                      : <span className="text-zinc-500 text-xs font-mono tabular-nums">{i + 1}</span>}
                  </div>

                  {/* Rank badge */}
                  <span className="text-base leading-none flex-shrink-0">{rank.badge}</span>

                  {/* Username + VIP crown */}
                  <span className={`flex-1 text-sm font-medium truncate ${isMe ? 'text-violet-300' : 'text-zinc-200'}`}>
                    {entry.is_vip && <span className="mr-1">👑</span>}
                    {entry.username}
                    {isMe && <span className="text-violet-500 text-xs ml-1">(you)</span>}
                  </span>

                  {/* Count + rank name */}
                  <div className="text-right flex-shrink-0">
                    <p className={`text-sm font-bold tabular-nums ${rank.textClass}`}>{entry.series_count}</p>
                    <p className="text-zinc-600 text-[10px]">{rank.name}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
