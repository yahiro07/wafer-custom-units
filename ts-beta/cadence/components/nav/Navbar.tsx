"use client";

import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { NAV_ITEMS, SECTION_IDS } from "@/lib/constants";
import { useScrollSpy } from "@/lib/hooks/useScrollSpy";
import { ThemeToggle } from "@/components/nav/ThemeToggle";

/**
 * Fixed top navigation. Links smooth-scroll to in-page sections (no routing),
 * the active link is driven by a scroll-spy, and a slide-down sheet handles
 * the mobile breakpoint.
 */
export function Navbar() {
  const activeId = useScrollSpy(SECTION_IDS, 80);
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollTo = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setMenuOpen(false);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 backdrop-blur-md">
        <button
          type="button"
          onClick={() => scrollTo("hero")}
          className="font-display text-xl font-bold tracking-tight text-foreground"
        >
          cadence<span className="text-accent">.</span>
        </button>

        <ul className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => scrollTo(item.id)}
                className="relative rounded-full px-4 py-2 text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
              >
                {activeId === item.id && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-full bg-accent/15"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-foreground/15 text-foreground md:hidden"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              {menuOpen ? (
                <path d="M18 6 6 18M6 6l12 12" />
              ) : (
                <path d="M3 12h18M3 6h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.ul
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="mx-4 overflow-hidden rounded-2xl border border-foreground/10 bg-background/90 backdrop-blur-xl md:hidden"
          >
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => scrollTo(item.id)}
                  className={`block w-full px-6 py-3 text-left text-sm font-medium transition-colors ${
                    activeId === item.id
                      ? "text-accent"
                      : "text-foreground/70 hover:text-foreground"
                  }`}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </header>
  );
}
