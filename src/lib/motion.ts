import type { Transition } from "motion/react";

export const springTransition: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 20,
};

export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
} as const;

export const fadeIn = (delay: number) =>
  ({
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { delay, duration: 0.4 },
  }) as const;

export const scrollReveal = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.4 },
} as const;
