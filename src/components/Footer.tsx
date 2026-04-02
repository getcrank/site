export function Footer() {
  return (
    <footer className="flex flex-col sm:flex-row items-center justify-between px-6 py-6 mt-20 border-t border-border gap-2">
      <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted">
        &copy; {new Date().getFullYear()} Crank
      </span>
      <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted">
        Background jobs, done right
      </span>
    </footer>
  );
}
