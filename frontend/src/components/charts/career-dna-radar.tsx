"use client";

import type { CareerDNA } from "@/types";

const AXES: { key: keyof Omit<CareerDNA, "summary">; label: string }[] = [
  { key: "problem_solving", label: "Problem Solving" },
  { key: "mathematics", label: "Mathematics" },
  { key: "creativity", label: "Creativity" },
  { key: "people_orientation", label: "People" },
  { key: "systems_thinking", label: "Systems" },
  { key: "communication", label: "Communication" },
];

function pointFor(index: number, total: number, radius: number, center: number) {
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
  return { x: center + radius * Math.cos(angle), y: center + radius * Math.sin(angle) };
}

export function CareerDnaRadar({ dna, size = 280 }: { dna: CareerDNA; size?: number }) {
  const center = size / 2;
  const maxRadius = size / 2 - 36;
  const rings = [0.25, 0.5, 0.75, 1];

  const dataPoints = AXES.map((axis, i) => {
    const value = dna[axis.key] as number;
    const r = (value / 100) * maxRadius;
    return pointFor(i, AXES.length, r, center);
  });

  const polygonPath = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        style={{ width: "100%", maxWidth: size, height: "auto" }}
        role="img"
        aria-label="Career DNA radar chart"
      >
        {rings.map((ring) => {
          const pts = AXES.map((_, i) => pointFor(i, AXES.length, maxRadius * ring, center));
          return (
            <polygon
              key={ring}
              points={pts.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="none"
              stroke="rgb(var(--fg-tint) / 0.1)"
              strokeWidth={1}
            />
          );
        })}
        {AXES.map((_, i) => {
          const p = pointFor(i, AXES.length, maxRadius, center);
          return <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="rgb(var(--fg-tint) / 0.1)" strokeWidth={1} />;
        })}
        {/* Brand-colored (not a generic chart-library blue/purple): the
            filled shape uses the accent green, vertices use the warm
            secondary so the six data points still read clearly against the
            green fill. */}
        <polygon points={polygonPath} fill="rgb(var(--color-accent-light) / 0.28)" stroke="rgb(var(--color-accent-light))" strokeWidth={2} />
        {dataPoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={3} fill="rgb(var(--color-warm))" />
        ))}
        {AXES.map((axis, i) => {
          const labelPoint = pointFor(i, AXES.length, maxRadius + 22, center);
          return (
            <text
              key={axis.key}
              x={labelPoint.x}
              y={labelPoint.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-ink-500"
              fontSize="10"
            >
              {axis.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
