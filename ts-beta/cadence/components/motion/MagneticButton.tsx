"use client";

import { useRef, useState, type MouseEvent, type ReactNode } from "react";
import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";

interface MagneticButtonProps {
  children: ReactNode;
  href: string;
  className?: string;
}

/**
 * An anchor that drifts toward the pointer on hover, then springs back on
 * leave. Magnetism is disabled entirely under reduced motion.
 */
export function MagneticButton({
  children,
  href,
  className,
}: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMove = (event: MouseEvent<HTMLAnchorElement>) => {
    if (reducedMotion || !ref.current) {
      return;
    }
    const rect = ref.current.getBoundingClientRect();
    const x = event.clientX - (rect.left + rect.width / 2);
    const y = event.clientY - (rect.top + rect.height / 2);
    setOffset({ x: x * 0.3, y: y * 0.3 });
  };

  const handleLeave = () => setOffset({ x: 0, y: 0 });

  return (
    <motion.a
      ref={ref}
      href={href}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      animate={{ x: offset.x, y: offset.y }}
      transition={{ type: "spring", stiffness: 200, damping: 15, mass: 0.5 }}
      className={className}
    >
      {children}
    </motion.a>
  );
}
