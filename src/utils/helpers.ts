import { CategoryConfig, ListData, ListItem } from '@/types';
import type { SortOption } from '@/components/SortBar';

export const CATEGORIES: CategoryConfig[] = [
  {
    id: 'movies',
    label: 'Movies',
    shortLabel: 'Movies',
    icon: '🎬',
    type: 'movies',
    bgClass: 'bg-blue-500/10',
    tabActiveClass: 'bg-blue-500/20 text-blue-300 ring-1 ring-inset ring-blue-500/30',
    badgeClass: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    textColorClass: 'text-blue-400',
    borderClass: 'border-blue-500/30',
  },
  {
    id: 'tv-series',
    label: 'TV Series',
    shortLabel: 'TV',
    icon: '📺',
    type: 'series',
    bgClass: 'bg-emerald-500/10',
    tabActiveClass: 'bg-emerald-500/20 text-emerald-300 ring-1 ring-inset ring-emerald-500/30',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    textColorClass: 'text-emerald-400',
    borderClass: 'border-emerald-500/30',
  },
  {
    id: 'anime',
    label: 'Anime',
    shortLabel: 'Anime',
    icon: '⚡',
    type: 'series',
    bgClass: 'bg-orange-500/10',
    tabActiveClass: 'bg-orange-500/20 text-orange-300 ring-1 ring-inset ring-orange-500/30',
    badgeClass: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
    textColorClass: 'text-orange-400',
    borderClass: 'border-orange-500/30',
  },
  {
    id: 'k-drama',
    label: 'K-Drama',
    shortLabel: 'K-Drama',
    icon: '🌸',
    type: 'series',
    bgClass: 'bg-pink-500/10',
    tabActiveClass: 'bg-pink-500/20 text-pink-300 ring-1 ring-inset ring-pink-500/30',
    badgeClass: 'bg-pink-500/10 text-pink-400 border border-pink-500/20',
    textColorClass: 'text-pink-400',
    borderClass: 'border-pink-500/30',
  },
];

// Color palette for custom categories (cycles through)
const CUSTOM_PALETTE = [
  { bgClass: 'bg-violet-500/10', textColorClass: 'text-violet-400', borderClass: 'border-violet-500/30', badgeClass: 'bg-violet-500/10 text-violet-400 border border-violet-500/20', tabActiveClass: 'bg-violet-500/20 text-violet-300 ring-1 ring-inset ring-violet-500/30' },
  { bgClass: 'bg-sky-500/10', textColorClass: 'text-sky-400', borderClass: 'border-sky-500/30', badgeClass: 'bg-sky-500/10 text-sky-400 border border-sky-500/20', tabActiveClass: 'bg-sky-500/20 text-sky-300 ring-1 ring-inset ring-sky-500/30' },
  { bgClass: 'bg-amber-500/10', textColorClass: 'text-amber-400', borderClass: 'border-amber-500/30', badgeClass: 'bg-amber-500/10 text-amber-400 border border-amber-500/20', tabActiveClass: 'bg-amber-500/20 text-amber-300 ring-1 ring-inset ring-amber-500/30' },
  { bgClass: 'bg-rose-500/10', textColorClass: 'text-rose-400', borderClass: 'border-rose-500/30', badgeClass: 'bg-rose-500/10 text-rose-400 border border-rose-500/20', tabActiveClass: 'bg-rose-500/20 text-rose-300 ring-1 ring-inset ring-rose-500/30' },
  { bgClass: 'bg-teal-500/10', textColorClass: 'text-teal-400', borderClass: 'border-teal-500/30', badgeClass: 'bg-teal-500/10 text-teal-400 border border-teal-500/20', tabActiveClass: 'bg-teal-500/20 text-teal-300 ring-1 ring-inset ring-teal-500/30' },
  { bgClass: 'bg-fuchsia-500/10', textColorClass: 'text-fuchsia-400', borderClass: 'border-fuchsia-500/30', badgeClass: 'bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20', tabActiveClass: 'bg-fuchsia-500/20 text-fuchsia-300 ring-1 ring-inset ring-fuchsia-500/30' },
];

export function buildCustomCategoryConfig(
  name: string,
  type: 'movies' | 'series',
  paletteIndex: number
): CategoryConfig {
  const colors = CUSTOM_PALETTE[paletteIndex % CUSTOM_PALETTE.length];
  const id = `custom-${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
  return {
    id,
    label: name,
    shortLabel: name.length > 8 ? name.slice(0, 8) : name,
    icon: type === 'movies' ? '🎬' : '📺',
    type,
    ...colors,
  };
}

export const INITIAL_DATA: ListData = {
  movies: [],
  'tv-series': [],
  anime: [],
  'k-drama': [],
};

export function getCategoryConfig(id: string, allCategories: CategoryConfig[] = CATEGORIES): CategoryConfig {
  return allCategories.find((c) => c.id === id) ?? {
    id,
    label: id,
    shortLabel: id,
    icon: '📁',
    type: 'series' as const,
    bgClass: 'bg-zinc-500/10',
    tabActiveClass: 'bg-zinc-500/20 text-zinc-300 ring-1 ring-inset ring-zinc-500/30',
    badgeClass: 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20',
    textColorClass: 'text-zinc-400',
    borderClass: 'border-zinc-500/30',
  };
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function getTotalCount(data: ListData): number {
  return Object.values(data).reduce((sum, items) => sum + items.length, 0);
}

export function getTypeCount(data: ListData, type: 'movies' | 'series', allCategories: CategoryConfig[]): number {
  return allCategories
    .filter((c) => c.type === type)
    .reduce((sum, c) => sum + (data[c.id]?.length ?? 0), 0);
}

export function sortItems(items: ListItem[], sortBy: SortOption): ListItem[] {
  const copy = [...items];
  switch (sortBy) {
    case 'a-z':
      return copy.sort((a, b) => a.title.localeCompare(b.title));
    case 'z-a':
      return copy.sort((a, b) => b.title.localeCompare(a.title));
    case 'oldest':
      return copy.sort((a, b) => a.addedAt - b.addedAt);
    case 'newest':
    default:
      return copy.sort((a, b) => b.addedAt - a.addedAt);
  }
}
