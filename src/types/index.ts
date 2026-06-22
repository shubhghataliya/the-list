export type Category = string;

export interface ListItem {
  id: string;
  title: string;
  category: Category;
  addedAt: number;
  posterPath?: string;
}

export type ListData = Record<string, ListItem[]>;

export interface CategoryConfig {
  id: string;
  label: string;
  shortLabel: string;
  icon: string;
  type: 'movies' | 'series';
  bgClass: string;
  tabActiveClass: string;
  badgeClass: string;
  textColorClass: string;
  borderClass: string;
  bgImage?: string;
}
