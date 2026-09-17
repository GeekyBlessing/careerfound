import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface JourneyStep {
  title: string;
  body: string;
  icon: LucideIcon;
}

/**
 * Renders the product's four-step journey (steps/marketing-content.ts) as a
 * connected vertical path rather than a grid of identical icon-chip cards -
 * used on both the homepage teaser and the standalone /how-it-works page so
 * the two stay visually identical as well as textually in sync. Each step
 * gets a numbered diamond waypoint (path-node) linked by a route line, so
 * "one step builds on the last" is something you see, not just read.
 */
export function JourneySteps({ steps, className }: { steps: JourneyStep[]; className?: string }) {
  return (
    <ol className={cn("mx-auto max-w-2xl", className)}>
      {steps.map((s, i) => {
        const isLast = i === steps.length - 1;
        return (
          <li key={s.title} className="flex gap-5">
            <div className="flex flex-col items-center">
              <div className="path-node h-11 w-11 shrink-0 border-accent/35 bg-accent/12 text-accent-light">
                <span className="font-mono text-sm font-semibold">{i + 1}</span>
              </div>
              {!isLast && <div className="step-track my-1 w-px flex-1" />}
            </div>
            <div className={cn("min-w-0", !isLast && "pb-10")}>
              <div className="flex items-center gap-2 pt-1.5">
                <s.icon className="h-4 w-4 text-accent-light" aria-hidden="true" />
                <h3 className="font-display text-base font-semibold tracking-tight text-ink-100">
                  {s.title.replace(/^\d+\.\s*/, "")}
                </h3>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">{s.body}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
