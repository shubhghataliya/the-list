export type RankConfig = {
  name: string;
  min: number;
  max: number; // -1 = unlimited (final rank)
  badge: string;
  imagePath: string;
  textClass: string;
  bgClass: string;
  borderClass: string;
  progressClass: string;
};

export const RANKS: RankConfig[] = [
  {
    name: 'Genin', min: 0, max: 29, badge: '🍃', imagePath: '/ranks/genin.png',
    textClass: 'text-green-400', bgClass: 'bg-green-500/10', borderClass: 'border-green-500/30', progressClass: 'bg-green-500',
  },
  {
    name: 'Chunin', min: 30, max: 59, badge: '🦺', imagePath: '/ranks/chunin.png',
    textClass: 'text-blue-400', bgClass: 'bg-blue-500/10', borderClass: 'border-blue-500/30', progressClass: 'bg-blue-500',
  },
  {
    name: 'Special Jonin', min: 60, max: 89, badge: '⭐', imagePath: '/ranks/jonin.png',
    textClass: 'text-sky-400', bgClass: 'bg-sky-500/10', borderClass: 'border-sky-500/30', progressClass: 'bg-sky-500',
  },
  {
    name: 'ANBU Operative', min: 90, max: 119, badge: '🎭', imagePath: '/ranks/anbu.png',
    textClass: 'text-purple-400', bgClass: 'bg-purple-500/10', borderClass: 'border-purple-500/30', progressClass: 'bg-purple-500',
  },
  {
    name: 'Kage', min: 120, max: -1, badge: '🏔️', imagePath: '/ranks/kage.png',
    textClass: 'text-orange-400', bgClass: 'bg-orange-500/10', borderClass: 'border-orange-500/30', progressClass: 'bg-orange-500',
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
