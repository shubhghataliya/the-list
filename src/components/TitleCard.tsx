'use client';

import { Trash2 } from 'lucide-react';
import { ListItem } from '@/types';
import { getCategoryConfig } from '@/utils/helpers';

interface TitleCardProps {
  item: ListItem;
  onDelete: () => void;
  index?: number;
  showCategory?: boolean;
}

export default function TitleCard({ item, onDelete, index, showCategory = false }: TitleCardProps) {
  const catConfig = getCategoryConfig(item.category);

  return (
    <div className="group bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl px-4 py-3 flex items-center justify-between transition-all duration-200 animate-fade-in">
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        {index !== undefined && (
          <span className="text-zinc-600 text-xs font-mono tabular-nums flex-shrink-0 w-6 text-right">
            {index}.
          </span>
        )}
        {showCategory && (
          <span
            className={`text-[9px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-widest flex-shrink-0 ${catConfig.badgeClass}`}
          >
            {catConfig.shortLabel}
          </span>
        )}
        <span className="text-zinc-100 text-sm font-medium truncate leading-snug">
          {item.title}
        </span>
      </div>
      <button
        onClick={onDelete}
        className="flex-shrink-0 ml-3 p-1.5 rounded-lg text-zinc-700 hover:text-red-400 hover:bg-red-400/10 transition-all duration-150 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 active:scale-95"
        aria-label={`Delete ${item.title}`}
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
