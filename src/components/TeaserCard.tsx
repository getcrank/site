import { motion } from "motion/react";
import { Gauge } from "lucide-react";

export function TeaserCard() {
  return (
    <section className="px-6 mt-4">
      <motion.div
        className="bg-card border border-border rounded-xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-5 text-left cursor-default"
        whileHover={{ y: -3 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <div className="flex items-center justify-center w-12 h-12 rounded-xl border border-border shrink-0">
          <Gauge className="w-6 h-6 text-foreground" strokeWidth={1.5} />
        </div>
        <div>
          <h3 className="text-sm font-semibold mb-1">
            Metrics & Circuit Breaker
          </h3>
          <p className="text-sm text-muted leading-relaxed max-w-xl">
            Emit job events to your metrics backend with the MetricsHandler
            interface. The built-in circuit breaker halts processing of a failing
            job class after a configurable threshold, protecting downstream
            systems while other queues keep running.
          </p>
        </div>
      </motion.div>
    </section>
  );
}
