interface EmptyStateProps {
  message: string;
  subMessage?: string;
  icon?: string;
}

export default function EmptyState({
  message,
  subMessage = 'Add your first title above',
  icon = '📋',
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center animate-slide-up">
      <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mb-4">
        <span className="text-3xl">{icon}</span>
      </div>
      <p className="text-zinc-400 text-sm font-medium">{message}</p>
      <p className="text-zinc-600 text-xs mt-1.5">{subMessage}</p>
    </div>
  );
}
