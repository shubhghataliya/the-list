'use client';

import { useRef } from 'react';
import { Download, Upload, List, AlignLeft } from 'lucide-react';
import { CategoryConfig, ListData } from '@/types';
import { INITIAL_DATA } from '@/utils/helpers';

interface ImportExportProps {
  data: ListData;
  allCategories: CategoryConfig[];
  onImport: (data: ListData) => void;
  onExport: () => void;
  onExportList: () => void;
  onTextImport: () => void;
}

export default function ImportExport({ data, onImport, onExport, onExportList, onTextImport }: ImportExportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const validated: ListData = { ...INITIAL_DATA };

        for (const key of Object.keys(INITIAL_DATA) as (keyof ListData)[]) {
          if (Array.isArray(parsed[key])) {
            validated[key] = (parsed[key] as unknown[]).filter(
              (item): item is import('@/types').ListItem =>
                typeof item === 'object' &&
                item !== null &&
                'id' in item &&
                'title' in item &&
                'category' in item &&
                'addedAt' in item
            );
          }
        }

        onImport(validated);
      } catch {
        alert('Invalid file. Please select a valid The List export (.json).');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="mt-8 pt-5 border-t border-zinc-800/60">
      <p className="text-zinc-600 text-xs mb-3 text-center uppercase tracking-wider font-medium">
        Data
      </p>
      <div className="flex gap-2 mb-2">
        <button
          onClick={onExport}
          className="flex-1 flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 rounded-xl py-2.5 text-sm font-medium transition-all duration-200 active:scale-[0.98]"
        >
          <Download className="w-4 h-4" />
          Export JSON
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 rounded-xl py-2.5 text-sm font-medium transition-all duration-200 active:scale-[0.98]"
        >
          <Upload className="w-4 h-4" />
          Import JSON
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileChange}
          className="hidden"
          aria-label="Import JSON file"
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={onExportList}
          className="flex-1 flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 rounded-xl py-2.5 text-sm font-medium transition-all duration-200 active:scale-[0.98]"
        >
          <AlignLeft className="w-4 h-4" />
          Export List
        </button>
        <button
          onClick={onTextImport}
          className="flex-1 flex items-center justify-center gap-2 bg-violet-500/10 hover:bg-violet-500/15 border border-violet-500/20 hover:border-violet-500/30 text-violet-400 hover:text-violet-300 rounded-xl py-2.5 text-sm font-medium transition-all duration-200 active:scale-[0.98]"
        >
          <List className="w-4 h-4" />
          Import List
        </button>
      </div>
    </div>
  );
}
