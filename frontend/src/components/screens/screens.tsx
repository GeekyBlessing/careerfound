import { Check, Circle, Lock, ArrowRight, Send, Shield, GitBranch, FileText, GitCommit } from "lucide-react";
import lab from "@/data/lab-cybersecurity.json";
import { DifficultyMeter } from "@/components/ui/difficulty-meter";
import { ReadinessDial } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { StageTracker } from "@/components/lab/common";
import { AppShell, Bar, Pill } from "./shell";
import {
  EXAMPLE_TAG,
  JOURNEY,
  MATCHES,
  READINESS_OVERALL,
  READINESS_SIGNALS,
  ROADMAP_ACTIVE,
  ROADMAP_PCT,
  ROADMAP_PHASES,
} from "./example";

/**
 * The real CareerFound interfaces, drawn at each device's design size.
 * They use the product's own tokens, type and components (DifficultyMeter,
 * ReadinessDial) and its real data (the Project Lab curriculum snapshot, the
 * Cybersecurity roadmap phases, the real readiness weights, the real mentor).
 * The learner and their progress are examples and are tagged as such.
 */

export const FEATURED = lab.featured;
const LEVEL_LABEL: Record<string, string> = { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced", job_ready: "Job Ready" };

/** Build and Test done, the rest still ahead: the example state used across screens. */
const STEPS = [
  { label: "Build", done: true },
  { label: "Test", done: true },
  { label: "Document", done: false },
  { label: "GitHub", done: false },
  { label: "Portfolio", done: false },
  { label: "Interview", done: false },
];
/** The six evidence stages, verbatim from the product (backend/app/seed/lab/universal.py). */
const LAB_STAGES = [
  { key: "started", label: "Started", description: "You opened the project and began.", reached: true },
  { key: "in_progress", label: "In progress", description: "At least one milestone done.", reached: true },
  { key: "completed", label: "Completed", description: "Build, test and docs done.", reached: false },
  { key: "published", label: "Published", description: "Public GitHub repo with a README.", reached: false },
  { key: "portfolio_ready", label: "Portfolio ready", description: "Published in your portfolio.", reached: false },
  { key: "interview_ready", label: "Interview ready", description: "Your own written answers.", reached: false },
] as const;
export const MILESTONES_DONE = FEATURED.milestones.filter((m) => m.stage !== "document").length;

export function Steps({ compact = false }: { compact?: boolean }) {
  return (
    <ol className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
      {STEPS.map((s) => (
        <li key={s.label} className={cn("flex items-center gap-1.5 font-medium", compact ? "text-[12px]" : "text-[13px]", s.done ? "text-ink-100" : "text-ink-500")}>
          {s.done ? (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent text-white"><Check className="h-2.5 w-2.5" strokeWidth={3} /></span>
          ) : (
            <Circle className="h-4 w-4 text-ink-500" />
          )}
          {s.label}
        </li>
      ))}
    </ol>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="font-mono text-[11px] uppercase tracking-wide text-ink-500">{children}</p>;
}

/* ------------------------------------------------------------------ */
/* Laptop: dashboard                                                  */
/* ------------------------------------------------------------------ */
export function DashboardScreen() {
  const segs = ROADMAP_PHASES;
  return (
    <AppShell active="dashboard" crumb="Dashboard">
      <Eyebrow>Cybersecurity</Eyebrow>
      <h3 className="mt-1.5 font-display text-[28px] font-semibold leading-tight tracking-tight">Phase 8 of 11 is under way.</h3>

      <div className="mt-5 grid grid-cols-[1fr_190px] gap-4">
        <div className="rounded-xl border border-[rgb(var(--fg-tint)/0.12)] p-5">
          <div className="flex items-end justify-between">
            <div>
              <Eyebrow>Roadmap</Eyebrow>
              <p className="mt-1 font-display text-[44px] font-semibold leading-none tracking-tight">{ROADMAP_PCT}%</p>
              <p className="mt-1 text-[13px] text-ink-400">Cybersecurity, complete</p>
            </div>
            <p className="text-right text-[13px] text-ink-400">
              Now: <span className="font-medium text-ink-100">{segs[ROADMAP_ACTIVE]}</span>
            </p>
          </div>
          <div className="mt-4 flex gap-1">
            {segs.map((p, i) => (
              <span
                key={p}
                className={cn("h-2 flex-1 rounded-full", i < ROADMAP_ACTIVE ? "bg-accent" : i === ROADMAP_ACTIVE ? "bg-accent-light/60" : "bg-[rgb(var(--fg-tint)/0.12)]")}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-col items-center justify-center rounded-xl border border-[rgb(var(--fg-tint)/0.12)] p-4">
          <ReadinessDial size={104} overall={READINESS_OVERALL} segments={READINESS_SIGNALS.map((r) => ({ key: r.key, label: r.label, value: r.value }))} />
          <p className="mt-2 text-[12px] font-medium text-ink-300">Career Readiness</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-[1fr_250px] gap-4">
        <div className="rounded-xl border border-accent/30 bg-accent/[0.06] p-5">
          <div className="flex items-center justify-between">
            <Eyebrow>Project Lab · Beginner</Eyebrow>
            <Pill tone="accent">In progress</Pill>
          </div>
          <p className="mt-2 font-display text-[22px] font-semibold tracking-tight">{FEATURED.title}</p>
          <div className="mt-3"><Steps compact /></div>
          <div className="mt-4 flex items-center gap-3">
            <Bar value={Math.round((MILESTONES_DONE / FEATURED.milestones.length) * 100)} />
            <span className="whitespace-nowrap font-mono text-[11px] text-ink-400">{MILESTONES_DONE} of {FEATURED.milestones.length}</span>
          </div>
        </div>
        <div className="rounded-xl border border-[rgb(var(--fg-tint)/0.12)] p-5">
          <Eyebrow>Next up</Eyebrow>
          <ul className="mt-2.5 space-y-2 text-[13px] text-ink-300">
            {["Write the README", "Capture evidence", "Publish to GitHub"].map((t) => (
              <li key={t} className="flex items-center gap-2"><Circle className="h-3.5 w-3.5 text-ink-500" />{t}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-[rgb(var(--fg-tint)/0.12)] px-5 py-3.5">
        <ol className="flex items-center justify-between">
          {JOURNEY.map((j, i) => {
            const state = i < 2 ? "done" : i < 4 ? "active" : "todo";
            return (
              <li key={j.key} className="flex items-center gap-1.5 text-[12px] font-medium">
                <span className={cn("h-2 w-2 rounded-full", state === "done" ? "bg-accent" : state === "active" ? "bg-accent-light/60 ring-2 ring-accent/30" : "bg-[rgb(var(--fg-tint)/0.18)]")} />
                <span className={state === "todo" ? "text-ink-500" : "text-ink-100"}>{j.label}</span>
              </li>
            );
          })}
        </ol>
      </div>
    </AppShell>
  );
}

/* ------------------------------------------------------------------ */
/* Tablet (landscape): the assessment                                 */
/* ------------------------------------------------------------------ */
const CHAPTERS = ["Interests", "Strengths", "Working style", "Goals", "Technology", "Direction", "Starting point"];
const OPTIONS = [
  "Designing how things look and feel",
  "Building things people use",
  "Protecting systems, or testing how they break",
  "Finding patterns in numbers",
  "Automating repetitive work",
];

export function AssessmentScreen() {
  return (
    <div className="flex h-full w-full bg-base-950 text-ink-100">
      <aside className="w-[236px] flex-shrink-0 border-r border-[rgb(var(--fg-tint)/0.1)] bg-[rgb(var(--fg-tint)/0.025)] p-6">
        <Eyebrow>Career Discovery</Eyebrow>
        <p className="mt-2 font-display text-[19px] font-semibold leading-snug tracking-tight">What kind of technology career fits you?</p>
        <ol className="mt-6 space-y-2.5">
          {CHAPTERS.map((c, i) => (
            <li key={c} className={cn("flex items-center gap-2.5 text-[13px]", i === 0 ? "font-medium text-ink-100" : "text-ink-500")}>
              <span className={cn("flex h-5 w-5 items-center justify-center rounded-full border font-mono text-[10px]", i === 0 ? "border-accent bg-accent text-white" : "border-[rgb(var(--fg-tint)/0.2)]")}>{i + 1}</span>
              {c}
            </li>
          ))}
        </ol>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col p-8">
        <div className="flex items-center gap-3">
          <p className="font-mono text-[11px] uppercase tracking-wide text-ink-500">01 / 07 · Interests</p>
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-[rgb(var(--fg-tint)/0.1)]"><div className="h-full w-[14%] rounded-full bg-accent" /></div>
        </div>
        <h3 className="mt-6 font-display text-[30px] font-semibold leading-tight tracking-tight">What could you lose a whole afternoon to?</h3>
        <ul className="mt-6 space-y-2.5">
          {OPTIONS.map((o, i) => (
            <li
              key={o}
              className={cn(
                "flex items-center justify-between rounded-lg border px-4 py-3 text-[14px] font-medium",
                i === 2 ? "border-accent bg-accent/15 text-accent-light" : "border-[rgb(var(--fg-tint)/0.12)] text-ink-300"
              )}
            >
              {o}
              {i === 2 && <Check className="h-4 w-4" />}
            </li>
          ))}
        </ul>
        <div className="mt-auto flex items-center justify-between pt-5">
          <span className="text-[12px] text-ink-500">16 questions, saved as you go</span>
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-[13px] font-medium text-white">Continue <ArrowRight className="h-3.5 w-3.5" /></span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Phone: career matches                                              */
/* ------------------------------------------------------------------ */
function PhoneTop({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="px-5 pb-3 pt-11">
      {sub && <Eyebrow>{sub}</Eyebrow>}
      <p className="mt-1 font-display text-[22px] font-semibold leading-tight tracking-tight">{title}</p>
    </div>
  );
}

export function MatchesScreen() {
  return (
    <div className="flex h-full w-full flex-col bg-base-950 text-ink-100">
      <PhoneTop sub={`Your result · ${EXAMPLE_TAG}`} title="Your strongest matches" />
      <div className="space-y-3 px-5">
        {MATCHES.map((m, i) => (
          <div key={m.name} className={cn("rounded-xl border p-4", i === 0 ? "border-warm/40 bg-warm/[0.07]" : "border-[rgb(var(--fg-tint)/0.12)]")}>
            <div className="flex items-start justify-between">
              <div>
                <p className={cn("font-mono text-[10px] uppercase tracking-wide", i === 0 ? "text-warm" : "text-ink-500")}>{m.note}</p>
                <p className="mt-1 text-[17px] font-semibold tracking-tight">{m.name}</p>
              </div>
              <p className="font-display text-[34px] font-semibold leading-none tracking-tight">{m.fit}<span className="text-[18px] text-ink-400">%</span></p>
            </div>
            <div className="mt-3"><Bar value={m.fit} className={i === 0 ? "[&>div]:bg-warm" : undefined} /></div>
          </div>
        ))}
      </div>
      <div className="mt-5 px-5">
        <Eyebrow>Your profile</Eyebrow>
        <ul className="mt-2.5 space-y-2.5">
          {[["Systems", 84], ["Problem solving", 78], ["Communication", 61]].map(([l, v]) => (
            <li key={l as string}>
              <div className="flex items-baseline justify-between text-[13px]"><span className="text-ink-300">{l}</span><span className="font-mono text-ink-400">{v}</span></div>
              <Bar className="mt-1" value={v as number} />
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-auto px-5 pb-6">
        <div className="flex items-center justify-center gap-1.5 rounded-lg bg-accent py-3 text-[14px] font-medium text-white">See your roadmap <ArrowRight className="h-4 w-4" /></div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Laptop: roadmap                                                    */
/* ------------------------------------------------------------------ */
export function RoadmapScreen() {
  const left = ROADMAP_PHASES.slice(0, 6);
  const right = ROADMAP_PHASES.slice(6);
  const row = (title: string, i: number) => {
    const state = i < ROADMAP_ACTIVE ? "done" : i === ROADMAP_ACTIVE ? "active" : "locked";
    return (
      <li key={title} className={cn("flex items-center gap-3 rounded-lg border px-3.5 py-2.5", state === "active" ? "border-accent/50 bg-accent/10" : "border-[rgb(var(--fg-tint)/0.1)]")}>
        <span className={cn("flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border font-mono text-[11px]", state === "done" ? "border-accent bg-accent text-white" : state === "active" ? "border-accent text-accent-light" : "border-[rgb(var(--fg-tint)/0.18)] text-ink-500")}>
          {state === "done" ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : state === "locked" ? <Lock className="h-3 w-3" /> : i + 1}
        </span>
        <span className={cn("flex-1 text-[14px] font-medium", state === "locked" ? "text-ink-500" : "text-ink-100")}>{title}</span>
        {state === "active" && <Pill tone="accent">In progress</Pill>}
      </li>
    );
  };
  return (
    <AppShell active="roadmap" crumb="Roadmap · Cybersecurity">
      <div className="flex items-end justify-between">
        <div>
          <Eyebrow>Your roadmap</Eyebrow>
          <h3 className="mt-1.5 font-display text-[28px] font-semibold tracking-tight">Cybersecurity</h3>
        </div>
        <div className="w-[180px]">
          <p className="text-right font-mono text-[11px] text-ink-400">{ROADMAP_PCT}% complete</p>
          <Bar className="mt-1.5" value={ROADMAP_PCT} />
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-x-4">
        <ul className="space-y-2.5">{left.map((t, i) => row(t, i))}</ul>
        <ul className="space-y-2.5">{right.map((t, i) => row(t, i + 6))}</ul>
      </div>
      <div className="mt-4 flex items-center justify-between rounded-xl border border-accent/30 bg-accent/[0.06] px-5 py-3.5">
        <div>
          <Eyebrow>Now building · Phase 8</Eyebrow>
          <p className="mt-1 font-display text-[18px] font-semibold tracking-tight">Cloud Security Posture Checker</p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-accent-light">Open project <ArrowRight className="h-3.5 w-3.5" /></span>
      </div>
    </AppShell>
  );
}

/* ------------------------------------------------------------------ */
/* Monitor: the Project Lab curriculum                                */
/* ------------------------------------------------------------------ */
export function LabCurriculumScreen() {
  return (
    <AppShell active="lab" crumb="Project Lab · Cybersecurity">
      <div className="flex items-end justify-between">
        <div>
          <Eyebrow>Cybersecurity · {lab.levels.reduce((n, l) => n + l.projects.length, 0)} projects</Eyebrow>
          <h3 className="mt-1.5 font-display text-[30px] font-semibold tracking-tight">Build the proof, level by level.</h3>
        </div>
        <p className="max-w-[300px] text-right text-[12px] leading-snug text-ink-500">CareerFound checks that your evidence exists. It does not run or grade your code.</p>
      </div>
      <div className="mt-5 grid grid-cols-4 gap-4">
        {lab.levels.map((lv) => (
          <div key={lv.level}>
            <div className="border-b border-[rgb(var(--fg-tint)/0.16)] pb-2">
              <p className="font-display text-[17px] font-semibold tracking-tight">{LEVEL_LABEL[lv.level]}</p>
              <p className="font-mono text-[10px] uppercase tracking-wide text-ink-500">{lv.projects.length} {lv.projects.length === 1 ? "project" : "projects"}</p>
            </div>
            <ul className="mt-2.5 space-y-2">
              {lv.projects.map((p) => {
                const featured = p.slug === FEATURED.slug;
                return (
                  <li key={p.slug} className={cn("rounded-lg border p-3", featured ? "border-accent/50 bg-accent/10" : "border-[rgb(var(--fg-tint)/0.1)]")}>
                    <p className="text-[13px] font-semibold leading-snug">{p.title}</p>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-ink-500">
                      <DifficultyMeter level={p.difficulty} />
                      <span className="font-mono">{p.est_hours} h</span>
                    </div>
                    {featured && <p className="mt-2 font-mono text-[10px] uppercase tracking-wide text-accent-light">In progress</p>}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-5 border-t border-[rgb(var(--fg-tint)/0.12)] pt-4">
        <Eyebrow>How every project progresses</Eyebrow>
        <div className="mt-2.5">
          <StageTracker stages={[...LAB_STAGES]} />
        </div>
      </div>
    </AppShell>
  );
}

/* ------------------------------------------------------------------ */
/* Laptop: a Project Lab workspace                                    */
/* ------------------------------------------------------------------ */
export function WorkspaceScreen() {
  const ms = FEATURED.milestones;
  const half = Math.ceil(ms.length / 2);
  const col = (items: typeof ms, offset: number) => (
    <ul className="space-y-1.5">
      {items.map((m, i) => {
        const done = m.stage !== "document";
        return (
          <li key={m.title} className="flex items-center gap-2.5 text-[13px]">
            <span className={cn("flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-[0.2rem] border", done ? "border-accent bg-accent text-white" : "border-[rgb(var(--fg-tint)/0.25)]")}>
              {done && <Check className="h-3 w-3" strokeWidth={3} />}
            </span>
            <span className={done ? "text-ink-200" : "text-ink-400"}>{offset + i + 1}. {m.title}</span>
          </li>
        );
      })}
    </ul>
  );
  return (
    <AppShell active="lab" crumb="Project Lab · Beginner">
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <Eyebrow>Beginner · Cybersecurity</Eyebrow>
          <h3 className="mt-1.5 font-display text-[30px] font-semibold leading-tight tracking-tight">{FEATURED.title}</h3>
        </div>
        <Pill tone="accent" className="mt-1 flex-shrink-0">In progress</Pill>
      </div>
      <p className="mt-2 max-w-[640px] text-[14px] leading-relaxed text-ink-400">{FEATURED.summary}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {["Nmap", "Python 3", ...FEATURED.skills.slice(0, 2)].map((s) => <Pill key={s}>{s}</Pill>)}
      </div>
      <div className="mt-5 rounded-xl border border-[rgb(var(--fg-tint)/0.12)] p-4"><Steps /></div>
      <div className="mt-5 grid grid-cols-[1fr_226px] gap-4">
        <div className="rounded-xl border border-[rgb(var(--fg-tint)/0.12)] p-4">
          <Eyebrow>Milestones · {MILESTONES_DONE} of {ms.length}</Eyebrow>
          <div className="mt-2.5 grid grid-cols-2 gap-x-4">{col(ms.slice(0, half), 0)}{col(ms.slice(half), half)}</div>
        </div>
        <div className="rounded-xl border border-[rgb(var(--fg-tint)/0.12)] p-4">
          <Eyebrow>Evidence</Eyebrow>
          <ul className="mt-2.5 space-y-2 text-[13px] text-ink-300">
            <li className="flex items-center gap-2"><GitBranch className="h-3.5 w-3.5 text-ink-500" /> Public repository</li>
            <li className="flex items-center gap-2"><FileText className="h-3.5 w-3.5 text-ink-500" /> README</li>
            <li className="flex items-center gap-2"><GitCommit className="h-3.5 w-3.5 text-ink-500" /> 3 or more commits</li>
          </ul>
          <p className="mt-3 border-t border-[rgb(var(--fg-tint)/0.1)] pt-2.5 text-[11px] leading-snug text-ink-500">Checked when you publish.</p>
        </div>
      </div>
    </AppShell>
  );
}

/* ------------------------------------------------------------------ */
/* Laptop: the portfolio                                              */
/* ------------------------------------------------------------------ */
const PORTFOLIO_PICKS = ["network-recon-tool", "cloud-attack-path-analyzer", "siem-detection-lab"];

export function PortfolioScreen() {
  const all = lab.levels.flatMap((l) => l.projects.map((p) => ({ ...p, level: l.level })));
  const picks = PORTFOLIO_PICKS.map((s) => all.find((p) => p.slug === s)).filter((p): p is (typeof all)[number] => Boolean(p));
  // Skill names that all appear in the live curriculum's tools and skills.
  const skills = ["AWS", "Python", "Terraform", "Nmap", "Elastic", "Cloud Security"];
  return (
    <AppShell active="portfolio" crumb="Portfolio">
      <div className="flex items-end justify-between">
        <div>
          <Eyebrow>My portfolio</Eyebrow>
          <h3 className="mt-1.5 font-display text-[30px] font-semibold tracking-tight">Cybersecurity Engineer</h3>
        </div>
        <Pill tone="success">Published</Pill>
      </div>
      <div className="mt-5 grid min-h-[256px] grid-cols-3 gap-4">
        {picks.map((p) => (
          <div key={p.slug} className="flex flex-col rounded-xl border border-[rgb(var(--fg-tint)/0.12)] p-4">
            <div className="flex items-center justify-between">
              <Pill>{LEVEL_LABEL[p.level]}</Pill>
              <Shield className="h-4 w-4 text-accent-light" />
            </div>
            <p className="mt-3 font-display text-[19px] font-semibold leading-snug tracking-tight">{p.title}</p>
            <p className="mt-2 line-clamp-4 text-[12px] leading-relaxed text-ink-400">{p.summary}</p>
            <div className="mt-3"><Pill tone="success">Interview ready</Pill></div>
            <div className="mt-auto flex gap-4 border-t border-[rgb(var(--fg-tint)/0.1)] pt-3 text-[12px] font-medium text-accent-light">
              <span>GitHub</span>
              <span>README</span>
              <span>Case study</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-[1fr_auto] items-end gap-6 border-t border-[rgb(var(--fg-tint)/0.12)] pt-4">
        <div>
          <Eyebrow>Skills</Eyebrow>
          <div className="mt-2 flex flex-wrap gap-1.5">{skills.map((s) => <Pill key={s} tone="accent">{s}</Pill>)}</div>
        </div>
        <div className="text-right">
          <Eyebrow>Target role</Eyebrow>
          <p className="mt-1 text-[14px] font-semibold">Junior Security Analyst</p>
        </div>
      </div>
    </AppShell>
  );
}

/* ------------------------------------------------------------------ */
/* Phone: the AI Mentor                                               */
/* ------------------------------------------------------------------ */
export function MentorChatScreen() {
  const bubble = "max-w-[84%] rounded-2xl px-3.5 py-2.5 text-[14px] leading-relaxed";
  return (
    <div className="flex h-full w-full flex-col bg-base-950 text-ink-100">
      <PhoneTop sub="AI Mentor" title="Cybersecurity · Cloud Security" />
      <div className="flex-1 space-y-3 overflow-hidden px-5">
        <div className={cn(bubble, "rounded-bl-md bg-[rgb(var(--fg-tint)/0.07)] text-ink-200")}>What are you currently working on?</div>
        <div className={cn(bubble, "ml-auto rounded-br-md bg-accent text-white")}>I&apos;m struggling with my AWS security project.</div>
        <div className={cn(bubble, "rounded-bl-md bg-[rgb(var(--fg-tint)/0.07)] text-ink-200")}>
          Let&apos;s break it down. Which part is fighting you: who is allowed in, what gets logged, or what can reach what?
        </div>
        <div className={cn(bubble, "ml-auto rounded-br-md bg-accent text-white")}>Who is allowed in. My IAM policy is too broad.</div>
        <div className={cn(bubble, "rounded-bl-md bg-[rgb(var(--fg-tint)/0.07)] text-ink-200")}>
          Good instinct. Start with one question: what is the least this role needs to do its job?
        </div>
        <div className={cn(bubble, "ml-auto rounded-br-md bg-accent text-white")}>It only needs to read one bucket and write logs.</div>
        <div className={cn(bubble, "rounded-bl-md bg-[rgb(var(--fg-tint)/0.07)] text-ink-200")}>
          Then write the policy for exactly that, nothing more. Want to try the first line?
        </div>
      </div>
      <div className="px-5 pb-6 pt-3">
        <div className="mb-2.5 flex gap-2">
          <Pill tone="accent">Give me a hint</Pill>
          <Pill>Review my policy</Pill>
        </div>
        <div className="flex items-center justify-between rounded-full border border-[rgb(var(--fg-tint)/0.16)] px-4 py-2.5 text-[13px] text-ink-500">
          Ask for a hint
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-white"><Send className="h-3.5 w-3.5" /></span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tablet (landscape): documenting and publishing                     */
/* ------------------------------------------------------------------ */
export function PublishScreen() {
  const checks = [
    { icon: GitBranch, label: "Public repository", detail: "github.com/your-name/network-recon-tool" },
    { icon: FileText, label: "README present", detail: "Explains the tool and the legal limits of scanning" },
    { icon: GitCommit, label: "At least 3 commits", detail: "A real history, not one upload" },
  ];
  return (
    <div className="flex h-full w-full flex-col bg-base-950 p-7 text-ink-100">
      <div className="flex items-center justify-between">
        <Eyebrow>Project Lab · Publish</Eyebrow>
        <p className="rounded-[0.25rem] border border-[rgb(var(--fg-tint)/0.14)] px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-ink-500">{EXAMPLE_TAG}</p>
      </div>
      <h3 className="mt-2 font-display text-[28px] font-semibold leading-tight tracking-tight">Put the work where people can see it.</h3>
      <div className="mt-5 grid flex-1 grid-cols-[1.1fr_1fr] gap-5">
        <ul className="space-y-3">
          {checks.map((c) => (
            <li key={c.label} className="flex items-start gap-3 rounded-xl border border-[rgb(var(--fg-tint)/0.12)] p-4">
              <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-success/20 text-success"><Check className="h-3.5 w-3.5" strokeWidth={3} /></span>
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-[14px] font-semibold"><c.icon className="h-3.5 w-3.5 text-ink-400" />{c.label}</p>
                <p className="mt-0.5 truncate font-mono text-[11px] text-ink-500">{c.detail}</p>
              </div>
            </li>
          ))}
          <li className="flex items-center justify-between rounded-xl border border-success/40 bg-success/10 px-4 py-3">
            <span className="text-[13px] font-medium text-ink-100">Stage reached</span>
            <Pill tone="success">Published</Pill>
          </li>
        </ul>
        <div className="rounded-xl border border-[rgb(var(--fg-tint)/0.12)] bg-[rgb(var(--fg-tint)/0.03)] p-4 font-mono text-[12px] leading-relaxed text-ink-300">
          <p className="text-ink-100"># Network Reconnaissance Tool</p>
          <p className="mt-2 text-ink-400">A Python scanner for hosts you own. It reports open TCP ports and refuses addresses you did not confirm.</p>
          <p className="mt-3 text-ink-100">## Usage</p>
          <p className="mt-1 text-accent-light">$ python scan.py 127.0.0.1 --ports 1-1024</p>
          <p className="mt-3 text-ink-100">## Legal limits</p>
          <p className="mt-1 text-ink-400">Only scan systems you own or have written permission to test.</p>
          <p className="mt-4 border-t border-[rgb(var(--fg-tint)/0.12)] pt-3 text-ink-100">$ git log --oneline</p>
          <p className="mt-1 text-ink-400">a41c9e2 Add README and sample report</p>
          <p className="text-ink-400">7d02b18 Compare results with Nmap</p>
          <p className="text-ink-400">c93f7a0 Add banner grabbing</p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Phone: interview preparation                                       */
/* ------------------------------------------------------------------ */
export function InterviewScreen() {
  const qs = FEATURED.interview.slice(0, 3);
  return (
    <div className="flex h-full w-full flex-col bg-base-950 text-ink-100">
      <PhoneTop sub={`Interview · ${FEATURED.title}`} title="Answer in your own words." />
      <div className="space-y-3 px-5">
        <div className="rounded-xl border border-accent/40 bg-accent/[0.07] p-4">
          <p className="text-[14px] font-semibold leading-snug">{qs[0]}</p>
          <div className="mt-3 space-y-1.5">
            <div className="h-2 w-full rounded-full bg-[rgb(var(--fg-tint)/0.16)]" />
            <div className="h-2 w-[92%] rounded-full bg-[rgb(var(--fg-tint)/0.16)]" />
            <div className="h-2 w-[70%] rounded-full bg-[rgb(var(--fg-tint)/0.16)]" />
          </div>
          <p className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-success"><Check className="h-3 w-3" strokeWidth={3} /> Answer saved</p>
        </div>
        {qs.slice(1).map((q) => (
          <div key={q} className="rounded-xl border border-[rgb(var(--fg-tint)/0.12)] p-4">
            <p className="text-[13px] leading-snug text-ink-300">{q}</p>
          </div>
        ))}
        <div className="rounded-xl border border-[rgb(var(--fg-tint)/0.12)] p-4">
          <p className="text-[13px] leading-snug text-ink-300">{FEATURED.interview[3]}</p>
        </div>
      </div>
      <div className="mt-auto px-5 pb-6">
        <div className="flex items-center justify-between text-[12px] text-ink-400"><span>1 of {FEATURED.interview.length} answered</span><span className="font-mono">{Math.round(100 / FEATURED.interview.length)}%</span></div>
        <Bar className="mt-1.5" value={Math.round(100 / FEATURED.interview.length)} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Phone: readiness                                                   */
/* ------------------------------------------------------------------ */
export function ReadinessScreen() {
  return (
    <div className="flex h-full w-full flex-col bg-base-950 text-ink-100">
      <PhoneTop sub={`Job ready · ${EXAMPLE_TAG}`} title="Career Readiness" />
      <div className="flex justify-center py-2">
        <ReadinessDial size={170} overall={READINESS_OVERALL} segments={READINESS_SIGNALS.map((r) => ({ key: r.key, label: r.label, value: r.value }))} />
      </div>
      <ul className="mt-2 space-y-3 px-5">
        {READINESS_SIGNALS.map((r) => (
          <li key={r.key}>
            <div className="flex items-baseline justify-between text-[13px]">
              <span className="text-ink-300">{r.label}</span>
              <span className="font-mono text-ink-400">{r.value}%</span>
            </div>
            <Bar className="mt-1.5" value={r.value} />
          </li>
        ))}
      </ul>
      <div className="mx-5 mb-6 mt-auto rounded-xl border border-accent/30 bg-accent/[0.07] p-3.5">
        <p className="font-mono text-[10px] uppercase tracking-wide text-accent-light">What would move it up</p>
        <p className="mt-1 text-[13px] leading-snug text-ink-200">Write your interview answers for the Network Reconnaissance Tool.</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Phone: requesting mentorship from a real mentor                    */
/* ------------------------------------------------------------------ */
export function MentorshipScreen() {
  return (
    <div className="flex h-full w-full flex-col bg-base-950 text-ink-100">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/mentors/toriola.jpg" alt="" className="h-[330px] w-full object-cover object-top" />
      <div className="flex flex-1 flex-col px-5 pb-6 pt-4">
        <p className="font-display text-[22px] font-semibold tracking-tight">Toriola Opeyemi</p>
        <p className="mt-0.5 text-[13px] text-ink-400">Cybersecurity, Cloud Security & DevOps Mentor</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {["Cloud Security", "AWS Security", "DevSecOps"].map((t) => <Pill key={t} tone="warm">{t}</Pill>)}
        </div>
        <p className="mt-3 text-[13px] leading-relaxed text-ink-400">One-on-one mentorship for cloud and security careers: your roadmap, hands-on projects, portfolio review and interview preparation.</p>
        <p className="mt-3 text-[13px] text-ink-300"><span className="text-[20px] font-semibold text-ink-100">$200</span> or &#8358;250,000 for 2 months</p>
        <div className="mt-auto flex items-center justify-center gap-1.5 rounded-lg bg-accent py-3 text-[14px] font-medium text-white">Request mentorship <ArrowRight className="h-4 w-4" /></div>
      </div>
    </div>
  );
}

export { JOURNEY };

/* ------------------------------------------------------------------ */
/* Phone recompositions of the laptop screens (for narrow viewports)  */
/* ------------------------------------------------------------------ */
export function PhoneRoadmapScreen() {
  return (
    <div className="flex h-full w-full flex-col bg-base-950 text-ink-100">
      <PhoneTop sub={`Roadmap · ${EXAMPLE_TAG}`} title="Cybersecurity" />
      <div className="px-5">
        <div className="flex items-center gap-3">
          <Bar value={ROADMAP_PCT} />
          <span className="whitespace-nowrap font-mono text-[11px] text-ink-400">{ROADMAP_PCT}%</span>
        </div>
      </div>
      <ul className="mt-3 flex-1 space-y-1.5 overflow-hidden px-5">
        {ROADMAP_PHASES.map((t, i) => {
          const state = i < ROADMAP_ACTIVE ? "done" : i === ROADMAP_ACTIVE ? "active" : "locked";
          return (
            <li key={t} className={cn("flex items-center gap-2.5 rounded-lg border px-3 py-2", state === "active" ? "border-accent/50 bg-accent/10" : "border-[rgb(var(--fg-tint)/0.1)]")}>
              <span className={cn("flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border font-mono text-[10px]", state === "done" ? "border-accent bg-accent text-white" : state === "active" ? "border-accent text-accent-light" : "border-[rgb(var(--fg-tint)/0.18)] text-ink-500")}>
                {state === "done" ? <Check className="h-3 w-3" strokeWidth={3} /> : state === "locked" ? <Lock className="h-2.5 w-2.5" /> : i + 1}
              </span>
              <span className={cn("flex-1 text-[13px] font-medium", state === "locked" ? "text-ink-500" : "text-ink-100")}>{t}</span>
            </li>
          );
        })}
      </ul>
      <div className="mx-5 mb-6 rounded-xl border border-accent/30 bg-accent/[0.06] px-4 py-3">
        <Eyebrow>Now building · Phase 8</Eyebrow>
        <p className="mt-1 font-display text-[16px] font-semibold tracking-tight">Cloud Security Posture Checker</p>
      </div>
    </div>
  );
}

export function PhoneLabScreen() {
  const ms = FEATURED.milestones;
  return (
    <div className="flex h-full w-full flex-col bg-base-950 text-ink-100">
      <PhoneTop sub={`Project Lab · Beginner · ${EXAMPLE_TAG}`} title={FEATURED.title} />
      <div className="px-5">
        <div className="flex flex-wrap gap-1.5">{["Nmap", "Python 3", ...FEATURED.skills.slice(0, 2)].map((s) => <Pill key={s}>{s}</Pill>)}</div>
        <div className="mt-4 rounded-xl border border-[rgb(var(--fg-tint)/0.12)] p-3.5"><Steps compact /></div>
        <div className="mt-3 flex items-center gap-3">
          <Bar value={Math.round((MILESTONES_DONE / ms.length) * 100)} />
          <span className="whitespace-nowrap font-mono text-[11px] text-ink-400">{MILESTONES_DONE} of {ms.length}</span>
        </div>
      </div>
      <ul className="mt-4 flex-1 space-y-2 overflow-hidden px-5">
        {ms.slice(4).map((m) => {
          const done = m.stage !== "document";
          return (
            <li key={m.title} className="flex items-center gap-2.5 text-[13px]">
              <span className={cn("flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-[0.2rem] border", done ? "border-accent bg-accent text-white" : "border-[rgb(var(--fg-tint)/0.25)]")}>
                {done && <Check className="h-3 w-3" strokeWidth={3} />}
              </span>
              <span className={done ? "text-ink-200" : "text-ink-400"}>{m.title}</span>
            </li>
          );
        })}
      </ul>
      <div className="h-6" />
    </div>
  );
}

export function PhonePortfolioScreen() {
  const all = lab.levels.flatMap((l) => l.projects.map((p) => ({ ...p, level: l.level })));
  const picks = PORTFOLIO_PICKS.map((s) => all.find((p) => p.slug === s)).filter((p): p is (typeof all)[number] => Boolean(p));
  return (
    <div className="flex h-full w-full flex-col bg-base-950 text-ink-100">
      <PhoneTop sub="My portfolio" title="Cybersecurity Engineer" />
      <ul className="flex-1 space-y-3 overflow-hidden px-5">
        {picks.map((p) => (
          <li key={p.slug} className="rounded-xl border border-[rgb(var(--fg-tint)/0.12)] p-3.5">
            <div className="flex items-center justify-between"><Pill>{LEVEL_LABEL[p.level]}</Pill><Pill tone="success">Interview ready</Pill></div>
            <p className="mt-2 font-display text-[17px] font-semibold leading-snug tracking-tight">{p.title}</p>
            <p className="mt-2 flex gap-3 text-[12px] font-medium text-accent-light"><span>GitHub</span><span>README</span><span>Case study</span></p>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-1.5 px-5 pb-6 pt-3">{["AWS", "Python", "Terraform", "Cloud Security"].map((s) => <Pill key={s} tone="accent">{s}</Pill>)}</div>
    </div>
  );
}

export function PhoneAssessmentScreen() {
  return (
    <div className="flex h-full w-full flex-col bg-base-950 text-ink-100">
      <PhoneTop sub="Career Discovery · 01 / 07" title="What kind of technology career fits you?" />
      <div className="px-5">
        <div className="h-1 overflow-hidden rounded-full bg-[rgb(var(--fg-tint)/0.1)]"><div className="h-full w-[14%] rounded-full bg-accent" /></div>
        <p className="mt-5 font-display text-[19px] font-semibold leading-snug tracking-tight text-ink-200">What could you lose a whole afternoon to?</p>
      </div>
      <ul className="mt-4 flex-1 space-y-2 overflow-hidden px-5">
        {OPTIONS.map((o, i) => (
          <li key={o} className={cn("flex items-center justify-between rounded-lg border px-3.5 py-3 text-[13px] font-medium", i === 2 ? "border-accent bg-accent/15 text-accent-light" : "border-[rgb(var(--fg-tint)/0.12)] text-ink-300")}>
            {o}
            {i === 2 && <Check className="h-4 w-4 flex-shrink-0" />}
          </li>
        ))}
      </ul>
      <div className="px-5 pb-6 pt-3">
        <div className="flex items-center justify-center gap-1.5 rounded-lg bg-accent py-3 text-[14px] font-medium text-white">Continue <ArrowRight className="h-4 w-4" /></div>
      </div>
    </div>
  );
}
