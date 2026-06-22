'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Category, ListData, ListItem } from '@/types';
import { INITIAL_DATA, generateId } from '@/utils/helpers';

interface DbRow {
  id: string;
  user_id: string;
  title: string;
  category: string;
  added_at: number;
  position: number | null;
  poster_path: string | null;
}

function toListItem(row: DbRow): ListItem {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    addedAt: row.added_at,
    posterPath: row.poster_path ?? undefined,
  };
}

function buildData(rows: DbRow[]): ListData {
  const data: ListData = { ...INITIAL_DATA };

  const sorted = [...rows].sort((a, b) => {
    if (a.position === null && b.position === null) return b.added_at - a.added_at;
    if (a.position === null) return -1;
    if (b.position === null) return 1;
    return a.position - b.position;
  });

  sorted.forEach((row) => {
    if (!data[row.category]) data[row.category] = [];
    data[row.category].push(toListItem(row));
  });

  return data;
}

export function useListData(userId: string | undefined) {
  const [data, setData] = useState<ListData>(INITIAL_DATA);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!userId) { setData(INITIAL_DATA); setLoading(false); return; }
    const { data: rows, error } = await supabase
      .from('list_items')
      .select('*')
      .eq('user_id', userId);
    if (!error && rows) setData(buildData(rows as DbRow[]));
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchData();
    if (!userId) return;

    const channel = supabase
      .channel(`list-${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'list_items', filter: `user_id=eq.${userId}` }, fetchData)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId, fetchData]);

  const addItem = useCallback(async (title: string, category: Category, posterPath?: string) => {
    const item: ListItem = { id: generateId(), title, category, addedAt: Date.now(), posterPath };
    setData((prev) => ({ ...prev, [category]: [item, ...(prev[category] ?? [])] }));
    await supabase.from('list_items').insert({
      id: item.id, user_id: userId, title, category, added_at: item.addedAt,
      position: null, poster_path: posterPath ?? null,
    });
  }, [userId]);

  const addBulk = useCallback(async (entries: Array<{ title: string; posterPath?: string }>, category: Category) => {
    const now = Date.now();
    const items: ListItem[] = entries.map((e, i) => ({
      id: generateId(), title: e.title, category, addedAt: now + i, posterPath: e.posterPath,
    }));
    setData((prev) => ({ ...prev, [category]: [...items, ...(prev[category] ?? [])] }));
    await supabase.from('list_items').insert(
      items.map((item) => ({ id: item.id, user_id: userId, title: item.title, category, added_at: item.addedAt, position: null, poster_path: item.posterPath ?? null }))
    );
  }, [userId]);

  const updateCategory = useCallback(async (category: Category, items: ListItem[]) => {
    setData((prev) => ({ ...prev, [category]: items }));
    await supabase.from('list_items').delete().eq('user_id', userId).eq('category', category);
    if (items.length > 0) {
      await supabase.from('list_items').insert(
        items.map((item, i) => ({
          id: item.id, user_id: userId, title: item.title, category,
          added_at: item.addedAt, position: i, poster_path: item.posterPath ?? null,
        }))
      );
    }
  }, [userId]);

  const updatePoster = useCallback(async (id: string, posterPath: string) => {
    setData((prev) => {
      const next = { ...prev };
      for (const cat of Object.keys(next)) {
        const idx = next[cat].findIndex((i) => i.id === id);
        if (idx !== -1) {
          next[cat] = [...next[cat]];
          next[cat][idx] = { ...next[cat][idx], posterPath };
          break;
        }
      }
      return next;
    });
    await supabase.from('list_items').update({ poster_path: posterPath }).eq('id', id);
  }, []);

  const deleteItem = useCallback(async (id: string, category: Category) => {
    setData((prev) => ({ ...prev, [category]: (prev[category] ?? []).filter((i) => i.id !== id) }));
    await supabase.from('list_items').delete().eq('id', id);
  }, []);

  const importAll = useCallback(async (importedData: ListData) => {
    setData(importedData);
    await supabase.from('list_items').delete().eq('user_id', userId);
    const all = Object.values(importedData).flat();
    if (all.length > 0) {
      await supabase.from('list_items').insert(
        all.map((item) => ({
          id: item.id, user_id: userId, title: item.title, category: item.category,
          added_at: item.addedAt, position: null, poster_path: item.posterPath ?? null,
        }))
      );
    }
  }, [userId]);

  return { data, loading, addItem, addBulk, updateCategory, deleteItem, updatePoster, importAll };
}
