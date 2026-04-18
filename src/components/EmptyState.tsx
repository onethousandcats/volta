import { PropsWithChildren } from "react";

interface EmptyStateProps extends PropsWithChildren {
  eyebrow?: string;
  title: string;
}

export function EmptyState({ children, eyebrow, title }: EmptyStateProps) {
  return (
    <div className="flex h-full min-h-[240px] flex-col items-center justify-center rounded-md border border-dashed border-border px-6 py-12 text-center">
      {eyebrow ? (
        <span className="mb-3 text-[11px] uppercase tracking-widest text-muted">{eyebrow}</span>
      ) : null}
      <h2 className="text-base font-semibold text-ink">{title}</h2>
      {children ? <p className="mt-2 max-w-sm text-sm leading-6 text-muted">{children}</p> : null}
    </div>
  );
}
