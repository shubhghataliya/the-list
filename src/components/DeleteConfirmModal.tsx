'use client';

import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmModalProps {
  title: string;
  heading?: string;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmModal({
  title,
  heading = 'Remove title?',
  message,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onCancel}
    >
      <div
        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <h2 className="text-zinc-100 font-semibold text-base">{heading}</h2>
        </div>

        <p className="text-zinc-400 text-sm mb-5 pl-12 leading-relaxed">
          {message ?? <><span className="text-zinc-200 font-medium">&ldquo;{title}&rdquo;</span> will be removed from your list. This cannot be undone.</>}
        </p>

        <div className="flex gap-2.5">
          <button
            onClick={onCancel}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl py-2.5 font-medium text-sm transition-colors active:scale-[0.98]"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/25 rounded-xl py-2.5 font-medium text-sm transition-all active:scale-[0.98]"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
