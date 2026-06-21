import { Category, CategoryConfig, ListData, ListItem } from '@/types';
import type { SortOption } from '@/components/SortBar';

export const CATEGORIES: CategoryConfig[] = [
  {
    id: 'movies',
    label: 'Movies',
    shortLabel: 'Movies',
    icon: '🎬',
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
    bgClass: 'bg-pink-500/10',
    tabActiveClass: 'bg-pink-500/20 text-pink-300 ring-1 ring-inset ring-pink-500/30',
    badgeClass: 'bg-pink-500/10 text-pink-400 border border-pink-500/20',
    textColorClass: 'text-pink-400',
    borderClass: 'border-pink-500/30',
  },
];

export const INITIAL_DATA: ListData = {
  movies: [],
  'tv-series': [],
  anime: [],
  'k-drama': [],
};

export function getCategoryConfig(category: Category): CategoryConfig {
  return CATEGORIES.find((c) => c.id === category)!;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function getTotalCount(data: ListData): number {
  return Object.values(data).reduce((sum, items) => sum + items.length, 0);
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
