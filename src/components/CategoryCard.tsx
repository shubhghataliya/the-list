'use client';

import { ChevronRight } from 'lucide-react';
import { ListItem } from '@/types';
import { CategoryConfig } from '@/types';

interface CategoryCardProps {
  config: CategoryConfig;
  items: ListItem[];
  onClick: () => void;
}

const PREVIEW = 4;

export default function CategoryCard({ config, items, onClick }: CategoryCardProps) {
  const preview = items.slice(0, PREVIEW);
  const remaining = items.length - PREVIEW;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-4 transition-all duration-200 hover:bg-zinc-800/60 active:scale-[0.98] group flex flex-col`}
    >
      {/* Card header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-10 h-10 rounded-xl ${config.bgClass} border ${config.borderClass} flex items-center justify-center flex-shrink-0`}>
            <span className="text-xl leading-none">{config.icon}</span>
          </div>
          <div className="min-w-0">
            <h3 className={`font-semibold text-sm leading-tight ${config.textColorClass}`}>
              {config.label}
            </h3>
            <p className="text-zinc-500 text-xs mt-0.5">
              {items.length === 0 ? 'Empty' : `${items.length} title${items.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors flex-shrink-0 mt-0.5" />
      </div>

      {/* Preview list */}
      {items.length === 0 ? (
        <p className="text-zinc-700 text-xs italic">Nothing added yet</p>
      ) : (
        <div className="space-y-1.5 min-w-0">
          {preview.map((item, i) => (
            <div key={item.id} className="flex items-baseline gap-1.5 min-w-0">
              <span className="text-zinc-700 text-[10px] tabular-nums flex-shrink-0 w-4 text-right leading-none">
                {i + 1}.
              </span>
              <span className="text-zinc-400 text-xs truncate leading-tight">{item.title}</span>
            </div>
          ))}
          {remaining > 0 && (
            <p className="text-zinc-600 text-[10px] pl-5">+{remaining} more</p>
          )}
        </div>
      )}
    </button>
  );
}
