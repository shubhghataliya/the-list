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
  const hasBgImage = !!config.bgImage;

  return (
    <button
      onClick={onClick}
      className={`relative w-full text-left rounded-2xl overflow-hidden transition-all duration-200 active:scale-[0.98] group flex flex-col min-h-[140px] ${
        hasBgImage ? 'border border-zinc-700/50' : `bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/60`
      }`}
    >
      {/* Background image + overlay */}
      {hasBgImage && (
        <>
          <img
            src={config.bgImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/40" />
        </>
      )}

      {/* Content */}
      <div className="relative z-10 p-4 flex flex-col h-full flex-1">
        {/* Card header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            {!hasBgImage && (
              <div className={`w-10 h-10 rounded-xl ${config.bgClass} border ${config.borderClass} flex items-center justify-center flex-shrink-0`}>
                <span className="text-xl leading-none">{config.icon}</span>
              </div>
            )}
            <div className="min-w-0">
              <h3 className={`font-bold text-sm leading-tight ${hasBgImage ? 'text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.9)]' : config.textColorClass}`}>
                {config.label}
              </h3>
              <p className={`text-xs mt-0.5 ${hasBgImage ? 'text-zinc-200 [text-shadow:0_1px_3px_rgba(0,0,0,0.9)]' : 'text-zinc-500'}`}>
                {items.length === 0 ? 'Empty' : `${items.length} title${items.length !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
          <ChevronRight className={`w-4 h-4 transition-colors flex-shrink-0 mt-0.5 ${hasBgImage ? 'text-white/60 group-hover:text-white' : 'text-zinc-600 group-hover:text-zinc-400'}`} />
        </div>

        {/* Content preview */}
        {items.length === 0 ? (
          <p className={`text-xs italic ${hasBgImage ? 'text-zinc-400' : 'text-zinc-700'}`}>Nothing added yet</p>
        ) : showPosters ? (
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
              <div className="w-12 h-[72px] rounded-lg bg-black/40 border border-white/10 flex items-center justify-center flex-shrink-0">
                <span className="text-white/60 text-[10px] font-semibold">+{remaining}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-1.5 min-w-0">
            {preview.map((item, i) => (
              <div key={item.id} className="flex items-baseline gap-1.5 min-w-0">
                <span className={`text-[10px] tabular-nums flex-shrink-0 w-4 text-right leading-none ${hasBgImage ? 'text-white/40' : 'text-zinc-700'}`}>
                  {i + 1}.
                </span>
                <span className={`text-xs truncate leading-tight ${hasBgImage ? 'text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.9)]' : 'text-zinc-400'}`}>{item.title}</span>
              </div>
            ))}
            {remaining > 0 && (
              <p className={`text-[10px] pl-5 ${hasBgImage ? 'text-white/40' : 'text-zinc-600'}`}>+{remaining} more</p>
            )}
          </div>
        )}
      </div>
    </button>
  );
}
