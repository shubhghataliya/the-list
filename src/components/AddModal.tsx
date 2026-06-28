'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Plus, Search, Loader2, Film, Tv } from 'lucide-react';
import Image from 'next/image';
import { Category, CategoryConfig } from '@/types';

const TMDB_IMG = 'https://image.tmdb.org/t/p/w185';

interface TMDBResult {
  id: number;
  media_type: 'movie' | 'tv';
  title?: string;
  name?: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
}

interface AddModalProps {
  defaultCategory: Category;
  categories: CategoryConfig[];
  existingItems?: Map<string, string>; // lowercase title -> category label
  onAdd: (title: string, category: Category, posterPath?: string) => void;
  onClose: () => void;
}

export default function AddModal({ defaultCategory, categories, existingItems, onAdd, onClose }: AddModalProps) {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<TMDBResult[]>([]);
  const [selected, setSelected] = useState<TMDBResult | null>(null);
  const [category, setCategory] = useState<Category>(defaultCategory);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const duplicateIn = existingItems?.get(query.trim().toLowerCase()) ?? null;

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    const q = query.trim();
    if (!q || q.length < 2 || selected) {
      if (!q || q.length < 2) setResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    timerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/tmdb/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setResults(
          ((data.results ?? []) as TMDBResult[])
            .filter((r) => r.media_type === 'movie' || r.media_type === 'tv')
            .slice(0, 8)
        );
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [query, selected]);

  const handleSelect = (result: TMDBResult) => {
    setSelected(result);
    setQuery(result.title ?? result.name ?? '');
    setResults([]);
  };

  const handleClear = () => {
    setSelected(null);
    setQuery('');
    setResults([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const title = query.trim();
    if (!title) return;
    onAdd(title, category, selected?.poster_path ?? undefined);
    onClose();
  };

  const getYear = (r: TMDBResult) => (r.release_date || r.first_air_date || '').slice(0, 4);

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 w-full max-w-md shadow-2xl animate-slide-up sm:animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-zinc-100 font-semibold">Add Title</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); if (selected) setSelected(null); }}
              placeholder="Search movies, series, anime..."
              autoFocus
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-10 py-3 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all text-sm"
            />
            {searching && (
              <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400 animate-spin pointer-events-none" />
            )}
            {(selected || query) && !searching && (
              <button type="button" onClick={handleClear} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* TMDB results */}
          {results.length > 0 && !selected && (
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden max-h-60 overflow-y-auto animate-fade-in">
              {results.map((result) => (
                <button
                  key={result.id}
                  type="button"
                  onClick={() => handleSelect(result)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-zinc-800/80 transition-colors text-left border-b border-zinc-800/40 last:border-0"
                >
                  {result.poster_path ? (
                    <Image
                      src={`${TMDB_IMG}${result.poster_path}`}
                      alt={result.title ?? result.name ?? ''}
                      width={32}
                      height={48}
                      className="rounded-md object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-12 rounded-md bg-zinc-800 flex items-center justify-center flex-shrink-0">
                      {result.media_type === 'movie'
                        ? <Film className="w-3.5 h-3.5 text-zinc-600" />
                        : <Tv className="w-3.5 h-3.5 text-zinc-600" />}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-zinc-100 text-sm font-medium leading-tight truncate">
                      {result.title ?? result.name}
                    </p>
                    <p className="text-zinc-500 text-xs mt-0.5">
                      {getYear(result)}{getYear(result) ? ' · ' : ''}{result.media_type === 'movie' ? 'Movie' : 'Series'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Selected preview */}
          {selected && (
            <div className="flex items-center gap-3 bg-zinc-950 border border-emerald-500/20 rounded-xl p-3 animate-fade-in">
              {selected.poster_path ? (
                <Image
                  src={`${TMDB_IMG}${selected.poster_path}`}
                  alt={selected.title ?? selected.name ?? ''}
                  width={44}
                  height={66}
                  className="rounded-lg object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-11 h-[66px] rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0">
                  {selected.media_type === 'movie' ? <Film className="w-4 h-4 text-zinc-600" /> : <Tv className="w-4 h-4 text-zinc-600" />}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-zinc-100 text-sm font-medium leading-tight">{selected.title ?? selected.name}</p>
                <p className="text-zinc-500 text-xs mt-0.5">{getYear(selected)} · {selected.media_type === 'movie' ? 'Movie' : 'Series'}</p>
                {selected.poster_path && (
                  <p className="text-emerald-400 text-xs mt-1">✓ Poster saved</p>
                )}
              </div>
            </div>
          )}

          {/* Duplicate warning */}
          {duplicateIn && (
            <div className="flex items-center gap-2.5 bg-yellow-500/10 border border-yellow-500/25 rounded-xl px-3.5 py-2.5 animate-fade-in">
              <span className="text-base leading-none flex-shrink-0">⚠️</span>
              <p className="text-yellow-300 text-xs">
                Already in <span className="font-semibold">{duplicateIn}</span> — you can still add it again
              </p>
            </div>
          )}

          {/* Category selector */}
          <div>
            <p className="text-zinc-500 text-xs mb-2 font-medium">Add to category</p>
            <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all duration-150 ${
                    category === cat.id
                      ? `${cat.bgClass} ${cat.borderClass} ${cat.textColorClass}`
                      : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  <span className="text-base leading-none">{cat.icon}</span>
                  <span className="truncate">{cat.label}</span>
                  {category === cat.id && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!query.trim()}
            className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl py-3 font-semibold text-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            {selected?.poster_path ? 'Add with Poster' : 'Add'}
          </button>
        </form>
      </div>
    </div>
  );
}
