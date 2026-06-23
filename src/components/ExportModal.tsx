'use client';

import { useState } from 'react';
import { X, FileJson, FileText, Download, Check } from 'lucide-react';
import { ListItem, CategoryConfig } from '@/types';

interface ExportModalProps {
  config: CategoryConfig;
  items: ListItem[];
  onClose: () => void;
}

type Format = 'json' | 'text';

export default function ExportModal({ config, items, onClose }: ExportModalProps) {
  const [format, setFormat] = useState<Format>('text');
  const [includeDate, setIncludeDate] = useState(false);
  const [includePoster, setIncludePoster] = useState(true);

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });

  const exportItems = [...items].sort((a, b) => a.addedAt - b.addedAt);

  const download = () => {
    let content = '';
    let filename = '';
    let mime = '';

    if (format === 'text') {
      const lines: string[] = [config.label.toUpperCase(), '', ''];
      exportItems.forEach((item, i) => {
        let line = `${i + 1}.${item.title}`;
        if (includeDate) line += `  — ${formatDate(item.addedAt)}`;
        lines.push(line);
      });
      content = lines.join('\n');
      filename = `${config.label.toLowerCase().replace(/\s+/g, '-')}.txt`;
      mime = 'text/plain';
    } else {
      const data = exportItems.map((item) => {
        const obj: Record<string, unknown> = { title: item.title };
        if (includePoster && item.posterPath) obj.posterPath = item.posterPath;
        if (includeDate) obj.addedAt = formatDate(item.addedAt);
        return obj;
      });
      content = JSON.stringify({ category: config.label, items: data }, null, 2);
      filename = `${config.label.toLowerCase().replace(/\s+/g, '-')}.json`;
      mime = 'application/json';
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onClose();
  };

  const Checkbox = ({ checked, label, onChange }: { checked: boolean; label: string; onChange: () => void }) => (
    <button onClick={onChange}
      className="flex items-center gap-3 w-full py-2.5 px-3 rounded-xl hover:bg-zinc-800 transition-colors text-left">
      <div className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-all
        ${checked ? 'bg-violet-600 border-violet-600' : 'border-zinc-600 bg-zinc-900'}`}>
        {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
      </div>
      <span className="text-zinc-300 text-sm">{label}</span>
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}>
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm shadow-2xl animate-slide-up sm:animate-scale-in"
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-zinc-800">
          <div>
            <p className="text-zinc-100 font-semibold">Export {config.label}</p>
            <p className="text-zinc-500 text-xs mt-0.5">{items.length} titles</p>
          </div>
          <button onClick={onClose}
            className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Format selector */}
          <div>
            <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-2">Format</p>
            <div className="grid grid-cols-2 gap-2">
              {([
                { id: 'text' as Format, label: 'Text', icon: <FileText className="w-5 h-5" />, hint: '.txt' },
                { id: 'json' as Format, label: 'JSON', icon: <FileJson className="w-5 h-5" />, hint: '.json' },
              ]).map((f) => (
                <button key={f.id} onClick={() => setFormat(f.id)}
                  className={`flex flex-col items-center gap-2 py-4 rounded-xl border transition-all
                    ${format === f.id
                      ? 'bg-violet-500/10 border-violet-500/40 text-violet-300'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'}`}>
                  {f.icon}
                  <div className="text-center">
                    <p className="text-sm font-semibold leading-none">{f.label}</p>
                    <p className="text-[10px] mt-0.5 opacity-60">{f.hint}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Field options */}
          <div>
            <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-1">Include</p>
            <div className="rounded-xl overflow-hidden">
              <Checkbox checked label="Name" onChange={() => {}} />
              <Checkbox checked={includeDate} label="Date added" onChange={() => setIncludeDate((v) => !v)} />
              {format === 'json' && (
                <Checkbox checked={includePoster} label="Poster (for re-import)" onChange={() => setIncludePoster((v) => !v)} />
              )}
            </div>
          </div>

          {/* Preview — text only */}
          {format === 'text' && exportItems.length > 0 && (
            <div className="bg-zinc-950 rounded-xl p-3 border border-zinc-800">
              <p className="text-zinc-600 text-[10px] mb-2 uppercase tracking-wider">Preview</p>
              <pre className="text-zinc-400 text-[11px] leading-relaxed font-mono whitespace-pre-wrap line-clamp-6">
                {config.label.toUpperCase()}{'\n\n'}
                {exportItems.slice(0, 4).map((item, i) => {
                  let line = `${i + 1}.${item.title}`;
                  if (includeDate) line += `  — ${formatDate(item.addedAt)}`;
                  return line;
                }).join('\n')}
                {exportItems.length > 4 ? '\n…' : ''}
              </pre>
            </div>
          )}
        </div>

        {/* Download button */}
        <div className="px-5 pb-5">
          <button onClick={download}
            className="w-full flex items-center justify-center gap-2 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-semibold text-sm transition-all active:scale-[0.98]">
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
}
