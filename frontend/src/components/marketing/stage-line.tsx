"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * The roadmap as large editorial type: eight stages, each lighting up in turn
 * the first time the list scrolls into view, with a vertical rule that fills
 * alongside. It is the page's one piece of "progression" motion; under
 * reduced motion every stage is simply lit from the start.
 */
export function StageLine({ stages, tone = "default" }: { stages: readonly { key: string; label: string; body: string }[]; tone?: "default" | "ink" }) {
  const ink = tone === "ink";
  const ref = useRef<HTMLOListElement>(null);
  const [lit, setLit] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || typeof IntersectionObserver === "undefined") {
      setLit(stages.length);
      return;
    }
    let timer: ReturnType<typeof setInterval> | undefined;
    const safety = setTimeout(() => setLit(stages.length), 6000);
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        io.disconnect();
        let n = 0;
        timer = setInterval(() => {
          n += 1;
          setLit(n);
          if (n >= stages.length && timer) clearInterval(timer);
        }, 260);
      },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clearTimeout(safety);
      if (timer) clearInterval(timer);
    };
  }, [stages.length]);

  return (
    <ol ref={ref} className="relative">
      <span aria-hidden="true" className={cn("absolute bottom-3 left-[11px] top-3 w-px", ink ? "bg-white/15" : "bg-[rgb(var(--fg-tint)/0.14)]")} />
      <span
        aria-hidden="true"
        className={cn("absolute left-[11px] top-3 w-px transition-[height] duration-[260ms] ease-linear", ink ? "bg-[#a5c760]" : "bg-accent-light")}
        style={{ height: `calc((100% - 1.5rem) * ${Math.max(0, lit - 1) / Math.max(1, stages.length - 1)})` }}
      />
      {stages.map((s, i) => {
        const on = i < lit;
        return (
          <li key={s.key} className="relative flex items-baseline gap-5 py-2.5 sm:py-3">
            <span
              aria-hidden="true"
              className={cn(
                "relative z-10 mt-2.5 h-[23px] w-[23px] flex-shrink-0 rounded-full border-2 transition-colors duration-300",
                ink ? "bg-[#0b0d0a]" : "bg-base-950",
                on ? (ink ? "border-[#a5c760]" : "border-accent-light") : ink ? "border-white/20" : "border-[rgb(var(--fg-tint)/0.2)]"
              )}
            >
              <span className={cn("absolute inset-[4px] rounded-full transition-colors duration-300", on ? (ink ? "bg-[#a5c760]" : "bg-accent-light") : "bg-transparent")} />
            </span>
            <div className="min-w-0">
              <p className={cn("font-display text-[2.1rem] font-semibold leading-none tracking-tight transition-colors duration-300 sm:text-[2.6rem]", on ? (ink ? "text-[#f4f5f0]" : "text-ink-100") : ink ? "text-[#f4f5f0]/25" : "text-ink-500/60")}>
                {s.label}
              </p>
              <p className={cn("mt-1.5 max-w-sm text-sm leading-snug transition-opacity duration-300", ink ? "text-[#a7ac9e]" : "text-ink-400", on ? "opacity-100" : "opacity-0")}>{s.body}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
