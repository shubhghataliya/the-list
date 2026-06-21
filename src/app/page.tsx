'use client';

import { useState, useMemo } from 'react';
import { Category, ListData, ListItem } from '@/types';
import { CATEGORIES, INITIAL_DATA, generateId, getTotalCount } from '@/utils/helpers';
import useLocalStorage from '@/hooks/useLocalStorage';

import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import CategoryCard from '@/components/CategoryCard';
import CategoryDetail from '@/components/CategoryDetail';
import AddModal from '@/components/AddModal';
import FAB from '@/components/FAB';
import ImportExport from '@/components/ImportExport';
import TextImportModal from '@/components/TextImportModal';
import EmptyState from '@/components/EmptyState';

type View = 'home' | Category;

export default function Home() {
  const [data, setData] = useLocalStorage<ListData>('the-list-data', INITIAL_DATA);
  const [view, setView] = useState<View>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilter, setSearchFilter] = useState<Category | 'all'>('all');
  const [showAdd, setShowAdd] = useState(false);
  const [showTextImport, setShowTextImport] = useState(false);

  const totalCount = useMemo(() => getTotalCount(data), [data]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (!val) setSearchFilter('all');
  };

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return null;
    const cats = searchFilter === 'all' ? CATEGORIES : CATEGORIES.filter((c) => c.id === searchFilter);
    const results: ListItem[] = [];
    cats.forEach((cat) => {
      data[cat.id].forEach((item) => {
        if (item.title.toLowerCase().includes(query)) results.push(item);
      });
    });
    return results;
  }, [data, searchQuery, searchFilter]);

  const handleAdd = (title: string, category: Category) => {
    const newItem: ListItem = {
      id: generateId(),
      title,
      category,
      addedAt: Date.now(),
    };
    setData((prev) => ({
      ...prev,
      [category]: [newItem, ...prev[category]],
    }));
  };

  const handleUpdateItems = (category: Category, items: ListItem[]) => {
    setData((prev) => ({ ...prev, [category]: items }));
  };

  const handleExport = () => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `the-list-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (importedData: ListData) => setData(importedData);

  const handleTextImport = (titles: string[], category: Category) => {
    const now = Date.now();
    const newItems: ListItem[] = titles.map((title, i) => ({
      id: generateId() + i,
      title,
      category,
      addedAt: now + i,
    }));
    setData((prev) => ({ ...prev, [category]: [...newItems, ...prev[category]] }));
  };

  const defaultAddCategory: Category = view === 'home' ? 'movies' : (view as Category);
  const isSearching = searchQuery.trim().length > 0;

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* ── Centered container ── */}
      <div className="max-w-3xl mx-auto px-4 py-6 pb-28">

        {view === 'home' ? (
          /* ══════════════════════════════════
             HOME VIEW
             ══════════════════════════════════ */
          <>
            <Header totalCount={totalCount} />

            <SearchBar
              value={searchQuery}
              onChange={handleSearchChange}
              filterCategory={searchFilter}
              onFilterChange={setSearchFilter}
            />

            {isSearching ? (
              /* Search results */
              <div className="animate-fade-in">
                <p className="text-zinc-500 text-xs mb-4">
                  <span className="text-zinc-300 font-semibold">{searchResults?.length ?? 0}</span>{' '}
                  {searchResults?.length === 1 ? 'result' : 'results'} for &ldquo;{searchQuery.trim()}&rdquo;
                </p>

                {searchResults?.length === 0 ? (
                  <EmptyState message="No results found" subMessage="Try a different search term or filter" icon="🔍" />
                ) : (
                  <div className="space-y-5">
                    {CATEGORIES.map((cat) => {
                      const catResults = searchResults?.filter((i) => i.category === cat.id) ?? [];
                      if (catResults.length === 0) return null;
                      return (
                        <div key={cat.id}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm">{cat.icon}</span>
                            <span className={`text-xs font-semibold uppercase tracking-wider ${cat.textColorClass}`}>
                              {cat.label}
                            </span>
                            <span className="text-zinc-700 text-xs">({catResults.length})</span>
                          </div>
                          <div className="space-y-2">
                            {catResults.map((item, i) => (
                              <div
                                key={item.id}
                                className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 flex items-center gap-3 animate-fade-in"
                              >
                                <span className="text-zinc-600 text-xs tabular-nums w-6 text-right flex-shrink-0 font-mono">
                                  {i + 1}.
                                </span>
                                <span className="text-zinc-100 text-sm font-medium truncate">{item.title}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              /* Category grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CATEGORIES.map((cat) => (
                  <CategoryCard
                    key={cat.id}
                    config={cat}
                    items={data[cat.id]}
                    onClick={() => setView(cat.id)}
                  />
                ))}
              </div>
            )}

            <ImportExport
              data={data}
              onImport={handleImport}
              onExport={handleExport}
              onTextImport={() => setShowTextImport(true)}
            />
          </>
        ) : (
          /* ══════════════════════════════════
             CATEGORY DETAIL VIEW
             ══════════════════════════════════ */
          <CategoryDetail
            category={view as Category}
            items={data[view as Category]}
            onBack={() => setView('home')}
            onUpdateItems={handleUpdateItems}
          />
        )}
      </div>

      {/* Floating add button */}
      <FAB onClick={() => setShowAdd(true)} />

      {/* Modals */}
      {showAdd && (
        <AddModal
          defaultCategory={defaultAddCategory}
          onAdd={handleAdd}
          onClose={() => setShowAdd(false)}
        />
      )}

      {showTextImport && (
        <TextImportModal
          activeCategory="tv-series"
          onImport={handleTextImport}
          onClose={() => setShowTextImport(false)}
        />
      )}
    </main>
  );
}
