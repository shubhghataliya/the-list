'use client';

import { useState, useRef, useEffect } from 'react';
import { Menu, X, Database, FolderPlus, User, LogOut, Calendar } from 'lucide-react';

interface BurgerMenuProps {
  onDataClick: () => void;
  onNewCategoryClick: () => void;
  onProfileClick: () => void;
}

export default function BurgerMenu({ onDataClick, onNewCategoryClick, onProfileClick }: BurgerMenuProps) {
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
        <div className="absolute right-0 top-full mt-2 w-52 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden z-50 animate-scale-in origin-top-right">
          <button
            onClick={() => handle(onProfileClick)}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
          >
            <User className="w-4 h-4 text-sky-400 flex-shrink-0" />
            <span className="font-medium">Profile</span>
          </button>
          <div className="h-px bg-zinc-800" />
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

/* ── Profile Sheet ── */
interface ProfileSheetProps {
  email: string;
  createdAt: string | null;
  totalItems: number;
  onSignOut: () => void;
  onClose: () => void;
}

export function ProfileSheet({ email, createdAt, totalItems, onSignOut, onClose }: ProfileSheetProps) {
  const initial = email.charAt(0).toUpperCase();
  const joined = createdAt
    ? new Date(createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}>
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-xs shadow-2xl animate-slide-up sm:animate-scale-in space-y-5"
        onClick={(e) => e.stopPropagation()}>

        {/* Avatar + email */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-sky-500 flex items-center justify-center">
            <span className="text-white text-2xl font-bold">{initial}</span>
          </div>
          <div className="text-center">
            <p className="text-zinc-100 font-semibold text-sm break-all">{email}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-zinc-950 rounded-xl p-3 text-center">
            <p className="text-zinc-100 font-bold text-xl tabular-nums">{totalItems}</p>
            <p className="text-zinc-500 text-[11px] mt-0.5">titles saved</p>
          </div>
          <div className="bg-zinc-950 rounded-xl p-3 text-center">
            <Calendar className="w-4 h-4 text-zinc-600 mx-auto mb-1" />
            <p className="text-zinc-400 text-[11px]">{joined ?? '—'}</p>
          </div>
        </div>

        {/* Sign out */}
        <button
          onClick={onSignOut}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-zinc-800 hover:bg-red-500/10 hover:text-red-400 text-zinc-400 text-sm font-medium transition-all border border-zinc-700 hover:border-red-500/30"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}
