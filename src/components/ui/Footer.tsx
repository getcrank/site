export function Footer() {
  return (
    <footer className="px-6 mt-20">
      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="flex flex-col sm:flex-row items-center justify-between py-6 gap-2">
      <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted">
        &copy; {new Date().getFullYear()} Crank
      </span>
      <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted">
        Background jobs, done right
      </span>
      </div>
    </footer>
  );
}
