'use client';

import { useState, useEffect } from 'react';
import { CategoryConfig } from '@/types';
import { buildCustomCategoryConfig } from '@/utils/helpers';

const STORAGE_KEY = 'the-list-custom-categories';

export function useCustomCategories() {
  const [customCategories, setCustomCategories] = useState<CategoryConfig[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setCustomCategories(JSON.parse(stored));
    } catch {}
  }, []);

  const addCustomCategory = (name: string, type: 'movies' | 'series') => {
    const config = buildCustomCategoryConfig(name, type, customCategories.length);
    const updated = [...customCategories, config];
    setCustomCategories(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
    return config;
  };

  return { customCategories, addCustomCategory };
}
