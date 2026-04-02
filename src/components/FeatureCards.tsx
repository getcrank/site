import { motion } from "motion/react";
import { Layers, RotateCcw, Activity, type LucideIcon } from "lucide-react";

interface Feature {
  number: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    number: "01",
    icon: Layers,
    title: "Weighted Queues",
    description:
      "Named queues with configurable weights. Higher weight means more frequent polling. Route critical jobs to fast lanes.",
  },
  {
    number: "02",
    icon: RotateCcw,
    title: "Retries & Dead Queue",
    description:
      "Exponential backoff with configurable retry counts per job. Failed jobs that exhaust retries move to a dead set for inspection.",
  },
  {
    number: "03",
    icon: Activity,
    title: "Middleware Chain",
    description:
      "Built-in recovery, logging, and circuit breaker middleware. Add your own with engine.Use() before starting the processor.",
  },
];

export function FeatureCards() {
  return (
    <section className="px-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {features.map((feature) => (
          <FeatureCard key={feature.number} {...feature} />
        ))}
      </div>
    </section>
  );
}

function FeatureCard({ number, icon: Icon, title, description }: Feature) {
  return (
    <motion.div
      className="relative bg-card border border-border rounded-xl p-6 text-left cursor-default"
      whileHover={{ y: -4, rotate: -0.5 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <span className="absolute top-5 right-5 text-3xl font-semibold text-foreground/[0.06] select-none">
        {number}
      </span>
      <div className="flex items-center justify-center w-10 h-10 rounded-lg border border-border mb-4">
        <Icon className="w-5 h-5 text-foreground" strokeWidth={1.5} />
      </div>
      <h3 className="text-sm font-semibold mb-1.5">{title}</h3>
      <p className="text-sm text-muted leading-relaxed">{description}</p>
    </motion.div>
  );
}
