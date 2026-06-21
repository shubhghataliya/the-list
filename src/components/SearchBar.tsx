'use client';

import { Search, X } from 'lucide-react';
import { Category } from '@/types';
import { CATEGORIES } from '@/utils/helpers';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  filterCategory: Category | 'all';
  onFilterChange: (cat: Category | 'all') => void;
}

export default function SearchBar({ value, onChange, filterCategory, onFilterChange }: SearchBarProps) {
  return (
    <div className="mb-4 space-y-2">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
        <input
          type="text"
          placeholder="Search across all lists..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-10 py-2.5 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all text-sm"
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors p-0.5 rounded"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category filter pills — only shown while searching */}
      {value && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 animate-fade-in">
          <button
            onClick={() => onFilterChange('all')}
            className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all duration-150 ${
              filterCategory === 'all'
                ? 'bg-violet-500/20 text-violet-300 ring-1 ring-inset ring-violet-500/30'
                : 'bg-zinc-900 text-zinc-500 hover:text-zinc-300 border border-zinc-800'
            }`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onFilterChange(cat.id)}
              className={`flex-shrink-0 flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all duration-150 ${
                filterCategory === cat.id
                  ? cat.tabActiveClass
                  : 'bg-zinc-900 text-zinc-500 hover:text-zinc-300 border border-zinc-800'
              }`}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
