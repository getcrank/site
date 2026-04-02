import { motion } from "motion/react";
import { Shield, FlaskConical, type LucideIcon } from "lucide-react";

interface InfoItem {
  icon: LucideIcon;
  title: string;
  description: string;
}

const items: InfoItem[] = [
  {
    icon: Shield,
    title: "Validation & Redaction",
    description:
      "Enforce constraints with MaxArgsCount, ClassAllowlist, and ClassPattern validators. Mask sensitive fields in logs with built-in redactors.",
  },
  {
    icon: FlaskConical,
    title: "Test Without a Broker",
    description:
      "NewTestEngine() gives you an in-memory broker. Assert on retry and dead job state directly. No Redis required in CI.",
  },
];

export function InfoCards() {
  return (
    <section className="px-6 mt-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((item) => (
          <InfoCard key={item.title} {...item} />
        ))}
      </div>
    </section>
  );
}

function InfoCard({ icon: Icon, title, description }: InfoItem) {
  return (
    <motion.div
      className="bg-card border border-border rounded-xl p-6 text-left cursor-default"
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className="flex items-center justify-center w-10 h-10 rounded-lg border border-border mb-4">
        <Icon className="w-5 h-5 text-foreground" strokeWidth={1.5} />
      </div>
      <h3 className="text-sm font-semibold mb-1.5">{title}</h3>
      <p className="text-sm text-muted leading-relaxed">{description}</p>
    </motion.div>
  );
}
