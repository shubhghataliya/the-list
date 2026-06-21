interface HeaderProps {
  totalCount: number;
}

export default function Header({ totalCount }: HeaderProps) {
  return (
    <div className="mb-6 flex items-start justify-between">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100 tracking-tight leading-none">
          The List
        </h1>
        <p className="text-zinc-500 text-sm mt-1">Your personal watched library</p>
      </div>
      <div className="flex items-center gap-1.5 bg-violet-500/10 border border-violet-500/20 rounded-full px-3 py-1.5 mt-0.5">
        <span className="text-violet-300 font-bold text-sm tabular-nums">{totalCount}</span>
        <span className="text-zinc-500 text-xs">titles</span>
      </div>
    </div>
  );
}
