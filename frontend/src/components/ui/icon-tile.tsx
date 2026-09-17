import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const sizeMap = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
} as const;

const iconSizeMap = {
  sm: "h-3.5 w-3.5",
  md: "h-4.5 w-4.5",
  lg: "h-5 w-5",
} as const;

/**
 * The small icon container used at the top of feature/outcome cards
 * app-wide. This used to be a plain rounded-square (the same shape every
 * other SaaS landing page uses for its icon grid). It's a diamond now -
 * the same .path-node shape as the logo and the roadmap/onboarding
 * waypoints - so a card's icon reads as "another waypoint on CareerFound's
 * path" instead of a generic feature-grid icon that happens to be green.
 */
export function IconTile({
  icon: Icon,
  size = "md",
  /** "warm" is reserved for the two paid human-mentorship pages, so it
   * reads as a deliberate "this is the premium human track" signal rather
   * than a second color competing with green everywhere else. */
  tone = "accent",
  className,
}: {
  icon: LucideIcon;
  size?: keyof typeof sizeMap;
  tone?: "accent" | "warm";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "path-node",
        tone === "warm" ? "border-warm/30 bg-warm/12 text-warm" : "border-accent/25 bg-accent/12 text-accent-light",
        sizeMap[size],
        className
      )}
    >
      <Icon className={iconSizeMap[size]} />
    </span>
  );
}
