'use client';

import { ArrowDownUp, ArrowUpAZ, ArrowDownAZ, Clock, History } from 'lucide-react';

export type SortOption = 'newest' | 'oldest' | 'a-z' | 'z-a';

interface SortBarProps {
  count: number;
  label: string;
  sortBy: SortOption;
  onChange: (sort: SortOption) => void;
}

const OPTIONS: { id: SortOption; label: string; icon: React.ReactNode }[] = [
  { id: 'newest', label: 'Newest', icon: <Clock className="w-3 h-3" /> },
  { id: 'oldest', label: 'Oldest', icon: <History className="w-3 h-3" /> },
  { id: 'a-z',    label: 'A–Z',    icon: <ArrowUpAZ className="w-3 h-3" /> },
  { id: 'z-a',    label: 'Z–A',    icon: <ArrowDownAZ className="w-3 h-3" /> },
];

export default function SortBar({ count, label, sortBy, onChange }: SortBarProps) {
  return (
    <div className="flex items-center justify-between mb-3">
      <span className="text-zinc-500 text-xs">
        <span className="text-zinc-300 font-semibold tabular-nums">{count}</span>{' '}
        {label}
      </span>
      <div className="flex items-center gap-1">
        <ArrowDownUp className="w-3 h-3 text-zinc-600 mr-0.5" />
        {OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-all duration-150 ${
              sortBy === opt.id
                ? 'bg-violet-500/20 text-violet-300 ring-1 ring-inset ring-violet-500/30'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            {opt.icon}
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
