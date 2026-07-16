import { useEffect, useState } from "react";

/**
 * Returns the id of the section currently in view, for highlighting the active
 * nav link. Pass a stable array reference (see SECTION_IDS in constants).
 */
export function useScrollSpy(sectionIds: string[], offset = 0): string {
  const [activeId, setActiveId] = useState<string>(sectionIds[0] ?? "");

  useEffect(() => {
    const handleScroll = () => {
      const line = window.scrollY + offset + window.innerHeight * 0.3;
      let current = sectionIds[0] ?? "";
      for (const id of sectionIds) {
        const element = document.getElementById(id);
        if (element && element.offsetTop <= line) {
          current = id;
        }
      }
      setActiveId(current);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sectionIds, offset]);

  return activeId;
}
