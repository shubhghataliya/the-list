'use client';

import { useState, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ArrowLeft, Pencil, Check, Trash2, X, GripVertical } from 'lucide-react';
import { Category, ListItem } from '@/types';
import { getCategoryConfig, sortItems } from '@/utils/helpers';
import SortBar, { SortOption } from '@/components/SortBar';
import EmptyState from '@/components/EmptyState';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';

/* ── Draggable edit row ───────────────────────────────────── */
interface SortableRowProps {
  item: ListItem;
  index: number;
  total: number;
  onUpdateTitle: (id: string, value: string) => void;
  onRemove: (id: string) => void;
}

function SortableRow({ item, index, onUpdateTitle, onRemove }: SortableRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-zinc-900 border rounded-xl px-3 py-2.5 flex items-center gap-2 transition-colors ${
        isDragging ? 'border-violet-500/40 shadow-lg shadow-black/40' : 'border-zinc-800'
      }`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="text-zinc-600 hover:text-zinc-400 cursor-grab active:cursor-grabbing touch-none flex-shrink-0 p-0.5"
        aria-label="Drag to reorder"
      >
        <GripVertical className="w-4 h-4" />
      </button>

      {/* Index */}
      <span className="text-zinc-600 text-xs tabular-nums w-5 text-right flex-shrink-0 font-mono">
        {index + 1}.
      </span>

      {/* Editable title */}
      <input
        value={item.title}
        onChange={(e) => onUpdateTitle(item.id, e.target.value)}
        className="flex-1 bg-transparent text-zinc-100 text-sm focus:outline-none min-w-0 border-b border-transparent focus:border-zinc-600 pb-0.5 transition-colors placeholder-zinc-600"
        placeholder="Title…"
      />

      {/* Delete */}
      <button
        onClick={() => onRemove(item.id)}
        className="flex-shrink-0 p-1.5 text-zinc-700 hover:text-red-400 hover:bg-red-400/10 transition-all rounded-lg"
        aria-label="Remove"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

/* ── Main component ───────────────────────────────────────── */
interface CategoryDetailProps {
  category: Category;
  items: ListItem[];
  onBack: () => void;
  onUpdateItems: (category: Category, items: ListItem[]) => void;
}

export default function CategoryDetail({
  category,
  items,
  onBack,
  onUpdateItems,
}: CategoryDetailProps) {
  const config = getCategoryConfig(category);
  const [editMode, setEditMode] = useState(false);
  const [editItems, setEditItems] = useState<ListItem[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [deleteTarget, setDeleteTarget] = useState<ListItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const enterEdit = () => {
    setEditItems([...items]);
    setEditMode(true);
  };

  const cancelEdit = () => {
    setEditMode(false);
    setEditItems([]);
  };

  const saveEdit = () => {
    onUpdateItems(category, editItems.filter((i) => i.title.trim() !== ''));
    setEditMode(false);
    setEditItems([]);
  };

  const updateTitle = (id: string, value: string) => {
    setEditItems((prev) => prev.map((i) => (i.id === id ? { ...i, title: value } : i)));
  };

  const removeFromEdit = (id: string) => {
    setEditItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setEditItems((prev) => {
        const oldIndex = prev.findIndex((i) => i.id === active.id);
        const newIndex = prev.findIndex((i) => i.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    onUpdateItems(category, items.filter((i) => i.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const sortedItems = useMemo(() => sortItems(items, sortBy), [items, sortBy]);

  return (
    <div className="animate-fade-in">
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={editMode ? cancelEdit : onBack}
          className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-200 transition-colors py-1"
        >
          {editMode ? (
            <><X className="w-4 h-4" /><span className="text-sm">Cancel</span></>
          ) : (
            <><ArrowLeft className="w-4 h-4" /><span className="text-sm">Back</span></>
          )}
        </button>

        {editMode ? (
          <button
            onClick={saveEdit}
            className="flex items-center gap-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 rounded-xl px-4 py-2 text-sm font-semibold transition-all active:scale-[0.98]"
          >
            <Check className="w-3.5 h-3.5" />
            Save
          </button>
        ) : (
          <button
            onClick={enterEdit}
            disabled={items.length === 0}
            className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-300 border border-zinc-700 hover:border-zinc-600 rounded-xl px-4 py-2 text-sm font-medium transition-all active:scale-[0.98]"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>
        )}
      </div>

      {/* ── Category header ── */}
      <div className={`flex items-center gap-3 mb-5 pb-5 border-b border-zinc-800`}>
        <div className={`w-12 h-12 rounded-2xl ${config.bgClass} border ${config.borderClass} flex items-center justify-center flex-shrink-0`}>
          <span className="text-2xl leading-none">{config.icon}</span>
        </div>
        <div>
          <h2 className={`text-xl font-bold ${config.textColorClass}`}>{config.label}</h2>
          <p className="text-zinc-500 text-sm">
            {editMode
              ? `Editing ${editItems.length} title${editItems.length !== 1 ? 's' : ''}`
              : `${items.length} title${items.length !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      {/* ── Edit mode hint ── */}
      {editMode && (
        <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl px-4 py-2.5 mb-4 flex items-center gap-2 animate-fade-in">
          <GripVertical className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
          <p className="text-violet-300 text-xs">
            Drag <GripVertical className="w-3 h-3 inline -mt-0.5" /> to reorder. Tap a title to rename it.
          </p>
        </div>
      )}

      {/* ── Sort bar (view mode only) ── */}
      {!editMode && items.length > 1 && (
        <SortBar count={items.length} label={config.label.toLowerCase()} sortBy={sortBy} onChange={setSortBy} />
      )}

      {/* ── Empty state ── */}
      {items.length === 0 ? (
        <EmptyState
          message={`No ${config.label.toLowerCase()} added yet`}
          subMessage='Tap "+" to add your first title'
          icon={config.icon}
        />
      ) : editMode ? (
        /* ══════════════════════════════════
           EDIT MODE — draggable cards
           ══════════════════════════════════ */
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={editItems.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-1.5">
              {editItems.map((item, i) => (
                <SortableRow
                  key={item.id}
                  item={item}
                  index={i}
                  total={editItems.length}
                  onUpdateTitle={updateTitle}
                  onRemove={removeFromEdit}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        /* ══════════════════════════════════
           VIEW MODE — plain list, no boxes
           ══════════════════════════════════ */
        <div>
          {sortedItems.map((item, i) => (
            <div
              key={item.id}
              className="group flex items-baseline gap-3 py-2.5 border-b border-zinc-800/50 last:border-0 hover:bg-zinc-900/40 px-1 rounded-lg transition-colors"
            >
              <span className="text-zinc-600 text-xs tabular-nums font-mono flex-shrink-0 w-7 text-right">
                {i + 1}.
              </span>
              <span className="text-zinc-200 text-sm flex-1 min-w-0">{item.title}</span>
              <button
                onClick={() => setDeleteTarget(item)}
                className="flex-shrink-0 p-1.5 rounded-lg text-zinc-800 hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100 active:scale-95"
                aria-label={`Delete ${item.title}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          title={deleteTarget.title}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
