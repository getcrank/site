import { Link, Outlet } from "react-router-dom";
import { Terminal } from "lucide-react";
import { GithubIcon } from "../ui/GithubIcon";
import { DocsSidebar } from "./DocsSidebar";
import { DocsMobileNav } from "./DocsMobileNav";

export function DocsLayout() {
  return (
    <div className="min-h-screen max-w-5xl mx-auto">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-foreground">
            <Terminal className="w-4 h-4 text-background" strokeWidth={2.5} />
          </div>
          <span className="text-base font-semibold tracking-tight">Crank</span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted hidden sm:inline">
            Documentation
          </span>
          <a
            href="https://github.com/getcrank/crank"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted hover:text-foreground transition-colors"
            aria-label="GitHub"
          >
            <GithubIcon />
          </a>
        </div>
      </nav>

      <div className="flex px-6 py-10 gap-0">
        <DocsSidebar />
        <div className="flex-1 min-w-0 md:pl-8">
          <DocsMobileNav />
          <Outlet />
        </div>
      </div>
    </div>
  );
}
