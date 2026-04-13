import { motion } from "motion/react";
import { scrollReveal } from "../../lib/motion";
import { Puzzle } from "lucide-react";
import { Card, CardIcon, CardTitle, CardDescription } from "../ui/Card";

export function BrokerCard() {
  return (
    <section className="px-6 mt-4">
      <motion.div {...scrollReveal}>
      <Card className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <CardIcon icon={Puzzle} size="md" />
        <div>
          <CardTitle>Bring Your Own Broker</CardTitle>
          <CardDescription>
            Implement your own broker interface to back Crank with any transport
            you need with WithCustomBroker(). Redis is supported natively out of the box, NATS support is
            in progress, and more brokers are on the way.
          </CardDescription>
        </div>
      </Card>
      </motion.div>
    </section>
  );
}
