'use client';

import { Plus } from 'lucide-react';

interface FABProps {
  onClick: () => void;
}

export default function FAB({ onClick }: FABProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 w-14 h-14 bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white rounded-full shadow-lg shadow-violet-900/40 flex items-center justify-center transition-all duration-150 active:scale-95 z-40 hover:shadow-violet-800/50 hover:shadow-xl"
      aria-label="Add title"
    >
      <Plus className="w-6 h-6" strokeWidth={2.5} />
    </button>
  );
}
