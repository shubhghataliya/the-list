'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Image from 'next/image';
import { ArrowLeft, Pencil, Check, Trash2, X, GripVertical, ImageIcon, Loader2, List, LayoutGrid, Search, Film, ImageOff } from 'lucide-react';
import { Category, CategoryConfig, ListItem } from '@/types';
import { getCategoryConfig, sortItems } from '@/utils/helpers';
import SortBar, { SortOption } from '@/components/SortBar';
import EmptyState from '@/components/EmptyState';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';

const TMDB_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_IMG = 'https://image.tmdb.org/t/p/w92';
const TMDB_IMG_MD = 'https://image.tmdb.org/t/p/w185';

interface TMDBResult {
  id: number;
  media_type: string;
  title?: string;
  name?: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
}

/* ── Draggable edit row ───────────────────────────────────── */
interface SortableRowProps {
  item: ListItem;
  index: number;
  total: number;
  onUpdateTitle: (id: string, value: string) => void;
  onUpdatePoster: (id: string, posterPath: string | undefined) => void;
  onRemove: (id: string) => void;
}

function SortableRow({ item, index, onUpdateTitle, onUpdatePoster, onRemove }: SortableRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState(item.title);
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<TMDBResult[]>([]);
  const rowDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.6 : 1,
  };

  const runSearch = async (q = query) => {
    if (!q.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_KEY}&query=${encodeURIComponent(q.trim())}&include_adult=false`
      );
      const data = await res.json();
      setResults(
        ((data.results ?? []) as TMDBResult[])
          .filter((r) => r.media_type === 'movie' || r.media_type === 'tv')
          .slice(0, 6)
      );
    } catch {}
    setSearching(false);
  };

  useEffect(() => {
    if (!showSearch || !query.trim()) return;
    if (rowDebounceRef.current) clearTimeout(rowDebounceRef.current);
    rowDebounceRef.current = setTimeout(() => runSearch(query), 400);
    return () => { if (rowDebounceRef.current) clearTimeout(rowDebounceRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, showSearch]);

  const pickPoster = (result: TMDBResult) => {
    if (result.poster_path) onUpdatePoster(item.id, result.poster_path);
    setShowSearch(false);
    setResults([]);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-zinc-900 border rounded-xl transition-colors ${
        isDragging ? 'border-violet-500/40 shadow-lg shadow-black/40' : 'border-zinc-800'
      }`}
    >
      {/* Main row */}
      <div className="px-3 py-2.5 flex items-center gap-2">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="text-zinc-600 hover:text-zinc-400 cursor-grab active:cursor-grabbing touch-none flex-shrink-0 p-0.5"
          aria-label="Drag to reorder"
        >
          <GripVertical className="w-4 h-4" />
        </button>

        {/* Poster thumbnail or placeholder */}
        <div className="flex-shrink-0 w-6 h-9 rounded overflow-hidden bg-zinc-800 border border-zinc-700/50">
          {item.posterPath ? (
            <Image src={`${TMDB_IMG}${item.posterPath}`} alt={item.title} width={24} height={36} className="object-cover w-full h-full" />
          ) : (
            <div className="w-full h-full" />
          )}
        </div>

        {/* Index */}
        <span className="text-zinc-600 text-xs tabular-nums w-4 text-right flex-shrink-0 font-mono">
          {index + 1}.
        </span>

        {/* Editable title */}
        <input
          value={item.title}
          onChange={(e) => { onUpdateTitle(item.id, e.target.value); setQuery(e.target.value); }}
          className="flex-1 bg-transparent text-zinc-100 text-sm focus:outline-none min-w-0 border-b border-transparent focus:border-zinc-600 pb-0.5 transition-colors placeholder-zinc-600"
          placeholder="Title…"
        />

        {/* Find poster */}
        <button
          onClick={() => { setShowSearch((v) => !v); setQuery(item.title); setResults([]); }}
          className={`flex-shrink-0 p-1.5 rounded-lg transition-all ${showSearch ? 'bg-violet-500/20 text-violet-400' : 'text-zinc-600 hover:text-violet-400 hover:bg-violet-400/10'}`}
          aria-label="Find poster"
          title="Find poster"
        >
          <ImageIcon className="w-3.5 h-3.5" />
        </button>

        {/* Delete */}
        <button
          onClick={() => onRemove(item.id)}
          className="flex-shrink-0 p-1.5 text-zinc-700 hover:text-red-400 hover:bg-red-400/10 transition-all rounded-lg"
          aria-label="Remove"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Inline poster search panel */}
      {showSearch && (
        <div className="px-3 pb-3 space-y-2 animate-fade-in border-t border-zinc-800 pt-2">
          <div className="flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && runSearch()}
              placeholder="Search TMDB…"
              autoFocus
              className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 text-xs"
            />
            <button
              onClick={() => runSearch()}
              disabled={searching}
              className="flex-shrink-0 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-lg px-3 py-1.5 transition-all"
            >
              {searching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            </button>
          </div>

          {results.length > 0 && (
            <div className="grid grid-cols-3 gap-1.5">
              {results.map((r) => (
                <button
                  key={r.id}
                  onClick={() => pickPoster(r)}
                  className="group relative flex flex-col items-center gap-1"
                  title={r.title ?? r.name}
                >
                  <div className="w-full aspect-[2/3] rounded-lg overflow-hidden bg-zinc-800 border border-zinc-700 group-hover:border-violet-500/50 transition-all">
                    {r.poster_path ? (
                      <Image src={`${TMDB_IMG_MD}${r.poster_path}`} alt={r.title ?? r.name ?? ''} width={80} height={120} className="object-cover w-full h-full" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Film className="w-4 h-4 text-zinc-600" />
                      </div>
                    )}
                  </div>
                  <span className="text-zinc-400 text-[9px] leading-tight text-center line-clamp-2 w-full">
                    {r.title ?? r.name}
                  </span>
                </button>
              ))}
              {/* No poster option */}
              {item.posterPath && (
                <button
                  onClick={() => { onUpdatePoster(item.id, undefined); setShowSearch(false); }}
                  className="flex flex-col items-center gap-1"
                >
                  <div className="w-full aspect-[2/3] rounded-lg bg-zinc-800 border border-zinc-700 hover:border-red-500/40 flex items-center justify-center transition-all">
                    <ImageOff className="w-4 h-4 text-zinc-600" />
                  </div>
                  <span className="text-zinc-600 text-[9px]">Remove</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Draggable grid cell (edit mode grid) ──────────────────── */
interface SortableGridItemProps {
  item: ListItem;
  index: number;
  onUpdateTitle: (id: string, value: string) => void;
  onRemove: (id: string) => void;
  onFindPoster: (id: string) => void;
}

function SortableGridItem({ item, index, onUpdateTitle, onRemove, onFindPoster }: SortableGridItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex flex-col gap-1">
      {/* Card */}
      <div className={`relative aspect-[2/3] rounded-xl overflow-hidden border ${isDragging ? 'border-violet-500/60' : 'border-zinc-700/50'} bg-zinc-800`}>
        {item.posterPath ? (
          <Image src={`${TMDB_IMG_MD}${item.posterPath}`} alt={item.title} fill className="object-cover" sizes="20vw" />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-1.5">
            <span className="text-zinc-400 text-[9px] leading-tight text-center line-clamp-4">{item.title}</span>
          </div>
        )}

        {/* Drag handle overlay */}
        <div
          {...attributes}
          {...listeners}
          className="absolute inset-0 cursor-grab active:cursor-grabbing"
        />

        {/* Index badge */}
        <div className="absolute top-1 left-1 bg-black/70 rounded px-1 py-0.5 text-[8px] text-zinc-300 font-mono pointer-events-none">
          {index + 1}
        </div>

        {/* Delete */}
        <button
          onClick={() => onRemove(item.id)}
          className="absolute top-1 right-1 p-1 rounded-md bg-black/60 text-zinc-400 hover:text-red-400 transition-all backdrop-blur-sm z-10"
          aria-label="Remove"
        >
          <Trash2 className="w-3 h-3" />
        </button>

        {/* Find poster */}
        <button
          onClick={() => onFindPoster(item.id)}
          className="absolute bottom-1 left-1/2 -translate-x-1/2 p-1.5 rounded-lg bg-black/60 text-zinc-300 hover:text-violet-300 transition-all backdrop-blur-sm z-10"
          aria-label="Find poster"
          title="Find poster"
        >
          <ImageIcon className="w-3 h-3" />
        </button>
      </div>

      {/* Editable title */}
      <input
        value={item.title}
        onChange={(e) => onUpdateTitle(item.id, e.target.value)}
        className="w-full bg-transparent text-zinc-300 text-[10px] leading-tight focus:outline-none text-center border-b border-transparent focus:border-zinc-600 pb-0.5 transition-colors placeholder-zinc-600 truncate"
        placeholder="Title…"
      />
    </div>
  );
}

/* ── Main component ───────────────────────────────────────── */
interface CategoryDetailProps {
  category: Category;
  items: ListItem[];
  allCategories: CategoryConfig[];
  onBack: () => void;
  onUpdateItems: (category: Category, items: ListItem[]) => void;
  onDeleteItem?: (id: string, category: Category) => void;
  onUpdatePoster?: (id: string, posterPath: string) => void;
}

export default function CategoryDetail({
  category,
  items,
  allCategories,
  onBack,
  onUpdateItems,
  onDeleteItem,
  onUpdatePoster,
}: CategoryDetailProps) {
  const config = getCategoryConfig(category, allCategories);
  const [editMode, setEditMode] = useState(false);
  const [editItems, setEditItems] = useState<ListItem[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('oldest');
  const [deleteTarget, setDeleteTarget] = useState<ListItem | null>(null);
  const [fetchingPosters, setFetchingPosters] = useState(false);
  const [posterProgress, setPosterProgress] = useState({ done: 0, total: 0 });
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [posterPickerId, setPosterPickerId] = useState<string | null>(null);
  const [pickerQuery, setPickerQuery] = useState('');
  const [pickerSearching, setPickerSearching] = useState(false);
  const [pickerResults, setPickerResults] = useState<TMDBResult[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const enterEdit = () => {
    setEditItems([...items]);
    setEditMode(true);
  };

  const cancelEdit = () => {
    setEditMode(false);
    setEditItems([]);
  };

  const saveEdit = () => {
    onUpdateItems(category, editItems.filter((i) => i.title.trim() !== ''));
    setEditMode(false);
    setEditItems([]);
  };

  const updateTitle = (id: string, value: string) => {
    setEditItems((prev) => prev.map((i) => (i.id === id ? { ...i, title: value } : i)));
  };

  const updatePosterInEdit = (id: string, posterPath: string | undefined) => {
    setEditItems((prev) => prev.map((i) => (i.id === id ? { ...i, posterPath } : i)));
  };

  const openPosterPicker = (id: string) => {
    const item = editItems.find((i) => i.id === id);
    setPickerQuery(item?.title ?? '');
    setPickerResults([]);
    setPosterPickerId(id);
  };

  const runPickerSearch = async (query = pickerQuery) => {
    if (!query.trim()) return;
    setPickerSearching(true);
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_KEY}&query=${encodeURIComponent(query.trim())}&include_adult=false`
      );
      const data = await res.json();
      setPickerResults(
        ((data.results ?? []) as TMDBResult[])
          .filter((r) => r.media_type === 'movie' || r.media_type === 'tv')
          .slice(0, 9)
      );
    } catch {}
    setPickerSearching(false);
  };

  const pickerDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!posterPickerId || !pickerQuery.trim()) return;
    if (pickerDebounceRef.current) clearTimeout(pickerDebounceRef.current);
    pickerDebounceRef.current = setTimeout(() => runPickerSearch(pickerQuery), 400);
    return () => { if (pickerDebounceRef.current) clearTimeout(pickerDebounceRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickerQuery, posterPickerId]);

  const removeFromEdit = (id: string) => {
    setEditItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setEditItems((prev) => {
        const oldIndex = prev.findIndex((i) => i.id === active.id);
        const newIndex = prev.findIndex((i) => i.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    if (onDeleteItem) {
      onDeleteItem(deleteTarget.id, category);
    } else {
      onUpdateItems(category, items.filter((i) => i.id !== deleteTarget.id));
    }
    setDeleteTarget(null);
  };

  const sortedItems = useMemo(() => sortItems(items, sortBy), [items, sortBy]);
  const missingPosters = items.filter((i) => !i.posterPath);

  const fetchMissingPosters = async () => {
    if (!onUpdatePoster || missingPosters.length === 0 || fetchingPosters) return;
    setFetchingPosters(true);
    setPosterProgress({ done: 0, total: missingPosters.length });

    for (let i = 0; i < missingPosters.length; i++) {
      const item = missingPosters[i];
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_KEY}&query=${encodeURIComponent(item.title)}&include_adult=false`
        );
        const data = await res.json();
        const match = ((data.results ?? []) as Array<{ media_type: string; poster_path: string | null }>)
          .find((r) => (r.media_type === 'movie' || r.media_type === 'tv') && r.poster_path);
        if (match?.poster_path) {
          await onUpdatePoster(item.id, match.poster_path);
        }
      } catch {}
      setPosterProgress({ done: i + 1, total: missingPosters.length });
      await new Promise((r) => setTimeout(r, 120));
    }

    setFetchingPosters(false);
  };

  return (
    <div className="animate-fade-in">
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={editMode ? cancelEdit : onBack}
          className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-200 transition-colors py-1"
        >
          {editMode ? (
            <><X className="w-4 h-4" /><span className="text-sm">Cancel</span></>
          ) : (
            <><ArrowLeft className="w-4 h-4" /><span className="text-sm">Back</span></>
          )}
        </button>

        {editMode ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditItems([])}
              disabled={editItems.length === 0}
              className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 disabled:opacity-30 disabled:cursor-not-allowed text-red-400 border border-red-500/20 rounded-xl px-3 py-2 text-xs font-medium transition-all active:scale-[0.98]"
              title="Delete all items"
            >
              <Trash2 className="w-3.5 h-3.5" />
              All
            </button>
            <button
              onClick={saveEdit}
              className="flex items-center gap-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 rounded-xl px-4 py-2 text-sm font-semibold transition-all active:scale-[0.98]"
            >
              <Check className="w-3.5 h-3.5" />
              Save
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {/* Fetch Posters button */}
            {onUpdatePoster && missingPosters.length > 0 && items.length > 0 && (
              <button
                onClick={fetchMissingPosters}
                disabled={fetchingPosters}
                className="flex items-center gap-1.5 bg-violet-500/10 hover:bg-violet-500/20 disabled:opacity-60 text-violet-400 border border-violet-500/20 rounded-xl px-3 py-2 text-xs font-medium transition-all active:scale-[0.98]"
                title={`Fetch posters for ${missingPosters.length} item${missingPosters.length !== 1 ? 's' : ''}`}
              >
                {fetchingPosters ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" />{posterProgress.done}/{posterProgress.total}</>
                ) : (
                  <><ImageIcon className="w-3.5 h-3.5" />{missingPosters.length}</>
                )}
              </button>
            )}
            <button
              onClick={enterEdit}
              disabled={items.length === 0}
              className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-300 border border-zinc-700 hover:border-zinc-600 rounded-xl px-4 py-2 text-sm font-medium transition-all active:scale-[0.98]"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </button>
          </div>
        )}
      </div>

      {/* ── Category header ── */}
      <div className={`flex items-center gap-3 mb-5 pb-5 border-b border-zinc-800`}>
        <div className={`w-12 h-12 rounded-2xl ${config.bgClass} border ${config.borderClass} flex items-center justify-center flex-shrink-0`}>
          <span className="text-2xl leading-none">{config.icon}</span>
        </div>
        <div>
          <h2 className={`text-xl font-bold ${config.textColorClass}`}>{config.label}</h2>
          <p className="text-zinc-500 text-sm">
            {editMode
              ? `Editing ${editItems.length} title${editItems.length !== 1 ? 's' : ''}`
              : `${items.length} title${items.length !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      {/* ── Edit mode hint ── */}
      {editMode && (
        <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl px-4 py-2.5 mb-4 flex items-center gap-2 animate-fade-in">
          <GripVertical className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
          <p className="text-violet-300 text-xs">
            Drag <GripVertical className="w-3 h-3 inline -mt-0.5" /> to reorder. Tap a title to rename it.
          </p>
        </div>
      )}

      {/* ── Sort bar + view toggle (view mode only) ── */}
      {!editMode && items.length > 1 && (
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <SortBar count={items.length} label={config.label.toLowerCase()} sortBy={sortBy} onChange={setSortBy} />
          </div>
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1 gap-0.5 flex-shrink-0">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}
              aria-label="List view"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}
              aria-label="Grid view"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ── Empty state ── */}
      {items.length === 0 ? (
        <EmptyState
          message={`No ${config.label.toLowerCase()} added yet`}
          subMessage='Tap "+" to add your first title'
          icon={config.icon}
        />
      ) : editMode ? (
        /* ══════════════════════════════════
           EDIT MODE — list or grid
           ══════════════════════════════════ */
        <>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            {viewMode === 'list' ? (
              <SortableContext items={editItems.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-1.5">
                  {editItems.map((item, i) => (
                    <SortableRow
                      key={item.id}
                      item={item}
                      index={i}
                      total={editItems.length}
                      onUpdateTitle={updateTitle}
                      onUpdatePoster={updatePosterInEdit}
                      onRemove={removeFromEdit}
                    />
                  ))}
                </div>
              </SortableContext>
            ) : (
              <SortableContext items={editItems.map((i) => i.id)} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-5 gap-2">
                  {editItems.map((item, i) => (
                    <SortableGridItem
                      key={item.id}
                      item={item}
                      index={i}
                      onUpdateTitle={updateTitle}
                      onRemove={removeFromEdit}
                      onFindPoster={openPosterPicker}
                    />
                  ))}
                </div>
              </SortableContext>
            )}
          </DndContext>

          {/* ── Poster picker modal (grid edit mode) ── */}
          {posterPickerId && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4 animate-fade-in"
              onClick={() => { setPosterPickerId(null); setPickerResults([]); }}>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 w-full max-w-sm shadow-2xl animate-slide-up sm:animate-scale-in flex flex-col max-h-[80vh]"
                onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-zinc-100 font-semibold text-sm">Find Poster</p>
                  <button onClick={() => { setPosterPickerId(null); setPickerResults([]); }}
                    className="text-zinc-500 hover:text-zinc-300 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex gap-2 mb-3">
                  <input
                    value={pickerQuery}
                    onChange={(e) => setPickerQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && runPickerSearch()}
                    placeholder="Search TMDB…"
                    autoFocus
                    className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2.5 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 text-sm"
                  />
                  <button onClick={() => runPickerSearch()} disabled={pickerSearching}
                    className="flex-shrink-0 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-xl px-4 transition-all">
                    {pickerSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  </button>
                </div>
                {pickerResults.length > 0 && (
                  <div className="overflow-y-auto flex-1 -mx-1 px-1">
                  <div className="grid grid-cols-3 gap-2">
                    {pickerResults.map((r) => (
                      <button key={r.id} onClick={() => {
                        if (r.poster_path) updatePosterInEdit(posterPickerId, r.poster_path);
                        setPosterPickerId(null);
                        setPickerResults([]);
                      }} className="group flex flex-col gap-1">
                        <div className="aspect-[2/3] rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700 group-hover:border-violet-500/50 transition-all">
                          {r.poster_path
                            ? <Image src={`${TMDB_IMG_MD}${r.poster_path}`} alt={r.title ?? r.name ?? ''} width={100} height={150} className="object-cover w-full h-full" />
                            : <div className="w-full h-full flex items-center justify-center"><Film className="w-5 h-5 text-zinc-600" /></div>}
                        </div>
                        <span className="text-zinc-400 text-[9px] leading-tight text-center line-clamp-2">{r.title ?? r.name}</span>
                      </button>
                    ))}
                    {editItems.find((i) => i.id === posterPickerId)?.posterPath && (
                      <button onClick={() => { updatePosterInEdit(posterPickerId, undefined); setPosterPickerId(null); }}
                        className="flex flex-col gap-1">
                        <div className="aspect-[2/3] rounded-xl bg-zinc-800 border border-zinc-700 hover:border-red-500/40 flex items-center justify-center transition-all">
                          <ImageOff className="w-5 h-5 text-zinc-600" />
                        </div>
                        <span className="text-zinc-600 text-[9px] text-center">Remove</span>
                      </button>
                    )}
                  </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        /* ══════════════════════════════════
           VIEW MODE — list or grid
           ══════════════════════════════════ */
        viewMode === 'list' ? (
          <div>
            {sortedItems.map((item, i) => (
              <div
                key={item.id}
                className="group flex items-center gap-3 py-2 border-b border-zinc-800/50 last:border-0 hover:bg-zinc-900/40 px-1 rounded-lg transition-colors"
              >
                {item.posterPath ? (
                  <Image src={`${TMDB_IMG}${item.posterPath}`} alt={item.title} width={28} height={42} className="rounded-md object-cover flex-shrink-0" />
                ) : (
                  <div className="w-7 h-[42px] rounded-md bg-zinc-800 border border-zinc-700/50 flex items-center justify-center flex-shrink-0 overflow-hidden px-0.5">
                    <span className="text-zinc-500 text-[7px] leading-tight text-center font-medium line-clamp-3">{item.title}</span>
                  </div>
                )}
                <span className="text-zinc-600 text-xs tabular-nums font-mono flex-shrink-0 w-5 text-right self-center">{i + 1}.</span>
                <span className="text-zinc-200 text-sm flex-1 min-w-0 self-center">{item.title}</span>
                <button onClick={() => setDeleteTarget(item)}
                  className="flex-shrink-0 p-1.5 rounded-lg text-zinc-800 hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100 active:scale-95 self-center"
                  aria-label={`Delete ${item.title}`}>
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          /* ── Grid view ── */
          <div className="grid grid-cols-5 gap-2">
            {sortedItems.map((item, i) => (
              <div key={item.id} className="group relative flex flex-col">
                {/* Poster */}
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700/50">
                  {item.posterPath ? (
                    <Image src={`${TMDB_IMG_MD}${item.posterPath}`} alt={item.title} fill className="object-cover" sizes="20vw" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 p-2">
                      <span className="text-zinc-400 text-[10px] leading-tight text-center font-medium line-clamp-4">{item.title}</span>
                    </div>
                  )}
                  {/* Index badge */}
                  <div className="absolute top-1 left-1 bg-black/70 rounded-md px-1.5 py-0.5 text-[9px] text-zinc-300 font-mono backdrop-blur-sm">
                    {i + 1}
                  </div>
                  {/* Delete overlay */}
                  <button
                    onClick={() => setDeleteTarget(item)}
                    className="absolute top-1 right-1 p-1 rounded-md bg-black/60 text-zinc-400 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100 active:scale-95 backdrop-blur-sm"
                    aria-label={`Delete ${item.title}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                {/* Title */}
                <p className="text-zinc-300 text-[11px] mt-1.5 leading-tight line-clamp-2 px-0.5">{item.title}</p>
              </div>
            ))}
          </div>
        )
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          title={deleteTarget.title}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
