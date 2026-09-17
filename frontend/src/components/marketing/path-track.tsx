import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PathWaypoint {
  label: string;
  icon: LucideIcon;
  /** "done" = already behind the user, "active" = where they are right now
   * (or, on the marketing hero, simply the step being emphasized),
   * "upcoming" = still ahead. Purely presentational - callers decide what
   * counts as done for their context (assessment step index, roadmap phase
   * completion, etc). */
  state?: "done" | "active" | "upcoming";
}

/**
 * CareerFound's signature journey visual: waypoints (diamond markers, not
 * plain circles - see .path-node in globals.css) connected by a route line.
 * Used on the marketing hero (the overall product journey), and reused
 * as-is by the onboarding stepper and the roadmap phase tracker so the same
 * "you are on a path" language shows up everywhere progress is communicated,
 * instead of every page inventing its own progress bar.
 */
export function PathTrack({
  waypoints,
  orientation = "horizontal",
  size = "md",
  className,
}: {
  waypoints: PathWaypoint[];
  orientation?: "horizontal" | "vertical";
  size?: "sm" | "md";
  className?: string;
}) {
  const nodeSize = size === "sm" ? "h-6 w-6" : "h-10 w-10";
  const iconSize = size === "sm" ? "h-3 w-3" : "h-4 w-4";

  const nodeToneClass = (state: PathWaypoint["state"]) =>
    cn(
      "path-node shrink-0",
      nodeSize,
      state === "done" && "border-accent/40 bg-accent/15 text-accent-light",
      state === "active" && "border-warm bg-warm/15 text-warm shadow-glow",
      (!state || state === "upcoming") && "border-[rgb(var(--fg-tint)/0.15)] bg-[rgb(var(--fg-tint)/0.04)] text-ink-500"
    );

  const segmentToneClass = (state: PathWaypoint["state"]) =>
    cn(orientation === "horizontal" ? "h-px flex-1" : "w-px flex-1 min-h-8", state === "done" ? "bg-accent/40" : "step-track");

  if (orientation === "vertical") {
    return (
      <ol className={cn("flex flex-col", className)}>
        {waypoints.map((wp, i) => (
          <li key={wp.label} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={nodeToneClass(wp.state)}>
                <wp.icon className={iconSize} />
              </div>
              {i < waypoints.length - 1 && <div className={segmentToneClass(waypoints[i + 1]?.state)} />}
            </div>
            <p className={cn("pb-8 pt-1.5 text-sm font-medium", wp.state === "active" ? "text-ink-100" : "text-ink-400")}>
              {wp.label}
            </p>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <ol className={cn("flex items-start", className)}>
      {waypoints.map((wp, i) => (
        <li key={wp.label} className={cn("flex items-center", i < waypoints.length - 1 ? "flex-1" : "flex-none")}>
          <div className="flex flex-col items-center gap-2">
            <div className={nodeToneClass(wp.state)}>
              <wp.icon className={iconSize} />
            </div>
            <p
              className={cn(
                "whitespace-nowrap font-mono text-[10px] font-medium uppercase tracking-wide",
                wp.state === "active" ? "text-warm" : "text-ink-400"
              )}
            >
              {wp.label}
            </p>
          </div>
          {i < waypoints.length - 1 && <div className={cn(segmentToneClass(waypoints[i + 1]?.state), "mx-2 -translate-y-[15px]")} />}
        </li>
      ))}
    </ol>
  );
}
