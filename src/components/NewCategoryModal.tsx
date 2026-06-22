'use client';

import { useState } from 'react';
import { X, Film, Tv } from 'lucide-react';

interface NewCategoryModalProps {
  onAdd: (name: string, type: 'movies' | 'series') => void;
  onClose: () => void;
}

export default function NewCategoryModal({ onAdd, onClose }: NewCategoryModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'movies' | 'series'>('series');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onAdd(trimmed, type);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 w-full max-w-sm shadow-2xl animate-slide-up sm:animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-zinc-100 font-semibold">New Category</h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="text-zinc-500 text-xs font-medium block mb-1.5">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Bollywood, Thai Drama..."
              autoFocus
              maxLength={32}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all text-sm"
            />
          </div>

          {/* Type */}
          <div>
            <label className="text-zinc-500 text-xs font-medium block mb-1.5">Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('movies')}
                className={`flex flex-col items-center gap-2 px-4 py-4 rounded-xl border text-sm font-medium transition-all duration-150 ${
                  type === 'movies'
                    ? 'bg-blue-500/10 border-blue-500/40 text-blue-300'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
                }`}
              >
                <Film className={`w-5 h-5 ${type === 'movies' ? 'text-blue-400' : 'text-zinc-600'}`} />
                <span>Movies</span>
                <span className="text-[10px] font-normal opacity-60">Films, documentaries</span>
              </button>
              <button
                type="button"
                onClick={() => setType('series')}
                className={`flex flex-col items-center gap-2 px-4 py-4 rounded-xl border text-sm font-medium transition-all duration-150 ${
                  type === 'series'
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
                }`}
              >
                <Tv className={`w-5 h-5 ${type === 'series' ? 'text-emerald-400' : 'text-zinc-600'}`} />
                <span>Series</span>
                <span className="text-[10px] font-normal opacity-60">Shows, dramas, anime</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl py-3 font-semibold text-sm transition-all active:scale-[0.98]"
          >
            Create Category
          </button>
        </form>
      </div>
    </div>
  );
}
