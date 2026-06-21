'use client';

import { useState, useMemo } from 'react';
import { LogOut, Loader2 } from 'lucide-react';
import { Category, ListData, ListItem } from '@/types';
import { CATEGORIES, getTotalCount } from '@/utils/helpers';
import { useAuth } from '@/hooks/useAuth';
import { useListData } from '@/hooks/useListData';

import AuthGate from '@/components/AuthGate';
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
  const { session, loading: authLoading, signOut } = useAuth();
  const userId = session?.user?.id;

  const { data, loading: dataLoading, addItem, addBulk, updateCategory, deleteItem, importAll } =
    useListData(userId);

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

  const defaultAddCategory: Category = view === 'home' ? 'movies' : (view as Category);
  const isSearching = searchQuery.trim().length > 0;

  /* ── Loading / Auth gates ── */
  if (authLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
      </div>
    );
  }

  if (!session) return <AuthGate />;

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-3xl mx-auto px-4 py-6 pb-28">

        {view === 'home' ? (
          /* ══════════════ HOME ══════════════ */
          <>
            {/* Header + sign out */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-zinc-100 tracking-tight leading-none">The List</h1>
                <p className="text-zinc-500 text-xs mt-1">Your personal watched library</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-violet-500/10 border border-violet-500/20 rounded-full px-3 py-1.5">
                  <span className="text-violet-300 font-bold text-sm tabular-nums">{totalCount}</span>
                  <span className="text-zinc-500 text-xs">titles</span>
                </div>
                <button
                  onClick={signOut}
                  className="p-2 text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 rounded-xl transition-all"
                  aria-label="Sign out"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>

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
                  <EmptyState message="No results found" subMessage="Try a different term or filter" icon="🔍" />
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
                          <div className="space-y-1.5">
                            {catResults.map((item, i) => (
                              <div key={item.id} className="flex items-baseline gap-3 py-2 border-b border-zinc-800/50 last:border-0 px-1">
                                <span className="text-zinc-600 text-xs tabular-nums font-mono w-6 text-right flex-shrink-0">{i + 1}.</span>
                                <span className="text-zinc-200 text-sm">{item.title}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : dataLoading ? (
              /* Data loading */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 h-36 animate-pulse" />
                ))}
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
              onImport={importAll}
              onExport={handleExport}
              onTextImport={() => setShowTextImport(true)}
            />
          </>
        ) : (
          /* ══════════════ CATEGORY DETAIL ══════════════ */
          <CategoryDetail
            category={view as Category}
            items={data[view as Category]}
            onBack={() => setView('home')}
            onUpdateItems={updateCategory}
            onDeleteItem={deleteItem}
          />
        )}
      </div>

      <FAB onClick={() => setShowAdd(true)} />

      {showAdd && (
        <AddModal
          defaultCategory={defaultAddCategory}
          onAdd={(title, category) => addItem(title, category)}
          onClose={() => setShowAdd(false)}
        />
      )}

      {showTextImport && (
        <TextImportModal
          activeCategory="tv-series"
          onImport={addBulk}
          onClose={() => setShowTextImport(false)}
        />
      )}
    </main>
  );
}
