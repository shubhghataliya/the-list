'use client';

import { Category, CategoryConfig } from '@/types';

interface CategoryTabsProps {
  categories: CategoryConfig[];
  activeCategory: Category;
  counts: Record<Category, number>;
  onSelect: (category: Category) => void;
}

export default function CategoryTabs({
  categories,
  activeCategory,
  counts,
  onSelect,
}: CategoryTabsProps) {
  return (
    <div className="grid grid-cols-4 gap-1.5 mb-4 bg-zinc-900 p-1.5 rounded-xl border border-zinc-800">
      {categories.map((cat) => {
        const isActive = cat.id === activeCategory;
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={`flex flex-col items-center py-2.5 px-1 rounded-lg transition-all duration-200 ${
              isActive
                ? cat.tabActiveClass
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/70'
            }`}
          >
            <span className="text-lg leading-none">{cat.icon}</span>
            <span className="text-[10px] font-medium mt-1.5 leading-none">{cat.shortLabel}</span>
            <span
              className={`text-[10px] font-bold mt-1 tabular-nums leading-none ${
                isActive ? 'opacity-80' : 'opacity-50'
              }`}
            >
              {counts[cat.id]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
