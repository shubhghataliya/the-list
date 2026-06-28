'use client';

import { useEffect, useState, useCallback } from 'react';
import { X, Trophy, UserPlus, UserCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getRank } from '@/utils/ranks';
import FriendListModal from './FriendListModal';

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
type Tab = 'all' | 'following';

export default function LeaderboardModal({ currentUserId, onClose }: LeaderboardModalProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('all');
  const [viewingUser, setViewingUser] = useState<{ userId: string; username: string } | null>(null);

  const fetchData = useCallback(async () => {
    const [lbRes, followRes] = await Promise.all([
      supabase.rpc('get_leaderboard'),
      supabase.from('follows').select('following_id').eq('follower_id', currentUserId),
    ]);
    if (lbRes.data) setEntries(lbRes.data as LeaderboardEntry[]);
    if (followRes.data)
      setFollowing(new Set(followRes.data.map((r: { following_id: string }) => r.following_id)));
    setLoading(false);
  }, [currentUserId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleFollow = async (userId: string) => {
    const isFollowing = following.has(userId);
    setFollowing((prev) => {
      const next = new Set(prev);
      if (isFollowing) next.delete(userId); else next.add(userId);
      return next;
    });
    if (isFollowing) {
      await supabase.from('follows').delete().eq('follower_id', currentUserId).eq('following_id', userId);
    } else {
      await supabase.from('follows').insert({ follower_id: currentUserId, following_id: userId });
    }
  };

  const displayed = tab === 'following'
    ? entries.filter((e) => following.has(e.user_id))
    : entries;

  if (viewingUser) {
    return (
      <FriendListModal
        userId={viewingUser.userId}
        username={viewingUser.username}
        onBack={() => setViewingUser(null)}
      />
    );
  }

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
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-zinc-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <p className="text-zinc-100 font-semibold">Leaderboard</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 py-2.5 flex-shrink-0">
          {(['all', 'following'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                tab === t ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {t === 'following' ? `Following (${following.size})` : 'All'}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1 px-3 pb-3 space-y-1">
          {loading ? (
            <div className="py-12 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : displayed.length === 0 ? (
            <p className="text-zinc-500 text-sm text-center py-12">
              {tab === 'following' ? "You're not following anyone yet" : 'No one on the leaderboard yet'}
            </p>
          ) : (
            displayed.map((entry) => {
              const globalIdx = entries.indexOf(entry);
              const rank = getRank(entry.series_count);
              const isMe = entry.user_id === currentUserId;
              const isTop3 = globalIdx < 3;
              const isFollowing = following.has(entry.user_id);

              return (
                <div
                  key={entry.user_id}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl transition-colors ${
                    isMe ? 'bg-violet-500/10 border border-violet-500/25' : 'hover:bg-zinc-800/60'
                  }`}
                >
                  {/* Position */}
                  <div className="w-7 text-center flex-shrink-0">
                    {isTop3
                      ? <span className="text-base leading-none">{MEDAL[globalIdx]}</span>
                      : <span className="text-zinc-500 text-xs font-mono tabular-nums">{globalIdx + 1}</span>}
                  </div>

                  {/* Rank badge */}
                  <span className="text-base leading-none flex-shrink-0">{rank.badge}</span>

                  {/* Username — clickable to view list */}
                  <button
                    className={`flex-1 text-sm font-medium truncate text-left transition-colors ${
                      isMe ? 'text-violet-300 cursor-default' : 'text-zinc-200 hover:text-violet-300'
                    }`}
                    onClick={() => !isMe && setViewingUser({ userId: entry.user_id, username: entry.username })}
                    disabled={isMe}
                  >
                    {entry.is_vip && <span className="mr-1">👑</span>}
                    {entry.username}
                    {isMe && <span className="text-violet-500 text-xs ml-1">(you)</span>}
                  </button>

                  {/* Count + rank */}
                  <div className="text-right flex-shrink-0">
                    <p className={`text-sm font-bold tabular-nums ${rank.textClass}`}>{entry.series_count}</p>
                    <p className="text-zinc-600 text-[10px]">{rank.name}</p>
                  </div>

                  {/* Follow button */}
                  {!isMe && (
                    <button
                      onClick={() => toggleFollow(entry.user_id)}
                      className={`p-1.5 rounded-lg transition-all flex-shrink-0 ${
                        isFollowing
                          ? 'text-violet-400 bg-violet-500/10 hover:bg-red-500/10 hover:text-red-400'
                          : 'text-zinc-500 hover:text-violet-400 hover:bg-violet-500/10'
                      }`}
                      title={isFollowing ? 'Unfollow' : 'Follow'}
                    >
                      {isFollowing
                        ? <UserCheck className="w-3.5 h-3.5" />
                        : <UserPlus className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
