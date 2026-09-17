import { cn } from "@/lib/utils";

/**
 * A 5-tick difficulty meter, used wherever a career path or project reports
 * a numeric 1-5 difficulty - replaces a plain "3/5" text readout (or a
 * generic Signal icon) with something scannable at a glance across a whole
 * grid of cards.
 */
export function DifficultyMeter({ level, max = 5, className }: { level: number; max?: number; className?: string }) {
  const clamped = Math.max(0, Math.min(max, Math.round(level)));
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} role="img" aria-label={`Difficulty ${clamped} of ${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          className={cn("h-2.5 w-1 rounded-full", i < clamped ? "bg-accent-light" : "bg-[rgb(var(--fg-tint)/0.12)]")}
        />
      ))}
    </span>
  );
}
