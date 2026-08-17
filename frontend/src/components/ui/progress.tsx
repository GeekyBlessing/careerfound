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
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-white/[0.08]", trackClassName)}>
      <div
        data-testid="progress-fill"
        className={cn("h-full rounded-full transition-all duration-700 ease-out", toneClass, className)}
        style={{ width: `${clamped}%` }}
      />
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
