import { cn } from "@/lib/utils";

type Tone = "neutral" | "accent" | "success" | "warning" | "danger" | "warm";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-[rgb(var(--fg-tint)/0.06)] text-ink-300 border-[rgb(var(--fg-tint)/0.1)]",
  accent: "bg-accent/15 text-accent-light border-accent/30",
  success: "bg-success/15 text-success border-success/30",
  warning: "bg-warning/15 text-warning border-warning/30",
  danger: "bg-danger/15 text-danger border-danger/30",
  // Reserved for signature moments (the Best Match reveal) - see
  // globals.css's note on the warm secondary accent.
  warm: "bg-warm/15 text-warm border-warm/35",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        toneClasses[tone],
        className
      )}
      {...props}
    />
  );
}
