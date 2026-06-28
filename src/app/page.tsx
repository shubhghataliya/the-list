'use client';

import { useState, useMemo, useEffect } from 'react';
import { Loader2, Film } from 'lucide-react';
import { Category, ListItem } from '@/types';
import { CATEGORIES, getTotalCount, getTypeCount } from '@/utils/helpers';
import { getRank, getNextRank, RANKS } from '@/utils/ranks';
import { useAuth } from '@/hooks/useAuth';
import { useListData } from '@/hooks/useListData';
import { useCustomCategories } from '@/hooks/useCustomCategories';

import AuthGate from '@/components/AuthGate';
import SearchBar from '@/components/SearchBar';
import CategoryCard from '@/components/CategoryCard';
import CategoryDetail from '@/components/CategoryDetail';
import AddModal from '@/components/AddModal';
import FAB from '@/components/FAB';
import ImportExport from '@/components/ImportExport';
import TextImportModal from '@/components/TextImportModal';
import EmptyState from '@/components/EmptyState';
import BurgerMenu, { ProfileSheet } from '@/components/BurgerMenu';
import NewCategoryModal from '@/components/NewCategoryModal';
import RankRoadmapModal from '@/components/RankRoadmapModal';
import RankCelebrationModal from '@/components/RankCelebrationModal';

type View = 'home' | Category;

export default function Home() {
  const { session, loading: authLoading, signOut } = useAuth();
  const userId = session?.user?.id;

  const { data, loading: dataLoading, addItem, addBulk, updateCategory, deleteItem, updatePoster, importAll } =
    useListData(userId);

  const { customCategories, addCustomCategory, renameCustomCategory, deleteCustomCategory } = useCustomCategories(userId);

  const allCategories = useMemo(() => [...CATEGORIES, ...customCategories], [customCategories]);

  const [view, setView] = useState<View>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilter, setSearchFilter] = useState<Category | 'all'>('all');
  const [showAdd, setShowAdd] = useState(false);
  const [showTextImport, setShowTextImport] = useState(false);
  const [showData, setShowData] = useState(false);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [celebrationRank, setCelebrationRank] = useState<ReturnType<typeof getRank> | null>(null);

  const totalCount = useMemo(() => getTotalCount(data), [data]);
  const moviesCount = useMemo(() => getTypeCount(data, 'movies', allCategories), [data, allCategories]);
  const seriesCount = useMemo(() => getTypeCount(data, 'series', allCategories), [data, allCategories]);
  const currentRank = useMemo(() => getRank(seriesCount), [seriesCount]);
  const nextRank = useMemo(() => getNextRank(seriesCount), [seriesCount]);

  useEffect(() => {
    if (dataLoading) return;
    const rankName = currentRank.name;
    const stored = localStorage.getItem('the-list-rank');
    if (!stored) {
      localStorage.setItem('the-list-rank', rankName);
      return;
    }
    const storedIdx = RANKS.findIndex((r) => r.name === stored);
    const currIdx = RANKS.findIndex((r) => r.name === rankName);
    if (currIdx > storedIdx) {
      setCelebrationRank(currentRank);
      localStorage.setItem('the-list-rank', rankName);
    }
  }, [dataLoading, currentRank]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (!val) setSearchFilter('all');
  };

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return null;
    const cats = searchFilter === 'all' ? allCategories : allCategories.filter((c) => c.id === searchFilter);
    const results: ListItem[] = [];
    cats.forEach((cat) => {
      (data[cat.id] ?? []).forEach((item) => {
        if (item.title.toLowerCase().includes(query)) results.push(item);
      });
    });
    return results;
  }, [data, searchQuery, searchFilter, allCategories]);

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

  const handleExportList = () => {
    const lines: string[] = [];
    allCategories.forEach((cat) => {
      const items = data[cat.id];
      if (!items || items.length === 0) return;
      if (lines.length > 0) lines.push('');
      lines.push(`${cat.label.toUpperCase()} (${items.length}):`);
      items.forEach((item, i) => lines.push(`${i + 1}.${item.title}`));
    });
    const total = allCategories.reduce((sum, cat) => sum + (data[cat.id]?.length ?? 0), 0);
    const content = lines.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `The_List_${total}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const defaultAddCategory: Category = view === 'home' ? 'global' : (view as Category);
  const isSearching = searchQuery.trim().length > 0;

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
      <div className="w-full px-4 md:px-8 lg:px-12 xl:px-16 py-6 pb-28">

        {view === 'home' ? (
          <>
            {/* ── Header ── */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-zinc-100 tracking-tight leading-none">The List</h1>
                <p className="text-zinc-500 text-xs mt-1">Your personal watched library</p>
              </div>
              <div className="flex items-center gap-2">
                {/* Stats */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setShowRoadmap(true)}
                    className={`flex items-center gap-1.5 border rounded-full px-2.5 py-1 hover:opacity-80 transition-opacity ${currentRank.bgClass} ${currentRank.borderClass}`}
                  >
                    <span className="text-sm leading-none">{currentRank.badge}</span>
                    <span className={`font-bold text-sm tabular-nums ${currentRank.textClass}`}>{seriesCount}</span>
                    {nextRank && (
                      <span className="text-zinc-600 text-xs tabular-nums">/{nextRank.min}</span>
                    )}
                  </button>
                  {moviesCount > 0 && (
                    <div className="flex items-center gap-1 bg-blue-500/10 border border-blue-500/20 rounded-full px-2.5 py-1">
                      <Film className="w-3 h-3 text-blue-400" />
                      <span className="text-blue-300 font-bold text-sm tabular-nums">{moviesCount}</span>
                    </div>
                  )}
                </div>
                {/* Burger */}
                <BurgerMenu
                  onDataClick={() => setShowData((v) => !v)}
                  onNewCategoryClick={() => setShowNewCategory(true)}
                  onProfileClick={() => setShowProfile(true)}
                />
              </div>
            </div>

            <SearchBar
              value={searchQuery}
              onChange={handleSearchChange}
              filterCategory={searchFilter}
              onFilterChange={setSearchFilter}
              categories={allCategories}
            />

            {isSearching ? (
              <div className="animate-fade-in">
                <p className="text-zinc-500 text-xs mb-4">
                  <span className="text-zinc-300 font-semibold">{searchResults?.length ?? 0}</span>{' '}
                  {searchResults?.length === 1 ? 'result' : 'results'} for &ldquo;{searchQuery.trim()}&rdquo;
                </p>
                {searchResults?.length === 0 ? (
                  <EmptyState message="No results found" subMessage="Try a different term or filter" icon="🔍" />
                ) : (
                  <div className="space-y-5">
                    {allCategories.map((cat) => {
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 h-36 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {allCategories.map((cat) => (
                  <CategoryCard
                    key={cat.id}
                    config={cat}
                    items={data[cat.id] ?? []}
                    onClick={() => setView(cat.id)}
                  />
                ))}
              </div>
            )}

            {/* Data panel */}
            {showData && (
              <div className="mt-4 animate-fade-in">
                <ImportExport
                  data={data}
                  allCategories={allCategories}
                  onImport={importAll}
                  onExport={handleExport}
                  onExportList={handleExportList}
                  onTextImport={() => setShowTextImport(true)}
                />
              </div>
            )}
          </>
        ) : (
          <CategoryDetail
            category={view as Category}
            items={data[view as Category] ?? []}
            allCategories={allCategories}
            onBack={() => setView('home')}
            onUpdateItems={updateCategory}
            onAddBulk={addBulk}
            onDeleteItem={deleteItem}
            onUpdatePoster={updatePoster}
            onRenameCategory={renameCustomCategory}
            onDeleteCategory={(id) => { deleteCustomCategory(id); setView('home'); }}
          />
        )}
      </div>

      <FAB onClick={() => setShowAdd(true)} />

      {showAdd && (
        <AddModal
          defaultCategory={defaultAddCategory}
          categories={allCategories}
          onAdd={(title, category, posterPath) => addItem(title, category, posterPath)}
          onClose={() => setShowAdd(false)}
        />
      )}

      {showTextImport && (
        <TextImportModal
          activeCategory={view === 'home' ? 'tv-series' : (view as Category)}
          onImport={addBulk}
          onClose={() => setShowTextImport(false)}
        />
      )}

      {showNewCategory && (
        <NewCategoryModal
          onAdd={(name, type) => addCustomCategory(name, type)}
          onClose={() => setShowNewCategory(false)}
        />
      )}

      {showProfile && (
        <ProfileSheet
          email={session.user.email ?? ''}
          createdAt={session.user.created_at}
          totalItems={Object.values(data).reduce((sum, arr) => sum + arr.length, 0)}
          onSignOut={signOut}
          onClose={() => setShowProfile(false)}
        />
      )}

      {showRoadmap && (
        <RankRoadmapModal seriesCount={seriesCount} onClose={() => setShowRoadmap(false)} />
      )}

      {celebrationRank && (
        <RankCelebrationModal rank={celebrationRank} onClose={() => setCelebrationRank(null)} />
      )}
    </main>
  );
}
