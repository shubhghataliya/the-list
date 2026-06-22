'use client';

import { useState, useMemo } from 'react';
import { X, FileText, Check, Loader2, Film, Tv, RefreshCw, ImageOff, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { Category } from '@/types';
import { CATEGORIES } from '@/utils/helpers';

const TMDB_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_SM = 'https://image.tmdb.org/t/p/w92';
const TMDB_MD = 'https://image.tmdb.org/t/p/w185';

interface TMDBResult {
  id: number;
  media_type: 'movie' | 'tv';
  title?: string;
  name?: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
}

interface ParsedItem {
  title: string;
  results: TMDBResult[];
  selectedIdx: number | null;
  searched: boolean;
  // manual search
  showSearch: boolean;
  searchQuery: string;
  searchResults: TMDBResult[];
  searching: boolean;
}

type Phase = 'input' | 'searching' | 'review';

interface TextImportModalProps {
  activeCategory: Category;
  onImport: (entries: Array<{ title: string; posterPath?: string }>, category: Category) => void;
  onClose: () => void;
}

function parseTextList(raw: string): string[] {
  return raw
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .map((l) => { const m = l.match(/^\d+[.)]\s*(.+)$/); return m ? m[1].trim() : l; })
    .filter((t) => t.length > 0);
}

function getYear(r: TMDBResult) {
  return (r.release_date || r.first_air_date || '').slice(0, 4);
}

export default function TextImportModal({ activeCategory, onImport, onClose }: TextImportModalProps) {
  const [phase, setPhase] = useState<Phase>('input');
  const [text, setText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>(activeCategory);
  const [items, setItems] = useState<ParsedItem[]>([]);
  const [searchProgress, setSearchProgress] = useState({ done: 0, total: 0 });
  const [reviewIdx, setReviewIdx] = useState(0);

  const parsedTitles = useMemo(() => parseTextList(text), [text]);

  /* ── helpers ── */
  const updateItem = (idx: number, patch: Partial<ParsedItem>) =>
    setItems((prev) => prev.map((item, i) => i === idx ? { ...item, ...patch } : item));

  /* ── Phase 1 → 2: auto-search TMDB ── */
  const findPosters = async () => {
    const titles = parsedTitles;
    if (!titles.length) return;

    const initial: ParsedItem[] = titles.map((t) => ({
      title: t, results: [], selectedIdx: null, searched: false,
      showSearch: false, searchQuery: t, searchResults: [], searching: false,
    }));
    setItems(initial);
    setSearchProgress({ done: 0, total: titles.length });
    setPhase('searching');

    const updated = [...initial];
    for (let i = 0; i < titles.length; i++) {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_KEY}&query=${encodeURIComponent(titles[i])}&include_adult=false`
        );
        const data = await res.json();
        const results: TMDBResult[] = ((data.results ?? []) as TMDBResult[])
          .filter((r) => (r.media_type === 'movie' || r.media_type === 'tv') && r.poster_path)
          .slice(0, 6);
        updated[i] = { ...updated[i], results, selectedIdx: results.length > 0 ? 0 : null, searched: true };
      } catch {
        updated[i] = { ...updated[i], searched: true };
      }
      setItems([...updated]);
      setSearchProgress({ done: i + 1, total: titles.length });
      await new Promise((r) => setTimeout(r, 100));
    }
    setReviewIdx(0);
    setPhase('review');
  };

  /* ── Manual search for one item ── */
  const runManualSearch = async (idx: number) => {
    const item = items[idx];
    if (!item.searchQuery.trim()) return;
    updateItem(idx, { searching: true, searchResults: [] });
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_KEY}&query=${encodeURIComponent(item.searchQuery.trim())}&include_adult=false`
      );
      const data = await res.json();
      const results: TMDBResult[] = ((data.results ?? []) as TMDBResult[])
        .filter((r) => (r.media_type === 'movie' || r.media_type === 'tv'))
        .slice(0, 6);
      updateItem(idx, { searching: false, searchResults: results });
    } catch {
      updateItem(idx, { searching: false });
    }
  };

  /* ── Pick a result from manual search ── */
  const pickManualResult = (itemIdx: number, result: TMDBResult) => {
    setItems((prev) => prev.map((item, i) => {
      if (i !== itemIdx) return item;
      const exists = item.results.findIndex((r) => r.id === result.id);
      if (exists !== -1) {
        return { ...item, selectedIdx: exists, showSearch: false, searchResults: [] };
      }
      const newResults = [result, ...item.results];
      return { ...item, results: newResults, selectedIdx: 0, showSearch: false, searchResults: [] };
    }));
  };

  /* ── Import ── */
  const importWithout = () => {
    onImport(parsedTitles.map((t) => ({ title: t })), selectedCategory);
    onClose();
  };

  const importWithPosters = () => {
    onImport(items.map((item) => ({
      title: item.title,
      posterPath: item.selectedIdx !== null ? (item.results[item.selectedIdx]?.poster_path ?? undefined) : undefined,
    })), selectedCategory);
    onClose();
  };

  const withPosters = items.filter((i) => i.selectedIdx !== null).length;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl animate-slide-up sm:animate-scale-in flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <FileText className="w-3.5 h-3.5 text-violet-400" />
            </div>
            <h2 className="text-zinc-100 font-semibold text-sm">
              {phase === 'input' ? 'Import from Text' : phase === 'searching' ? 'Finding Posters…' : 'Review Posters'}
            </h2>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ══════════ PHASE 1: Input ══════════ */}
        {phase === 'input' && (
          <div className="px-5 pb-5 flex flex-col gap-4 overflow-y-auto">
            <p className="text-zinc-500 text-xs -mt-1">Paste a numbered list — numbers and dots are stripped automatically.</p>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={"1. Attack on Titan\n2. One Piece\n3. Demon Slayer"}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 text-sm font-mono resize-none h-36 leading-relaxed"
              autoFocus
            />

            {parsedTitles.length > 0 && (
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 max-h-36 overflow-y-auto">
                <p className="text-zinc-500 text-[10px] uppercase tracking-wider mb-2 font-semibold">
                  {parsedTitles.length} title{parsedTitles.length !== 1 ? 's' : ''} detected
                </p>
                <div className="space-y-1">
                  {parsedTitles.map((title, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Check className="w-3 h-3 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span className="text-zinc-300 text-xs">{title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-zinc-500 text-[10px] uppercase tracking-wider mb-2 font-semibold">Add to</p>
              <div className="grid grid-cols-4 gap-1.5 bg-zinc-950 p-1.5 rounded-xl border border-zinc-800">
                {CATEGORIES.map((cat) => (
                  <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
                    className={`flex flex-col items-center py-2 px-1 rounded-lg text-xs transition-all ${selectedCategory === cat.id ? cat.tabActiveClass : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/70'}`}>
                    <span className="text-base leading-none">{cat.icon}</span>
                    <span className="mt-1 text-[10px] font-medium leading-none">{cat.shortLabel}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={importWithout} disabled={!parsedTitles.length}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-300 rounded-xl py-2.5 text-sm font-medium transition-colors">
                Skip Posters
              </button>
              <button onClick={findPosters} disabled={!parsedTitles.length}
                className="flex-1 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white rounded-xl py-2.5 text-sm font-medium transition-all flex items-center justify-center gap-2">
                <Film className="w-4 h-4" />Find Posters
              </button>
            </div>
          </div>
        )}

        {/* ══════════ PHASE 2: Searching ══════════ */}
        {phase === 'searching' && (
          <div className="px-5 pb-5 flex flex-col gap-4">
            <div className="flex items-center justify-center gap-3 py-2">
              <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
              <div>
                <p className="text-zinc-200 text-sm font-medium">Searching TMDB…</p>
                <p className="text-zinc-500 text-xs">{searchProgress.done} / {searchProgress.total}</p>
              </div>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-1.5">
              <div className="bg-violet-500 h-1.5 rounded-full transition-all duration-200"
                style={{ width: `${(searchProgress.done / searchProgress.total) * 100}%` }} />
            </div>
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
              {items.filter((i) => i.searched).map((item, i) => (
                <div key={i} className="flex items-center gap-2.5 px-3 py-2 border-b border-zinc-800/40 last:border-0">
                  {item.results[0]?.poster_path
                    ? <Image src={`${TMDB_SM}${item.results[0].poster_path}`} alt={item.title} width={20} height={30} className="rounded object-cover flex-shrink-0" />
                    : <div className="w-5 h-[30px] rounded bg-zinc-800 flex-shrink-0" />}
                  <span className="text-zinc-300 text-xs truncate flex-1">{item.title}</span>
                  {item.results.length > 0
                    ? <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                    : <span className="text-zinc-600 text-[10px] flex-shrink-0">no match</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════ PHASE 3: Review carousel ══════════ */}
        {phase === 'review' && (() => {
          const item = items[reviewIdx];
          const selected = item.selectedIdx !== null ? item.results[item.selectedIdx] : null;
          const isFirst = reviewIdx === 0;
          const isLast = reviewIdx === items.length - 1;

          return (
            <>
              {/* Progress bar */}
              <div className="px-5 pb-3 flex-shrink-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-zinc-500 text-xs">{reviewIdx + 1} / {items.length}</span>
                  <span className="text-zinc-500 text-xs">
                    <span className="text-emerald-400 font-semibold">{withPosters}</span> posters confirmed
                  </span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-1">
                  <div className="bg-violet-500 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${((reviewIdx + 1) / items.length) * 100}%` }} />
                </div>
              </div>

              {/* Carousel content */}
              <div className="flex-1 overflow-y-auto px-5">
                {/* Big poster */}
                <div className="flex justify-center mb-4">
                  <button
                    type="button"
                    onClick={() => {
                      if (item.results.length > 1) {
                        updateItem(reviewIdx, {
                          selectedIdx: item.selectedIdx === null ? 0
                            : (item.selectedIdx + 1) % item.results.length
                        });
                      }
                    }}
                    className="relative group"
                  >
                    {selected?.poster_path ? (
                      <div className="relative">
                        <Image
                          src={`${TMDB_MD}${selected.poster_path}`}
                          alt={item.title}
                          width={160}
                          height={240}
                          className="rounded-2xl object-cover shadow-2xl shadow-black/60"
                        />
                        {item.results.length > 1 && (
                          <>
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/80 rounded-full px-3 py-1 text-xs text-zinc-200 font-medium whitespace-nowrap backdrop-blur-sm">
                              {(item.selectedIdx ?? 0) + 1} / {item.results.length} — tap to cycle
                            </div>
                            <div className="absolute inset-0 bg-black/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <RefreshCw className="w-8 h-8 text-white drop-shadow-lg" />
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="w-40 h-60 rounded-2xl bg-zinc-800 border-2 border-dashed border-zinc-700 flex flex-col items-center justify-center gap-2">
                        {item.results.length === 0
                          ? <><Tv className="w-8 h-8 text-zinc-600" /><span className="text-xs text-zinc-600 text-center px-2">Not found on TMDB</span></>
                          : <><Film className="w-8 h-8 text-zinc-600" /><span className="text-xs text-zinc-600">No poster</span></>}
                      </div>
                    )}
                  </button>
                </div>

                {/* Editable title */}
                <input
                  value={item.title}
                  onChange={(e) => updateItem(reviewIdx, { title: e.target.value })}
                  className="w-full bg-transparent text-zinc-100 text-base font-semibold text-center focus:outline-none border-b border-transparent focus:border-zinc-600 pb-1 transition-colors mb-1"
                  placeholder="Title…"
                />
                {selected && (
                  <p className="text-zinc-500 text-xs text-center mb-4">
                    {getYear(selected)}{getYear(selected) ? ' · ' : ''}{selected.media_type === 'movie' ? 'Movie' : 'Series'}
                  </p>
                )}

                {/* Action buttons */}
                <div className="flex items-center justify-center gap-2 mb-4">
                  {selected && (
                    <button type="button" onClick={() => updateItem(reviewIdx, { selectedIdx: null })}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-400/10 transition-all text-xs border border-zinc-800">
                      <ImageOff className="w-3.5 h-3.5" /> Remove poster
                    </button>
                  )}
                  <button type="button"
                    onClick={() => updateItem(reviewIdx, { showSearch: !item.showSearch, searchQuery: item.title, searchResults: [] })}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all text-xs border ${item.showSearch ? 'bg-violet-500/20 text-violet-300 border-violet-500/30' : 'text-zinc-500 hover:text-violet-400 hover:bg-violet-400/10 border-zinc-800'}`}>
                    <Search className="w-3.5 h-3.5" /> Search manually
                  </button>
                </div>

                {/* Manual search panel */}
                {item.showSearch && (
                  <div className="space-y-2 mb-4 animate-fade-in">
                    <div className="flex gap-2">
                      <input
                        value={item.searchQuery}
                        onChange={(e) => updateItem(reviewIdx, { searchQuery: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && runManualSearch(reviewIdx)}
                        placeholder="Search TMDB…"
                        autoFocus
                        className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2.5 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 text-sm"
                      />
                      <button type="button" onClick={() => runManualSearch(reviewIdx)}
                        disabled={item.searching}
                        className="flex-shrink-0 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-xl px-4 transition-all">
                        {item.searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                      </button>
                    </div>

                    {item.searchResults.length > 0 && (
                      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
                        {item.searchResults.map((result) => (
                          <button key={result.id} type="button" onClick={() => pickManualResult(reviewIdx, result)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-zinc-800 transition-colors text-left border-b border-zinc-800/40 last:border-0">
                            {result.poster_path ? (
                              <Image src={`${TMDB_SM}${result.poster_path}`} alt={result.title ?? result.name ?? ''} width={36} height={54} className="rounded-lg object-cover flex-shrink-0" />
                            ) : (
                              <div className="w-9 h-[54px] rounded-lg bg-zinc-700 flex items-center justify-center flex-shrink-0">
                                <Film className="w-3.5 h-3.5 text-zinc-500" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-zinc-100 text-sm font-medium truncate">{result.title ?? result.name}</p>
                              <p className="text-zinc-500 text-xs mt-0.5">{getYear(result)} · {result.media_type === 'movie' ? 'Movie' : 'Series'}</p>
                            </div>
                            {result.poster_path
                              ? <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                              : <span className="text-zinc-600 text-xs flex-shrink-0">no poster</span>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer nav */}
              <div className="px-5 py-4 flex-shrink-0 border-t border-zinc-800 space-y-2">
                <div className="flex gap-2">
                  <button onClick={() => { setPhase('input'); }} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-xl px-3 py-2.5 text-sm transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                  <button onClick={() => setReviewIdx((i) => Math.max(i - 1, 0))} disabled={isFirst}
                    className="flex items-center gap-1 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 text-zinc-300 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors">
                    <ChevronLeft className="w-4 h-4" /> Prev
                  </button>
                  {isLast ? (
                    <button onClick={importWithPosters}
                      className="flex-1 bg-violet-600 hover:bg-violet-500 text-white rounded-xl py-2.5 text-sm font-semibold transition-all active:scale-[0.98]">
                      Import {items.length} titles
                    </button>
                  ) : (
                    <button onClick={() => setReviewIdx((i) => Math.min(i + 1, items.length - 1))}
                      className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-1">
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                  {!isLast && (
                    <button onClick={importWithPosters}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl px-3 py-2.5 text-sm font-medium transition-all active:scale-[0.98]">
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
}
