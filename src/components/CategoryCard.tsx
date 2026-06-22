'use client';

import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import { ListItem, CategoryConfig } from '@/types';

const TMDB_IMG = 'https://image.tmdb.org/t/p/w185';
const PREVIEW = 4;

interface CategoryCardProps {
  config: CategoryConfig;
  items: ListItem[];
  onClick: () => void;
}

export default function CategoryCard({ config, items, onClick }: CategoryCardProps) {
  const sorted = [...items].sort((a, b) => b.addedAt - a.addedAt);
  const preview = sorted.slice(0, PREVIEW);
  const remaining = items.length - PREVIEW;
  const posterItems = preview.filter((i) => i.posterPath);
  const showPosters = posterItems.length >= 2;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-4 transition-all duration-200 hover:bg-zinc-800/60 active:scale-[0.98] group flex flex-col"
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

      {/* Content preview */}
      {items.length === 0 ? (
        <p className="text-zinc-700 text-xs italic">Nothing added yet</p>
      ) : showPosters ? (
        /* Poster strip */
        <div className="flex gap-1.5 items-end">
          {posterItems.slice(0, 4).map((item) => (
            <div key={item.id} className="relative flex-shrink-0">
              <Image
                src={`${TMDB_IMG}${item.posterPath}`}
                alt={item.title}
                width={48}
                height={72}
                className="rounded-lg object-cover"
              />
            </div>
          ))}
          {remaining > 0 && (
            <div className="w-12 h-[72px] rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0">
              <span className="text-zinc-500 text-[10px] font-semibold">+{remaining}</span>
            </div>
          )}
        </div>
      ) : (
        /* Text list */
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
