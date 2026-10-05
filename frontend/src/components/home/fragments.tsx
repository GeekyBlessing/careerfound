import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Bar, Pill } from "@/components/screens/shell";
import { FEATURED, MILESTONES_DONE, Steps } from "@/components/screens/screens";
import { MATCHES, ROADMAP_ACTIVE, ROADMAP_PCT, ROADMAP_PHASES } from "@/components/screens/example";

/**
 * Pieces of the real interface lifted out of the device screens and set at
 * full size beside them, so a detail (a match score, a project's progress, a
 * skill list) is readable at a glance while the device carries the wider
 * context. Each fragment is anchored to a specific edge of its device by the
 * composition that uses it, never scattered.
 */
export function Fragment({ className, children, label }: { className?: string; children: React.ReactNode; label: string }) {
  return (
    <div
      role="img"
      aria-label={label}
      className={cn("rounded-xl border border-[rgb(var(--fg-tint)/0.14)] bg-base-950 p-4 shadow-raised", className)}
    >
      <div aria-hidden="true">{children}</div>
    </div>
  );
}

const eyebrow = "font-mono text-[10px] uppercase tracking-wide text-ink-500";

export function MatchFragment({ className }: { className?: string }) {
  const top = MATCHES[0]!;
  return (
    <Fragment className={className} label={`Career match example: ${top.name} ${top.fit} percent`}>
      <p className={eyebrow}>Best match</p>
      <div className="mt-1.5 flex items-end justify-between gap-6">
        <p className="text-[15px] font-semibold tracking-tight text-ink-100">{top.name}</p>
        <p className="font-display text-3xl font-semibold leading-none text-ink-100">{top.fit}<span className="text-base text-ink-400">%</span></p>
      </div>
      <Bar className="mt-3 [&>div]:bg-warm" value={top.fit} />
    </Fragment>
  );
}

export function RoadmapFragment({ className }: { className?: string }) {
  return (
    <Fragment className={className} label={`Roadmap example: ${ROADMAP_PCT} percent complete, now ${ROADMAP_PHASES[ROADMAP_ACTIVE]}`}>
      <p className={eyebrow}>Cybersecurity roadmap</p>
      <div className="mt-1.5 flex items-baseline justify-between gap-6">
        <p className="font-display text-3xl font-semibold leading-none text-ink-100">{ROADMAP_PCT}%</p>
        <p className="text-xs text-ink-400">Phase {ROADMAP_ACTIVE + 1} of {ROADMAP_PHASES.length}</p>
      </div>
      <div className="mt-3 flex gap-0.5">
        {ROADMAP_PHASES.map((p, i) => (
          <span key={p} className={cn("h-1.5 flex-1 rounded-full", i < ROADMAP_ACTIVE ? "bg-accent" : i === ROADMAP_ACTIVE ? "bg-accent-light/60" : "bg-[rgb(var(--fg-tint)/0.14)]")} />
        ))}
      </div>
      <p className="mt-2 text-xs font-medium text-ink-200">{ROADMAP_PHASES[ROADMAP_ACTIVE]}</p>
    </Fragment>
  );
}

export function ProjectFragment({ className }: { className?: string }) {
  return (
    <Fragment className={className} label="Project progress example: Network Reconnaissance Tool, build and test done">
      <p className={eyebrow}>Project Lab · Beginner</p>
      <p className="mt-1.5 text-[15px] font-semibold tracking-tight text-ink-100">{FEATURED.title}</p>
      <div className="mt-3"><Steps compact /></div>
      <div className="mt-3 flex items-center gap-2.5">
        <Bar value={Math.round((MILESTONES_DONE / FEATURED.milestones.length) * 100)} />
        <span className="whitespace-nowrap font-mono text-[10px] text-ink-400">{MILESTONES_DONE} of {FEATURED.milestones.length}</span>
      </div>
    </Fragment>
  );
}

export function SkillsFragment({ className }: { className?: string }) {
  return (
    <Fragment className={className} label="Skills example: Nmap, Python, Networking, Linux">
      <p className={eyebrow}>Skills you are building</p>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {["Nmap", "Python", "Networking", "Linux"].map((s) => <Pill key={s} tone="accent">{s}</Pill>)}
      </div>
    </Fragment>
  );
}

export function PortfolioFragment({ className }: { className?: string }) {
  return (
    <Fragment className={className} label="Portfolio example: three published projects">
      <p className={eyebrow}>My portfolio</p>
      <ul className="mt-2 space-y-1.5">
        {["Network Reconnaissance Tool", "Cloud Attack Path Analyzer", "SIEM Detection Lab"].map((t) => (
          <li key={t} className="flex items-center gap-2 text-[13px] text-ink-200"><Check className="h-3.5 w-3.5 text-success" strokeWidth={3} />{t}</li>
        ))}
      </ul>
    </Fragment>
  );
}


const STAGES: { label: string; reached: boolean }[] = [
  { label: "Started", reached: true },
  { label: "In progress", reached: true },
  { label: "Completed", reached: true },
  { label: "Published", reached: true },
  { label: "Portfolio ready", reached: false },
  { label: "Interview ready", reached: false },
];

/** Where a project stands among the six real evidence stages, and what is left. */
export function StageFragment({ className }: { className?: string }) {
  return (
    <Fragment className={className} label="Project stage example: published, with portfolio ready and interview ready still ahead">
      <p className={eyebrow}>Project stage</p>
      <ol className="mt-2 space-y-1.5">
        {STAGES.map((st) => (
          <li key={st.label} className={cn("flex items-center gap-2 text-[13px]", st.reached ? "text-ink-100" : "text-ink-500")}>
            {st.reached ? (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent text-white"><Check className="h-2.5 w-2.5" strokeWidth={3} /></span>
            ) : (
              <Circle className="h-4 w-4" />
            )}
            {st.label}
          </li>
        ))}
      </ol>
    </Fragment>
  );
}
