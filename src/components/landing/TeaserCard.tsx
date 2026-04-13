import { motion } from "motion/react";
import { scrollReveal } from "../../lib/motion";
import { Gauge } from "lucide-react";
import { Card, CardIcon, CardTitle, CardDescription } from "../ui/Card";

export function TeaserCard() {
  return (
    <section className="px-6 mt-4">
      <motion.div {...scrollReveal}>
      <Card className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <CardIcon icon={Gauge} size="md" />
        <div>
          <CardTitle>Metrics & Circuit Breaker</CardTitle>
          <CardDescription>
            Emit job events to your metrics backend with the MetricsHandler
            interface. The built-in circuit breaker halts processing of a failing
            job class after a configurable threshold, protecting downstream
            systems while other queues keep running.
          </CardDescription>
        </div>
      </Card>
      </motion.div>
    </section>
  );
}
