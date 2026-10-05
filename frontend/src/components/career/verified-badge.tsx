import { BadgeCheck, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VerificationBadge } from "@/types/lab";

/**
 * The two badges are different claims and look different on purpose.
 * "CareerFound Verified Project" means a named reviewer read the project and
 * approved the repository. "Repository checked" means only that an automated
 * check found a public repository with a README and a real commit history.
 * Never render the verified badge from anything but a verified tier.
 */
export function VerifiedBadge({
  badge,
  reviewer,
  date,
  size = "md",
  className,
}: {
  badge: VerificationBadge | null;
  reviewer?: string;
  date?: string | null;
  size?: "sm" | "md";
  className?: string;
}) {
  if (!badge) return null;
  const verified = badge.tier === "verified";
  const Icon = verified ? BadgeCheck : ShieldCheck;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[0.25rem] border font-medium",
        size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        verified ? "border-success/50 bg-success/10 text-success" : "border-[rgb(var(--fg-tint)/0.2)] text-ink-300",
        className
      )}
      title={verified && reviewer ? `Reviewed by ${reviewer}${date ? ` on ${new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}` : ""}` : undefined}
    >
      <Icon className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} aria-hidden="true" />
      {badge.title}
    </span>
  );
}
