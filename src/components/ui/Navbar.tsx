import { motion } from "motion/react";
import { Terminal } from "lucide-react";
import { GithubIcon } from "./GithubIcon";

export function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-border">
      <div className="flex items-center gap-3">
        <motion.div
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-foreground"
          whileHover={{ scale: 1.08, rotate: -3 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
        >
          <Terminal className="w-4 h-4 text-background" strokeWidth={2.5} />
        </motion.div>
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
