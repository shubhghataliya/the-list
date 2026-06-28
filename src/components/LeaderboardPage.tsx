'use client';

import { useEffect, useState, useCallback } from 'react';
import { ArrowLeft, Trophy, UserPlus, UserCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getRank } from '@/utils/ranks';
import FriendListModal from './FriendListModal';

interface LeaderboardEntry {
  user_id: string;
  username: string;
  series_count: number;
  is_vip: boolean;
}

interface LeaderboardPageProps {
  currentUserId: string;
  onBack: () => void;
}

const MEDAL = ['🥇', '🥈', '🥉'];
type Tab = 'all' | 'following';

export default function LeaderboardPage({ currentUserId, onBack }: LeaderboardPageProps) {
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
      <div className="w-full px-4 md:px-8 lg:px-12 xl:px-16 py-6 pb-28">
        <FriendListModal
          userId={viewingUser.userId}
          username={viewingUser.username}
          onBack={() => setViewingUser(null)}
        />
      </div>
    );
  }

  return (
    <div className="w-full px-4 md:px-8 lg:px-12 xl:px-16 py-6 pb-28">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-xl transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Leaderboard</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {(['all', 'following'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors capitalize ${
              tab === t
                ? 'bg-zinc-800 text-zinc-100'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
            }`}
          >
            {t === 'following' ? `Following (${following.size})` : 'All'}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : displayed.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-zinc-500 text-sm">
            {tab === 'following' ? "You're not following anyone yet" : 'No one on the leaderboard yet'}
          </p>
          {tab === 'following' && (
            <p className="text-zinc-600 text-xs mt-1">Switch to All and follow someone</p>
          )}
        </div>
      ) : (
        <div className="space-y-1.5 max-w-lg">
          {displayed.map((entry) => {
            const globalIdx = entries.indexOf(entry);
            const rank = getRank(entry.series_count);
            const isMe = entry.user_id === currentUserId;
            const isTop3 = globalIdx < 3;
            const isFollowing = following.has(entry.user_id);

            return (
              <div
                key={entry.user_id}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors ${
                  isMe
                    ? 'bg-violet-500/10 border border-violet-500/25'
                    : 'bg-zinc-900 border border-zinc-800 hover:border-zinc-700'
                }`}
              >
                {/* Position */}
                <div className="w-8 text-center flex-shrink-0">
                  {isTop3
                    ? <span className="text-lg leading-none">{MEDAL[globalIdx]}</span>
                    : <span className="text-zinc-500 text-sm font-mono tabular-nums">{globalIdx + 1}</span>}
                </div>

                {/* Rank badge */}
                <span className="text-lg leading-none flex-shrink-0">{rank.badge}</span>

                {/* Username */}
                <button
                  className={`flex-1 text-sm font-medium truncate text-left transition-colors ${
                    isMe ? 'text-violet-300 cursor-default' : 'text-zinc-200 hover:text-violet-300'
                  }`}
                  onClick={() => !isMe && setViewingUser({ userId: entry.user_id, username: entry.username })}
                  disabled={isMe}
                >
                  {entry.is_vip && <span className="mr-1">👑</span>}
                  {entry.username}
                  {isMe && <span className="text-violet-500 text-xs ml-1.5">(you)</span>}
                </button>

                {/* Count + rank name */}
                <div className="text-right flex-shrink-0">
                  <p className={`text-sm font-bold tabular-nums ${rank.textClass}`}>{entry.series_count}</p>
                  <p className="text-zinc-600 text-[10px]">{rank.name}</p>
                </div>

                {/* Follow button */}
                {!isMe && (
                  <button
                    onClick={() => toggleFollow(entry.user_id)}
                    className={`p-2 rounded-xl transition-all flex-shrink-0 ${
                      isFollowing
                        ? 'text-violet-400 bg-violet-500/10 hover:bg-red-500/10 hover:text-red-400'
                        : 'text-zinc-500 hover:text-violet-400 hover:bg-violet-500/10'
                    }`}
                    title={isFollowing ? 'Unfollow' : 'Follow'}
                  >
                    {isFollowing
                      ? <UserCheck className="w-4 h-4" />
                      : <UserPlus className="w-4 h-4" />}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
