export type RankConfig = {
  name: string;
  min: number;
  max: number; // -1 = unlimited (final rank)
  badge: string;
  textClass: string;
  bgClass: string;
  borderClass: string;
  progressClass: string;
};

export const RANKS: RankConfig[] = [
  {
    name: 'Academy Student', min: 0, max: 24, badge: '📚',
    textClass: 'text-zinc-400', bgClass: 'bg-zinc-500/10', borderClass: 'border-zinc-500/30', progressClass: 'bg-zinc-500',
  },
  {
    name: 'Genin', min: 25, max: 49, badge: '🍃',
    textClass: 'text-green-400', bgClass: 'bg-green-500/10', borderClass: 'border-green-500/30', progressClass: 'bg-green-500',
  },
  {
    name: 'Chunin', min: 50, max: 99, badge: '📜',
    textClass: 'text-blue-400', bgClass: 'bg-blue-500/10', borderClass: 'border-blue-500/30', progressClass: 'bg-blue-500',
  },
  {
    name: 'Jonin', min: 100, max: 149, badge: '⚡',
    textClass: 'text-yellow-400', bgClass: 'bg-yellow-500/10', borderClass: 'border-yellow-500/30', progressClass: 'bg-yellow-500',
  },
  {
    name: 'ANBU', min: 150, max: 199, badge: '🎭',
    textClass: 'text-purple-400', bgClass: 'bg-purple-500/10', borderClass: 'border-purple-500/30', progressClass: 'bg-purple-500',
  },
  {
    name: 'Akatsuki Member', min: 200, max: 299, badge: '☁️',
    textClass: 'text-red-400', bgClass: 'bg-red-500/10', borderClass: 'border-red-500/30', progressClass: 'bg-red-500',
  },
  {
    name: 'Akatsuki Elite', min: 300, max: 399, badge: '💀',
    textClass: 'text-rose-400', bgClass: 'bg-rose-500/10', borderClass: 'border-rose-500/30', progressClass: 'bg-rose-500',
  },
  {
    name: 'Kage', min: 400, max: 499, badge: '🏔️',
    textClass: 'text-orange-400', bgClass: 'bg-orange-500/10', borderClass: 'border-orange-500/30', progressClass: 'bg-orange-500',
  },
  {
    name: 'Hokage', min: 500, max: -1, badge: '🔥',
    textClass: 'text-amber-400', bgClass: 'bg-amber-500/10', borderClass: 'border-amber-500/30', progressClass: 'bg-amber-500',
  },
];

export function getRank(count: number): RankConfig {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (count >= RANKS[i].min) return RANKS[i];
  }
  return RANKS[0];
}

export function getNextRank(count: number): RankConfig | null {
  const current = getRank(count);
  const idx = RANKS.indexOf(current);
  return idx < RANKS.length - 1 ? RANKS[idx + 1] : null;
}

export function getRankProgress(count: number): number {
  const current = getRank(count);
  const next = getNextRank(count);
  if (!next) return 100;
  return Math.min(100, Math.round(((count - current.min) / (next.min - current.min)) * 100));
}
