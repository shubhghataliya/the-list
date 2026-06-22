'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowUpDown, Clock, History, ArrowUpAZ, ArrowDownAZ, ChevronDown } from 'lucide-react';

export type SortOption = 'newest' | 'oldest' | 'a-z' | 'z-a';

interface SortBarProps {
  count: number;
  label: string;
  sortBy: SortOption;
  onChange: (sort: SortOption) => void;
}

const OPTIONS: { id: SortOption; label: string; icon: React.ReactNode }[] = [
  { id: 'newest', label: 'Newest first', icon: <Clock className="w-3.5 h-3.5" /> },
  { id: 'oldest', label: 'Oldest first', icon: <History className="w-3.5 h-3.5" /> },
  { id: 'a-z',   label: 'A – Z',        icon: <ArrowUpAZ className="w-3.5 h-3.5" /> },
  { id: 'z-a',   label: 'Z – A',        icon: <ArrowDownAZ className="w-3.5 h-3.5" /> },
];

export default function SortBar({ count, label, sortBy, onChange }: SortBarProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = OPTIONS.find((o) => o.id === sortBy)!;

  return (
    <div className="flex items-center justify-between mb-3 flex-1">
      <span className="text-zinc-500 text-xs">
        <span className="text-zinc-300 font-semibold tabular-nums">{count}</span>{' '}
        {label}
      </span>

      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 text-xs font-medium transition-all"
        >
          <ArrowUpDown className="w-3 h-3 text-zinc-500" />
          {current.label}
          <ChevronDown className={`w-3 h-3 text-zinc-500 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-1.5 w-36 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl shadow-black/60 overflow-hidden z-30 animate-scale-in origin-top-right">
            {OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => { onChange(opt.id); setOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs transition-colors
                  ${sortBy === opt.id
                    ? 'bg-violet-500/15 text-violet-300'
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'}`}
              >
                {opt.icon}
                {opt.label}
                {sortBy === opt.id && <span className="ml-auto text-violet-400">✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
