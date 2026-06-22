'use client';

import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { Category, CategoryConfig } from '@/types';

interface AddModalProps {
  defaultCategory: Category;
  categories: CategoryConfig[];
  onAdd: (title: string, category: Category) => void;
  onClose: () => void;
}

export default function AddModal({ defaultCategory, categories, onAdd, onClose }: AddModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>(defaultCategory);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    onAdd(trimmed, category);
    onClose();
  };

  const selectedConfig = categories.find((c) => c.id === category);

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 w-full max-w-md shadow-2xl animate-slide-up sm:animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-zinc-100 font-semibold">Add Title</h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter title..."
            autoFocus
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all text-sm"
          />

          <div>
            <p className="text-zinc-500 text-xs mb-2 font-medium">Add to category</p>
            <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all duration-150 ${
                    category === cat.id
                      ? `${cat.bgClass} ${cat.borderClass} ${cat.textColorClass}`
                      : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  <span className="text-base leading-none">{cat.icon}</span>
                  <span className="truncate">{cat.label}</span>
                  {category === cat.id && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!title.trim()}
            className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl py-3 font-semibold text-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Add to {selectedConfig?.label ?? category}
          </button>
        </form>
      </div>
    </div>
  );
}
