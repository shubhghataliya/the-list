'use client';

import { useState, useRef, useEffect } from 'react';
import { Menu, X, Database, FolderPlus } from 'lucide-react';

interface BurgerMenuProps {
  onDataClick: () => void;
  onNewCategoryClick: () => void;
}

export default function BurgerMenu({ onDataClick, onNewCategoryClick }: BurgerMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handle = (fn: () => void) => {
    setOpen(false);
    fn();
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-xl transition-all"
        aria-label="Menu"
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden z-50 animate-scale-in origin-top-right">
          <button
            onClick={() => handle(onDataClick)}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
          >
            <Database className="w-4 h-4 text-violet-400 flex-shrink-0" />
            <span className="font-medium">Data</span>
            <span className="ml-auto text-zinc-600 text-xs">Import / Export</span>
          </button>
          <div className="h-px bg-zinc-800" />
          <button
            onClick={() => handle(onNewCategoryClick)}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
          >
            <FolderPlus className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="font-medium">New Category</span>
          </button>
        </div>
      )}
    </div>
  );
}
