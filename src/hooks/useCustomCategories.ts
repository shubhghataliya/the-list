'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { CategoryConfig } from '@/types';
import { buildCustomCategoryConfig } from '@/utils/helpers';

interface DbCustomCategory {
  id: string;
  name: string;
  type: 'movies' | 'series';
  palette_index: number;
}

export function useCustomCategories(userId: string | undefined) {
  const [customCategories, setCustomCategories] = useState<CategoryConfig[]>([]);

  const fetchCategories = useCallback(async () => {
    if (!userId) { setCustomCategories([]); return; }
    const { data, error } = await supabase
      .from('custom_categories')
      .select('id, name, type, palette_index')
      .eq('user_id', userId)
      .order('created_at');
    if (!error && data) {
      setCustomCategories(
        (data as DbCustomCategory[]).map((row) =>
          buildCustomCategoryConfig(row.name, row.type, row.palette_index, row.id)
        )
      );
    }
  }, [userId]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const addCustomCategory = useCallback(async (name: string, type: 'movies' | 'series') => {
    if (!userId) return;
    const paletteIndex = customCategories.length;
    const config = buildCustomCategoryConfig(name, type, paletteIndex);
    setCustomCategories((prev) => [...prev, config]);
    await supabase.from('custom_categories').insert({
      id: config.id, user_id: userId, name, type, palette_index: paletteIndex,
    });
  }, [userId, customCategories.length]);

  const renameCustomCategory = useCallback(async (id: string, newLabel: string) => {
    setCustomCategories((prev) =>
      prev.map((c) => c.id === id
        ? { ...c, label: newLabel, shortLabel: newLabel.length > 8 ? newLabel.slice(0, 8) : newLabel }
        : c)
    );
    await supabase.from('custom_categories').update({ name: newLabel }).eq('id', id);
  }, []);

  const deleteCustomCategory = useCallback(async (id: string) => {
    setCustomCategories((prev) => prev.filter((c) => c.id !== id));
    await supabase.from('custom_categories').delete().eq('id', id);
    await supabase.from('list_items').delete().eq('user_id', userId).eq('category', id);
  }, [userId]);

  return { customCategories, addCustomCategory, renameCustomCategory, deleteCustomCategory };
}
