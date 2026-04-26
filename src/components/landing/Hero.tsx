import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router";

export function Hero() {
  return (
    <section className="px-6 pt-20 pb-16 text-center relative">
      {/* Subtle focal glow */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        aria-hidden="true"
      >
        <div className="w-125 h-62.5 bg-foreground/2 rounded-full blur-3xl" />
      </div>

      <div className="relative">
        <motion.p
          className="text-xs font-medium uppercase tracking-widest text-muted mb-4"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          Open Source SDK
        </motion.p>

        <motion.h1
          className="text-4xl sm:text-5xl font-semibold tracking-tight leading-tight max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
        >
          Background job processing,
          <br />
          built for Go.
        </motion.h1>

        <motion.p
          className="mt-4 text-lg text-muted max-w-xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.18 }}
        >
          Enqueue jobs to named queues, run workers concurrently, and observe
          execution through middleware, retries, and metrics. One package. No
          magic.
        </motion.p>

        <motion.div
          className="h-px w-16 mx-auto mt-6 bg-foreground/15"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.45, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />

        <motion.div
          className="mt-8 flex flex-col-reverse sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.32 }}
        >
          <Link
            to="/docs"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-foreground text-background text-sm font-medium rounded-xl hover:opacity-90 transition-opacity"
          >
            Get Started
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <code className="px-4 py-2.5 bg-card border border-border rounded-xl text-sm text-muted font-mono">
            go get github.com/ogwurujohnson/crank
          </code>
        </motion.div>
      </div>
    </section>
  );
}
