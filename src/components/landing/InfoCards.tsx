import { Shield, FlaskConical, type LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import { Card, CardIcon, CardTitle, CardDescription } from "../ui/Card";

interface InfoItem {
  readonly icon: LucideIcon;
  readonly title: string;
  readonly description: string;
}

const items: readonly InfoItem[] = [
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
        {items.map((item, index) => (
          <InfoCard key={item.title} {...item} index={index} />
        ))}
      </div>
    </section>
  );
}

function InfoCard({
  icon,
  title,
  description,
  index,
}: InfoItem & { readonly index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card className="p-6">
        <div className="mb-4">
          <CardIcon icon={icon} />
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </Card>
    </motion.div>
  );
}
