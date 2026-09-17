import { cn } from "@/lib/utils";

export function ProgressBar({
  value,
  className,
  trackClassName,
  tone = "accent",
}: {
  value: number;
  className?: string;
  trackClassName?: string;
  tone?: "accent" | "success" | "warning";
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const toneClass = { accent: "bg-accent", success: "bg-success", warning: "bg-warning" }[tone];
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-[rgb(var(--fg-tint)/0.08)]", trackClassName)}>
      <div
        data-testid="progress-fill"
        className={cn("h-full rounded-full transition-all duration-700 ease-out", toneClass, className)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

export interface ReadinessSegment {
  key: string;
  label: string;
  value: number;
}

/**
 * CareerFound's Tech Readiness Score gauge: a ring made of one arc segment
 * per contributing factor (knowledge, projects, portfolio, interview
 * readiness, practical skills), each filled to its own percentage - not a
 * single generic "progress circle" with the breakdown listed separately
 * below it. Built as a conic-gradient with computed stop percentages
 * (rounded to 2 decimals) rather than an icon/chart library, so what
 * contributes to the score is legible in the ring itself. Segments are
 * separated by a small transparent gap so five different fill levels don't
 * blur into one ring at a glance.
 */
export function ReadinessDial({ segments, overall, size = 176 }: { segments: ReadinessSegment[]; overall: number; size?: number }) {
  const n = segments.length;
  const sliceSpan = 100 / n;
  const gap = 1.1; // percentage-points of the circle reserved as a visual gap between segments
  let cursor = 0;
  const stops: string[] = [];
  for (const seg of segments) {
    const sliceStart = cursor;
    const sliceEnd = cursor + sliceSpan;
    const usable = sliceEnd - gap;
    const filledEnd = sliceStart + Math.max(0, Math.min(100, seg.value)) / 100 * (usable - sliceStart);
    stops.push(`rgb(var(--color-accent-light)) ${sliceStart.toFixed(2)}%`);
    stops.push(`rgb(var(--color-accent-light)) ${filledEnd.toFixed(2)}%`);
    stops.push(`rgb(var(--fg-tint) / 0.1) ${filledEnd.toFixed(2)}%`);
    stops.push(`rgb(var(--fg-tint) / 0.1) ${usable.toFixed(2)}%`);
    stops.push(`transparent ${usable.toFixed(2)}%`);
    stops.push(`transparent ${sliceEnd.toFixed(2)}%`);
    cursor = sliceEnd;
  }
  // A CSS mask punches the donut hole (rather than an opaque overlay div),
  // so whatever the ring sits on - a Card's tinted background, light mode,
  // dark mode - shows through correctly instead of needing to be matched
  // by hand.
  const holePct = 62;
  const maskStyle: React.CSSProperties = {
    background: `conic-gradient(from -90deg, ${stops.join(", ")})`,
    WebkitMaskImage: `radial-gradient(circle, transparent ${holePct}%, black ${holePct}%)`,
    maskImage: `radial-gradient(circle, transparent ${holePct}%, black ${holePct}%)`,
  };

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <div
        className="absolute inset-0 rounded-full"
        style={maskStyle}
        role="img"
        aria-label={`Tech Readiness Score: ${overall} out of 100`}
      />
      <div className="relative flex flex-col items-center">
        <span className="font-mono text-3xl font-semibold leading-none text-ink-100">{overall}</span>
        <span className="mt-1 text-[10px] uppercase tracking-wide text-ink-500">/ 100</span>
      </div>
    </div>
  );
}

export function RadialProgress({ value, size = 96, label }: { value: number; size?: number; label?: string }) {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth={8} fill="none" className="text-white/[0.08]" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={8}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-accent transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-semibold text-ink-100">{clamped}</span>
        {label && <span className="text-[10px] uppercase tracking-wide text-ink-500">{label}</span>}
      </div>
    </div>
  );
}
