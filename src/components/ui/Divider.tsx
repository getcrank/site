interface DividerProps {
  label: string;
}

export function Divider({ label }: DividerProps) {
  return (
    <div className="flex items-center gap-4 px-6 py-12">
      <div className="flex-1 h-px bg-border" />
      <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted">
        {label}
      </span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}
