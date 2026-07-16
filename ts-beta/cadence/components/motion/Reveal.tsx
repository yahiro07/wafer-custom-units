"use client";

import { motion } from "framer-motion";
import { type ReactNode } from "react";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

/**
 * Fades and slides its children in the first time they scroll into view.
 * Collapses to a plain wrapper when reduced motion is requested.
 */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  const reducedMotion = usePrefersReducedMotion();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
