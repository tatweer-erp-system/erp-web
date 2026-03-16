import { useSyncExternalStore } from "react";

type Breakpoint = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

type BreakpointResult = {
  breakpoint: Breakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
};

const BREAKPOINTS: [Breakpoint, string][] = [
  ["2xl", "(min-width: 1600px)"],
  ["xl", "(min-width: 1200px)"],
  ["lg", "(min-width: 992px)"],
  ["md", "(min-width: 768px)"],
  ["sm", "(min-width: 576px)"],
  ["xs", "(min-width: 0px)"],
];

function getBreakpoint(): Breakpoint {
  if (typeof window === "undefined") return "lg";
  for (const [bp, query] of BREAKPOINTS) {
    if (window.matchMedia(query).matches) return bp;
  }
  return "xs";
}

let listeners: Array<() => void> = [];
let currentBreakpoint: Breakpoint = getBreakpoint();

function subscribe(callback: () => void): () => void {
  listeners = [...listeners, callback];
  const queries = BREAKPOINTS.map(([, query]) => window.matchMedia(query));
  const handler = () => {
    const next = getBreakpoint();
    if (next !== currentBreakpoint) {
      currentBreakpoint = next;
      listeners.forEach(l => l());
    }
  };
  queries.forEach(mql => mql.addEventListener("change", handler));
  return () => {
    listeners = listeners.filter(l => l !== callback);
    queries.forEach(mql => mql.removeEventListener("change", handler));
  };
}

function getSnapshot(): Breakpoint {
  return currentBreakpoint;
}

/**
 * Returns the current responsive breakpoint and boolean helpers.
 *
 * - `isMobile` — viewport is below `md` (< 768px)
 * - `isTablet` — viewport is `md` or `lg` (768px–991px)
 * - `isDesktop` — viewport is `lg` or wider (>= 992px)
 */
export function useBreakpoint(): BreakpointResult {
  const breakpoint = useSyncExternalStore(subscribe, getSnapshot);
  return {
    breakpoint,
    isMobile: breakpoint === "xs" || breakpoint === "sm",
    isTablet: breakpoint === "md",
    isDesktop:
      breakpoint === "lg" || breakpoint === "xl" || breakpoint === "2xl",
  };
}
