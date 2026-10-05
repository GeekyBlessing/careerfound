"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * A progress fill that grows from empty to its value the first time it is
 * seen, so a progress bar reads as progress being made rather than a static
 * stripe. It renders empty on the server and fills on the client; a safety
 * timer guarantees the final value shows even if the observer never fires.
 * Reduced motion is handled globally (transitions are cut to ~0 in
 * globals.css), so the bar simply appears at its value.
 */
export function InViewFill({
  value,
  className,
  delayMs = 0,
}: {
  value: number;
  className?: string;
  delayMs?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setOn(true);
      return;
    }
    const safety = setTimeout(() => setOn(true), 3000);
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setOn(true);
          io.disconnect();
          clearTimeout(safety);
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clearTimeout(safety);
    };
  }, []);

  const clamped = Math.max(0, Math.min(100, value));
  return (
    <span
      ref={ref}
      className={cn("block h-full rounded-full bg-accent transition-[width] duration-[1100ms] ease-smooth", className)}
      style={{ width: on ? `${clamped}%` : "0%", transitionDelay: on ? `${delayMs}ms` : undefined }}
    />
  );
}
