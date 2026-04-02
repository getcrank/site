import { motion } from "motion/react";
import { scrollReveal } from "../../lib/motion";

const code = `engine, client, err := crank.New("redis://localhost:6379/0",
    crank.WithConcurrency(10),
    crank.WithQueues(crank.QueueOption{Name: "critical", Weight: 5}),
)

crank.SetGlobalClient(client)
engine.Register("EmailWorker", EmailWorker{})
engine.Start()

// Enqueue from anywhere
crank.Enqueue("EmailWorker", "critical", "user-123")`;

export function CodeExample() {
  return (
    <section className="px-6 mt-4">
      <motion.div
        className="bg-card border border-border rounded-xl overflow-hidden text-left"
        {...scrollReveal}
      >
        <div className="flex items-center gap-2 px-5 py-3 border-b border-border">
          <div className="w-2.5 h-2.5 rounded-full bg-border" />
          <div className="w-2.5 h-2.5 rounded-full bg-border" />
          <div className="w-2.5 h-2.5 rounded-full bg-border" />
          <span className="ml-3 text-[10px] font-medium uppercase tracking-[0.2em] text-muted">
            main.go
          </span>
        </div>
        <pre className="px-5 py-5 overflow-x-auto text-[13px] leading-relaxed font-mono text-foreground/80">
          <code>{code}</code>
        </pre>
      </motion.div>
    </section>
  );
}
