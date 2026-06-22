'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'the-list-starred';

export function useStarred() {
  const [starred, setStarred] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setStarred(new Set(JSON.parse(stored) as string[]));
    } catch {}
  }, []);

  const toggleStar = (id: string) => {
    setStarred((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next))); } catch {}
      return next;
    });
  };

  return { starred, toggleStar };
}
