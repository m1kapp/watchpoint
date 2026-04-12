interface SourceChipProps {
  label: string;
  url?: string;
}

export function SourceChip({ label, url }: SourceChipProps) {
  const inner = (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
      {label}
    </span>
  );

  if (url) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
        {inner}
      </a>
    );
  }

  return inner;
}

export function SourceRow({ sources }: { sources: SourceChipProps[] }) {
  return (
    <div className="flex flex-wrap gap-1.5 mt-1.5">
      {sources.map((s) => (
        <SourceChip key={s.label} {...s} />
      ))}
    </div>
  );
}
