export type Category = 'movies' | 'tv-series' | 'anime' | 'k-drama';

export interface ListItem {
  id: string;
  title: string;
  category: Category;
  addedAt: number;
}

export type ListData = {
  [K in Category]: ListItem[];
};

export interface CategoryConfig {
  id: Category;
  label: string;
  shortLabel: string;
  icon: string;
  bgClass: string;
  tabActiveClass: string;
  badgeClass: string;
  textColorClass: string;
  borderClass: string;
}
