'use client';

import { useState, useMemo } from 'react';
import { Category, ListData, ListItem } from '@/types';
import { CATEGORIES, INITIAL_DATA, generateId, getCategoryConfig, getTotalCount, sortItems } from '@/utils/helpers';
import useLocalStorage from '@/hooks/useLocalStorage';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import CategoryTabs from '@/components/CategoryTabs';
import AddTitleForm from '@/components/AddTitleForm';
import TitleCard from '@/components/TitleCard';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import TextImportModal from '@/components/TextImportModal';
import ImportExport from '@/components/ImportExport';
import EmptyState from '@/components/EmptyState';
import SortBar, { SortOption } from '@/components/SortBar';

export default function Home() {
  const [data, setData] = useLocalStorage<ListData>('the-list-data', INITIAL_DATA);
  const [activeCategory, setActiveCategory] = useState<Category>('movies');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilter, setSearchFilter] = useState<Category | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [deleteTarget, setDeleteTarget] = useState<ListItem | null>(null);
  const [showTextImport, setShowTextImport] = useState(false);

  const totalCount = useMemo(() => getTotalCount(data), [data]);

  const categoryCounts = useMemo(
    () =>
      Object.fromEntries(CATEGORIES.map((c) => [c.id, data[c.id].length])) as Record<
        Category,
        number
      >,
    [data]
  );

  // Reset search filter to 'all' when search is cleared
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (!val) setSearchFilter('all');
  };

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return null;

    const categoriesToSearch =
      searchFilter === 'all'
        ? CATEGORIES
        : CATEGORIES.filter((c) => c.id === searchFilter);

    const results: ListItem[] = [];
    categoriesToSearch.forEach((cat) => {
      data[cat.id].forEach((item) => {
        if (item.title.toLowerCase().includes(query)) {
          results.push(item);
        }
      });
    });
    return results;
  }, [data, searchQuery, searchFilter]);

  const sortedCurrentItems = useMemo(
    () => sortItems(data[activeCategory], sortBy),
    [data, activeCategory, sortBy]
  );

  const activeCatConfig = getCategoryConfig(activeCategory);
  const isSearchActive = searchQuery.trim().length > 0;

  const handleAdd = (title: string) => {
    const newItem: ListItem = {
      id: generateId(),
      title,
      category: activeCategory,
      addedAt: Date.now(),
    };
    setData((prev) => ({
      ...prev,
      [activeCategory]: [newItem, ...prev[activeCategory]],
    }));
  };

  const handleDeleteRequest = (item: ListItem) => setDeleteTarget(item);

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    setData((prev) => ({
      ...prev,
      [deleteTarget.category]: prev[deleteTarget.category].filter(
        (i) => i.id !== deleteTarget.id
      ),
    }));
    setDeleteTarget(null);
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
    setData((prev) => ({
      ...prev,
      [category]: [...newItems, ...prev[category]],
    }));
    setActiveCategory(category);
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-lg mx-auto px-4 py-6 pb-10">
        <Header totalCount={totalCount} />

        <SearchBar
          value={searchQuery}
          onChange={handleSearchChange}
          filterCategory={searchFilter}
          onFilterChange={setSearchFilter}
        />

        {isSearchActive ? (
          /* ── Search Results View ── */
          <div className="animate-fade-in">
            <p className="text-zinc-500 text-xs mb-4">
              <span className="text-zinc-300 font-semibold">{searchResults?.length ?? 0}</span>{' '}
              {searchResults?.length === 1 ? 'result' : 'results'} for &ldquo;
              {searchQuery.trim()}&rdquo;
            </p>

            {searchResults?.length === 0 ? (
              <EmptyState
                message="No results found"
                subMessage="Try a different search term or category filter"
                icon="🔍"
              />
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
                          <TitleCard
                            key={item.id}
                            item={item}
                            index={i + 1}
                            onDelete={() => handleDeleteRequest(item)}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* ── Category View ── */
          <>
            <CategoryTabs
              categories={CATEGORIES}
              activeCategory={activeCategory}
              counts={categoryCounts}
              onSelect={(cat) => { setActiveCategory(cat); setSortBy('newest'); }}
            />

            <AddTitleForm activeCategory={activeCategory} onAdd={handleAdd} />

            {data[activeCategory].length > 0 && (
              <SortBar
                count={data[activeCategory].length}
                label={activeCatConfig.label.toLowerCase()}
                sortBy={sortBy}
                onChange={setSortBy}
              />
            )}

            {sortedCurrentItems.length === 0 ? (
              <EmptyState
                message={`No ${activeCatConfig.label.toLowerCase()} added yet`}
                icon={activeCatConfig.icon}
              />
            ) : (
              <div className="space-y-2">
                {sortedCurrentItems.map((item, i) => (
                  <TitleCard
                    key={item.id}
                    item={item}
                    index={i + 1}
                    onDelete={() => handleDeleteRequest(item)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        <ImportExport
          data={data}
          onImport={handleImport}
          onExport={handleExport}
          onTextImport={() => setShowTextImport(true)}
        />
      </div>

      {deleteTarget && (
        <DeleteConfirmModal
          title={deleteTarget.title}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {showTextImport && (
        <TextImportModal
          activeCategory={activeCategory}
          onImport={handleTextImport}
          onClose={() => setShowTextImport(false)}
        />
      )}
    </main>
  );
}
