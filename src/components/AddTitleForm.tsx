'use client';

import { useState, useRef } from 'react';
import { Plus } from 'lucide-react';
import { Category } from '@/types';
import { CATEGORIES } from '@/utils/helpers';

interface AddTitleFormProps {
  activeCategory: Category;
  onAdd: (title: string) => void;
}

export default function AddTitleForm({ activeCategory, onAdd }: AddTitleFormProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const catConfig = CATEGORIES.find((c) => c.id === activeCategory)!;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setValue('');
    inputRef.current?.focus();
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-5">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={`Add to ${catConfig.label}...`}
        className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all text-sm min-w-0"
      />
      <button
        type="submit"
        disabled={!value.trim()}
        className="bg-violet-600 hover:bg-violet-500 active:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl px-4 py-2.5 flex items-center gap-1.5 font-medium text-sm transition-all duration-150 flex-shrink-0 select-none"
      >
        <Plus className="w-4 h-4" />
        <span>Add</span>
      </button>
    </form>
  );
}
