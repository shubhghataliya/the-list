'use client';

import { useState, useMemo } from 'react';
import { X, FileText, Check } from 'lucide-react';
import { Category } from '@/types';
import { CATEGORIES } from '@/utils/helpers';

interface TextImportModalProps {
  activeCategory: Category;
  onImport: (titles: string[], category: Category) => void;
  onClose: () => void;
}

function parseTextList(raw: string): string[] {
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      const match = line.match(/^\d+[.)]\s*(.+)$/);
      return match ? match[1].trim() : line;
    })
    .filter((title) => title.length > 0);
}

export default function TextImportModal({
  activeCategory,
  onImport,
  onClose,
}: TextImportModalProps) {
  const [text, setText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>(activeCategory);

  const parsedTitles = useMemo(() => parseTextList(text), [text]);

  const handleImport = () => {
    if (parsedTitles.length === 0) return;
    onImport(parsedTitles, selectedCategory);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 w-full max-w-md shadow-2xl animate-slide-up sm:animate-scale-in flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <FileText className="w-3.5 h-3.5 text-violet-400" />
            </div>
            <h2 className="text-zinc-100 font-semibold text-sm">Import from Text</h2>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 transition-colors p-1.5 rounded-lg hover:bg-zinc-800"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-zinc-500 text-xs leading-relaxed -mt-1">
          Paste a numbered list — numbers and dots are stripped automatically.
        </p>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={"104.High School of Dead\n105.Ishura (S1)\n106.Clevatess"}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 text-sm font-mono resize-none h-36 leading-relaxed"
          autoFocus
        />

        {parsedTitles.length > 0 && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 max-h-36 overflow-y-auto">
            <p className="text-zinc-500 text-[10px] uppercase tracking-wider mb-2 font-semibold">
              {parsedTitles.length} title{parsedTitles.length !== 1 ? 's' : ''} detected
            </p>
            <div className="space-y-1.5">
              {parsedTitles.map((title, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Check className="w-3 h-3 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span className="text-zinc-300 text-xs leading-snug">{title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="text-zinc-500 text-[10px] uppercase tracking-wider mb-2 font-semibold">
            Add to
          </p>
          <div className="grid grid-cols-4 gap-1.5 bg-zinc-950 p-1.5 rounded-xl border border-zinc-800">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex flex-col items-center py-2 px-1 rounded-lg text-xs transition-all duration-150 ${
                  selectedCategory === cat.id
                    ? cat.tabActiveClass
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/70'
                }`}
              >
                <span className="text-base leading-none">{cat.icon}</span>
                <span className="mt-1 text-[10px] font-medium leading-none">{cat.shortLabel}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2.5">
          <button
            onClick={onClose}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl py-2.5 font-medium text-sm transition-colors active:scale-[0.98]"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={parsedTitles.length === 0}
            className="flex-1 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl py-2.5 font-medium text-sm transition-all active:scale-[0.98]"
          >
            {parsedTitles.length > 0 ? `Import ${parsedTitles.length} titles` : 'Import'}
          </button>
        </div>
      </div>
    </div>
  );
}
