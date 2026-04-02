import { Terminal } from "lucide-react";
import { GithubIcon } from "./GithubIcon";

export function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-border">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-foreground">
          <Terminal className="w-4 h-4 text-background" strokeWidth={2.5} />
        </div>
        <span className="text-base font-semibold tracking-tight">Crank</span>
      </div>
      <a
        href="https://github.com/getcrank/crank"
        target="_blank"
        rel="noopener noreferrer"
        className="text-muted hover:text-foreground transition-colors"
        aria-label="GitHub"
      >
        <GithubIcon />
      </a>
    </nav>
  );
}
