import { useEffect, useState } from "react";

/**
 * Tracks the OS-level prefers-reduced-motion setting and reacts to live
 * changes. Starts false so server and client render identically, then resolves
 * after mount.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const handler = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener("change", handler);
    return () => query.removeEventListener("change", handler);
  }, []);

  return reduced;
}
