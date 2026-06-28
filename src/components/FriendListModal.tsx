'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { ArrowLeft, List, LayoutGrid, Grid2X2 } from 'lucide-react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { CATEGORIES, buildCustomCategoryConfig } from '@/utils/helpers';
import { CategoryConfig } from '@/types';

const TMDB_IMG = 'https://image.tmdb.org/t/p/w92';
const TMDB_IMG_MD = 'https://image.tmdb.org/t/p/w185';

interface FriendItem {
  id: string;
  title: string;
  category: string;
  added_at: number;
  position: number | null;
  poster_path: string | null;
}

interface FriendCategory {
  id: string;
  name: string;
  type: string;
  palette_index: number;
}

type ViewMode = 'list' | 'grid' | 'bigGrid';

interface FriendListModalProps {
  userId: string;
  username: string;
  isVip?: boolean;
  seriesCount?: number;
  onBack: () => void;
}

export default function FriendListModal({ userId, username, isVip, seriesCount, onBack }: FriendListModalProps) {
  const [items, setItems] = useState<FriendItem[]>([]);
  const [customCats, setCustomCats] = useState<FriendCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const load = async () => {
      // Check privacy first
      const { data: profile } = await supabase
        .from('profiles')
        .select('list_public')
        .eq('id', userId)
        .single();

      if (profile?.list_public === false) {
        setIsPrivate(true);
        setLoading(false);
        return;
      }

      // Fetch items + custom categories directly
      const [listRes, catsRes] = await Promise.all([
        supabase
          .from('list_items')
          .select('id, title, category, added_at, position, poster_path')
          .eq('user_id', userId),
        supabase
          .from('custom_categories')
          .select('id, name, type, palette_index')
          .eq('user_id', userId),
      ]);

      if (listRes.data) setItems(listRes.data as FriendItem[]);
      if (catsRes.data) setCustomCats(catsRes.data as FriendCategory[]);
      setLoading(false);
    };
    load();
  }, [userId]);

  const allCategories: CategoryConfig[] = useMemo(() => [
    ...CATEGORIES,
    ...customCats.map((c) =>
      buildCustomCategoryConfig(c.name, c.type as 'movies' | 'series', c.palette_index, c.id)
    ),
  ], [customCats]);

  const groupedItems = useMemo(() => {
    const map = new Map<string, FriendItem[]>();
    [...items].sort((a, b) => a.added_at - b.added_at).forEach((item) => {
      if (!map.has(item.category)) map.set(item.category, []);
      map.get(item.category)!.push(item);
    });
    return map;
  }, [items]);

  // Build display categories from actual item data — falls back to a generic config
  // so items always show even if custom category metadata failed to load
  const displayCategories: CategoryConfig[] = useMemo(() => {
    return Array.from(groupedItems.keys()).map((catId) => {
      return allCategories.find((c) => c.id === catId) ?? {
        id: catId,
        label: catId,
        shortLabel: catId,
        icon: '📁',
        type: 'series' as const,
        bgClass: 'bg-zinc-500/10',
        tabActiveClass: 'bg-zinc-500/20 text-zinc-300 ring-1 ring-inset ring-zinc-500/30',
        badgeClass: 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20',
        textColorClass: 'text-zinc-400',
        borderClass: 'border-zinc-500/30',
      };
    });
  }, [groupedItems, allCategories]);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-200 transition-colors py-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </button>

        {/* View toggle */}
        {!loading && items.length > 0 && (
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1 gap-0.5">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}
              aria-label="List view"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('bigGrid')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'bigGrid' ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}
              aria-label="Big grid view"
            >
              <Grid2X2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}
              aria-label="Grid view"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Profile strip */}
      <div className="flex items-center gap-3 mb-6 pb-5 border-b border-zinc-800">
        <div className="relative flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-sky-500 flex items-center justify-center">
            <span className="text-white text-xl font-bold">{username.charAt(0).toUpperCase()}</span>
          </div>
          {isVip && <span className="absolute -top-1 -right-1 text-sm leading-none">👑</span>}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-zinc-100">{username}</h2>
            {isVip && <span className="text-xs font-semibold text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 rounded-full px-2 py-0.5">VIP</span>}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            {items.length > 0 ? (
              <>
                <p className="text-zinc-500 text-sm">{items.length} title{items.length !== 1 ? 's' : ''}</p>
                {seriesCount !== undefined && <p className="text-zinc-600 text-xs">· {seriesCount} series</p>}
              </>
            ) : seriesCount !== undefined ? (
              <p className="text-zinc-500 text-sm">{seriesCount} series</p>
            ) : null}
          </div>
        </div>
      </div>

      {/* Category nav pills */}
      {!loading && displayCategories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 mb-6 scrollbar-none">
          {displayCategories.map((cat) => {
            const count = groupedItems.get(cat.id)?.length ?? 0;
            return (
              <button
                key={cat.id}
                onClick={() => categoryRefs.current[cat.id]?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${cat.bgClass} ${cat.borderClass} ${cat.textColorClass}`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                <span className="opacity-60">{count}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : isPrivate ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <span className="text-4xl">🔒</span>
          <p className="text-zinc-300 font-semibold text-sm">This list is private</p>
          <p className="text-zinc-600 text-xs">{username} has restricted access to their list</p>
        </div>
      ) : displayCategories.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-zinc-500 text-sm">Nothing here yet</p>
        </div>
      ) : (
        <div className="space-y-8">
          {displayCategories.map((cat) => {
            const catItems = groupedItems.get(cat.id) ?? [];
            return (
              <div key={cat.id} ref={(el) => { categoryRefs.current[cat.id] = el; }}>
                {/* Category header */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-base">{cat.icon}</span>
                  <span className={`text-xs font-semibold uppercase tracking-wider ${cat.textColorClass}`}>
                    {cat.label}
                  </span>
                  <span className="text-zinc-700 text-xs">({catItems.length})</span>
                </div>

                {/* List view */}
                {viewMode === 'list' && (
                  <div>
                    {catItems.map((item, i) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 py-2 border-b border-zinc-800/50 last:border-0 px-1"
                      >
                        {item.poster_path ? (
                          <Image
                            src={`${TMDB_IMG}${item.poster_path}`}
                            alt={item.title}
                            width={28}
                            height={42}
                            className="rounded-md object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-7 h-[42px] rounded-md bg-zinc-800 border border-zinc-700/50 flex items-center justify-center flex-shrink-0 px-0.5">
                            <span className="text-zinc-500 text-[7px] leading-tight text-center line-clamp-3">{item.title}</span>
                          </div>
                        )}
                        <span className="text-zinc-600 text-xs tabular-nums font-mono flex-shrink-0 w-5 text-right">
                          {i + 1}.
                        </span>
                        <span className="text-zinc-200 text-sm flex-1 min-w-0">{item.title}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Big grid view */}
                {viewMode === 'bigGrid' && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                    {catItems.map((item, i) => (
                      <div key={item.id} className="flex flex-col">
                        <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700/50">
                          {item.poster_path ? (
                            <Image
                              src={`${TMDB_IMG_MD}${item.poster_path}`}
                              alt={item.title}
                              fill
                              className="object-cover"
                              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center p-3">
                              <span className="text-zinc-400 text-sm leading-tight text-center font-medium line-clamp-4">
                                {item.title}
                              </span>
                            </div>
                          )}
                          <div className="absolute top-1.5 left-1.5 bg-black/70 rounded-md px-1.5 py-0.5 text-[10px] text-zinc-300 font-mono backdrop-blur-sm">
                            {i + 1}
                          </div>
                        </div>
                        <p className="text-zinc-300 text-xs mt-2 leading-tight line-clamp-2 px-0.5">{item.title}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Small grid view */}
                {viewMode === 'grid' && (
                  <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-9 lg:grid-cols-12 gap-2">
                    {catItems.map((item, i) => (
                      <div key={item.id} className="flex flex-col">
                        <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700/50">
                          {item.poster_path ? (
                            <Image
                              src={`${TMDB_IMG_MD}${item.poster_path}`}
                              alt={item.title}
                              fill
                              className="object-cover"
                              sizes="(max-width: 640px) 20vw, (max-width: 1024px) 12vw, 8vw"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center p-1.5">
                              <span className="text-zinc-400 text-[9px] leading-tight text-center line-clamp-4">
                                {item.title}
                              </span>
                            </div>
                          )}
                          <div className="absolute top-1 left-1 bg-black/70 rounded-md px-1.5 py-0.5 text-[9px] text-zinc-300 font-mono backdrop-blur-sm">
                            {i + 1}
                          </div>
                        </div>
                        <p className="text-zinc-300 text-[11px] mt-1.5 leading-tight line-clamp-2 px-0.5">{item.title}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
