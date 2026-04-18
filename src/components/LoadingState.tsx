interface LoadingStateProps {
  label: string;
}

export function LoadingState({ label }: LoadingStateProps) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-gray-200 bg-panel px-4 py-3 text-sm text-muted">
      <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
      <span>{label}</span>
    </div>
  );
}
