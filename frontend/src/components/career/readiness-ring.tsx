import { cn } from "@/lib/utils";

/**
 * The readiness gauge. One continuous arc, filled to the score, so it reads
 * as a single measure. With no activity yet it draws an empty, dashed track
 * and a dash instead of "0", because a zero would be a score and there is
 * nothing to score yet.
 */
export function ReadinessRing({
  score,
  active,
  size = 168,
  className,
}: {
  score: number;
  active: boolean;
  size?: number;
  className?: string;
}) {
  const stroke = Math.max(8, Math.round(size / 16));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const filled = active ? (Math.max(0, Math.min(100, score)) / 100) * c : 0;
  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={active ? `Career readiness: ${score} out of 100` : "Career readiness: no score yet"}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgb(var(--fg-tint) / 0.1)"
          strokeWidth={stroke}
          strokeDasharray={active ? undefined : `2 ${Math.round(c / 40)}`}
          strokeLinecap="round"
        />
        {active && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="rgb(var(--color-accent-light))"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${filled} ${c}`}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: "stroke-dasharray 700ms ease-out" }}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {active ? (
          <>
            <span className="font-display font-semibold leading-none text-ink-100" style={{ fontSize: size * 0.3 }}>
              {score}
            </span>
            <span className="mt-1 font-mono text-[10px] uppercase tracking-wide text-ink-500">out of 100</span>
          </>
        ) : (
          <span className="font-display font-semibold leading-tight text-ink-300" style={{ fontSize: size * 0.13 }}>
            Not scored yet
          </span>
        )}
      </div>
    </div>
  );
}
