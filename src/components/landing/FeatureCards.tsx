import { Layers, RotateCcw, Activity, type LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import { Card, CardIcon, CardTitle, CardDescription } from "../ui/Card";

interface Feature {
  readonly number: string;
  readonly icon: LucideIcon;
  readonly title: string;
  readonly description: string;
}

const features: readonly Feature[] = [
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
        {features.map((feature, index) => (
          <FeatureCard key={feature.number} {...feature} index={index} />
        ))}
      </div>
    </section>
  );
}

function FeatureCard({
  number,
  icon,
  title,
  description,
  index,
}: Feature & { readonly index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card className="relative p-6" hover="lift-rotate">
        <span className="absolute top-5 right-5 text-3xl font-semibold text-foreground/[0.06] select-none">
          {number}
        </span>
        <div className="mb-4">
          <CardIcon icon={icon} />
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </Card>
    </motion.div>
  );
}
