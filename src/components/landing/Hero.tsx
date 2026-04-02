import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { fadeInUp, fadeIn } from "../../lib/motion";

export function Hero() {
  return (
    <section className="px-6 pt-20 pb-16 text-center">
      <motion.div {...fadeInUp}>
        <p className="text-xs font-medium uppercase tracking-widest text-muted mb-4">
          Open Source SDK
        </p>
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-tight max-w-2xl mx-auto">
          Background job processing,
          <br />
          built for Go.
        </h1>
        <p className="mt-4 text-lg text-muted max-w-xl mx-auto leading-relaxed">
          Enqueue jobs to named queues, run workers concurrently, and observe
          execution through middleware, retries, and metrics. One package. No
          magic.
        </p>
      </motion.div>

      <motion.div
        className="mt-8 flex items-center justify-center gap-4"
        {...fadeIn(0.3)}
      >
        <a
          href="https://github.com/ogwurujohnson/crank"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-foreground text-background text-sm font-medium rounded-xl hover:opacity-90 transition-opacity"
        >
          Get Started
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
        <code className="px-4 py-2.5 bg-card border border-border rounded-xl text-sm text-muted font-mono">
          go get github.com/ogwurujohnson/crank
        </code>
      </motion.div>
    </section>
  );
}
