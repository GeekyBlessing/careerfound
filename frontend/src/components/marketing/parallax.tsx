"use client";

import { useEffect, useRef } from "react";

/**
 * A very small vertical parallax: the child drifts by up to `range` pixels
 * (either direction) as it crosses the viewport, so photographs and floating
 * UI fragments sit at slightly different depths. Updates a CSS transform from
 * one rAF-throttled scroll listener, only while the element is near the
 * viewport, and does nothing under prefers-reduced-motion.
 */
export function Parallax({ range = 24, className, children }: { range?: number; className?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      if (r.bottom < -200 || r.top > vh + 200) return;
      // -1 when the element's centre is at the bottom of the screen, +1 at the top.
      const t = 1 - ((r.top + r.height / 2) / vh) * 2;
      const clamped = Math.max(-1, Math.min(1, t));
      el.style.transform = `translate3d(0, ${(clamped * range).toFixed(1)}px, 0)`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [range]);

  return (
    <div ref={ref} className={className} style={{ willChange: "transform" }}>
      {children}
    </div>
  );
}
