import { motion } from "motion/react";
import type { LucideIcon } from "lucide-react";
import { springTransition } from "../../lib/motion";

interface CardProps {
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly hover?: "lift" | "lift-rotate";
}

export function Card({ children, className = "", hover = "lift" }: CardProps) {
  const hoverAnimation =
    hover === "lift-rotate"
      ? { y: -4, rotate: -0.5, boxShadow: "0 8px 24px -8px rgba(33,37,41,0.08)" }
      : { y: -3, boxShadow: "0 6px 20px -6px rgba(33,37,41,0.06)" };

  return (
    <motion.div
      className={`bg-card border border-border rounded-xl text-left cursor-default ${className}`}
      whileHover={hoverAnimation}
      transition={springTransition}
    >
      {children}
    </motion.div>
  );
}

interface CardIconProps {
  readonly icon: LucideIcon;
  readonly size?: "sm" | "md";
}

export function CardIcon({ icon: Icon, size = "sm" }: CardIconProps) {
  const sizeClasses =
    size === "md"
      ? "w-12 h-12 rounded-xl [&>svg]:w-6 [&>svg]:h-6"
      : "w-10 h-10 rounded-lg [&>svg]:w-5 [&>svg]:h-5";

  return (
    <div
      className={`flex items-center justify-center border border-border shrink-0 ${sizeClasses}`}
    >
      <Icon className="text-foreground" strokeWidth={1.5} />
    </div>
  );
}

export function CardTitle({ children }: { readonly children: React.ReactNode }) {
  return <h3 className="text-sm font-semibold mb-1.5">{children}</h3>;
}

export function CardDescription({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <p className="text-sm text-muted leading-relaxed">{children}</p>
  );
}
