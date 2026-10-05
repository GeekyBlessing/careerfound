"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Renders real UI at a fixed "design" size and scales it down to whatever
 * width its container has, so a laptop, tablet or phone on the page shows the
 * actual CareerFound interface (real type, real spacing) rather than a
 * redrawn miniature. Height follows from the aspect ratio, so the container
 * never overflows and nothing reflows as the viewport changes.
 *
 * The content is a picture of the product, not the product: it is hidden from
 * assistive technology and cannot take focus (the parent device carries an
 * accessible label), so it never adds fake controls to the tab order.
 */
export function ScaledScreen({
  designWidth,
  designHeight,
  className,
  children,
}: {
  designWidth: number;
  designHeight: number;
  className?: string;
  children: React.ReactNode;
}) {
  const box = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / designWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [designWidth]);

  // `inert` keeps links and buttons inside the picture out of the tab order.
  useEffect(() => {
    inner.current?.setAttribute("inert", "");
  }, []);

  return (
    <div ref={box} className={className} style={{ position: "relative", width: "100%", aspectRatio: `${designWidth} / ${designHeight}`, overflow: "hidden" }}>
      <div
        ref={inner}
        aria-hidden="true"
        style={{ width: designWidth, height: designHeight, transform: `scale(${scale})`, transformOrigin: "top left", position: "absolute", left: 0, top: 0 }}
      >
        {children}
      </div>
    </div>
  );
}
