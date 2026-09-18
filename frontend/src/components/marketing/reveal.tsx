"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * A restrained scroll-entrance wrapper: fades/slides a section's visual
 * composition in once, the first time it crosses into view, using the
 * `fade-in-up` keyframe tailwind.config.ts already defines (no new motion
 * library). Deliberately a per-section primitive, not per-element, so a
 * page doesn't turn into two dozen separately-animating pieces - hero and
 * showcase compositions get one entrance each, nothing loops or
 * re-triggers on re-scroll. Respects prefers-reduced-motion globally (see
 * globals.css).
 *
 * Content already in the viewport on mount (or observed via a browser
 * with no IntersectionObserver) renders fully visible immediately, with
 * no animation and no invisible flash while JS hydrates - only content
 * that starts below the fold gets the entrance treatment, and a short
 * safety timer forces visibility regardless, so a slow/failed observer
 * can never leave content permanently hidden.
 */
export function Reveal({ children, className, delayMs = 0 }: { children: React.ReactNode; className?: string; delayMs?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"pending" | "visible" | "animate">("pending");

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setState("visible");
      return;
    }

    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setState("visible");
      return;
    }

    const safety = setTimeout(() => setState((s) => (s === "pending" ? "visible" : s)), 2000);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setState("animate");
          observer.disconnect();
          clearTimeout(safety);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -80px 0px" }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      clearTimeout(safety);
    };
  }, []);

  return (
    <div
      ref={ref}
      // min-w-0: this wraps device-showcase compositions that are almost
      // always a grid/flex child sitting next to a text column. Grid/flex
      // items default to min-width:auto, so without this a child's
      // content (a long truncated title several levels down, say) can
      // force the whole column wider than its track and push the page
      // into horizontal scroll on narrow viewports - min-w-0 lets it
      // shrink to the space it's actually given instead.
      className={cn(
        "min-w-0",
        state === "pending" ? "opacity-0" : "opacity-100",
        state === "animate" && "animate-fade-in-up",
        className
      )}
      style={state === "animate" && delayMs ? { animationDelay: `${delayMs}ms` } : undefined}
    >
      {children}
    </div>
  );
}
