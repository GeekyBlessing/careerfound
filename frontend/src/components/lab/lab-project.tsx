"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Clock, ShieldAlert } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { DifficultyMeter } from "@/components/ui/difficulty-meter";
import { SkeletonCard } from "@/components/ui/skeleton";
import { api, ApiError } from "@/lib/api";
import { track, type AnalyticsEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import type { LabLink, LabProjectDetail } from "@/types/lab";
import { SectionHeading, StageBadge, StageTracker } from "./common";
import { CompletionPanel } from "./completion-panel";
import { GithubWorkflow } from "./github-workflow";
import { InterviewPrep } from "./interview-prep";
import { MilestoneList } from "./milestones";
import { ReadmeBuilder } from "./readme-builder";
import { VerificationPanel } from "./verification-panel";
import { VerifiedBadge } from "@/components/career/verified-badge";

const NAV = [
  { id: "overview", label: "Overview" },
  { id: "skills", label: "Skills and tools" },
  { id: "requirements", label: "Requirements" },
  { id: "milestones", label: "Milestones" },
  { id: "document", label: "Document" },
  { id: "github", label: "Publish to GitHub" },
  { id: "verify", label: "Get it reviewed" },
  { id: "complete", label: "Complete and portfolio" },
  { id: "interview", label: "Interview prep" },
  { id: "guidance", label: "Hints and mistakes" },
];

export function LabProjectView({ id, onNotLab }: { id: string; onNotLab: () => void }) {
  const [detail, setDetail] = useState<LabProjectDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<LabProjectDetail>(`/lab/projects/${id}`)
      .then(setDetail)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) onNotLab();
        else setError(err instanceof ApiError ? err.message : "Couldn't load this project.");
      });
  }, [id, onNotLab]);

  const act = useCallback(
    async (key: string, run: () => Promise<LabProjectDetail>, event?: AnalyticsEvent) => {
      setBusy(key);
      setActionError(null);
      try {
        setDetail(await run());
        if (event) track(event);
      } catch (err) {
        setActionError(err instanceof ApiError ? err.message : "That did not save. Try again.");
      } finally {
        setBusy(null);
      }
    },
    []
  );

  const base = `/lab/projects/${id}`;
  const tickMilestone = (key: string, done: boolean) => act(key, () => api.put<LabProjectDetail>(`${base}/milestones/${key}`, { done }));
  const tickItem = (key: string, value: boolean) => act(key, () => api.put<LabProjectDetail>(`${base}/checklist`, { items: { [key]: value } }));

  return (
    <AppShell>
      {!detail && !error && (
        <div className="space-y-6">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}
      {error && <Alert>{error}</Alert>}
      {detail && (
        <div>
          <Link
            href={`/projects?career=${detail.career.slug}`}
            className="focus-ring mb-6 inline-flex items-center gap-1.5 rounded text-xs text-ink-400 hover:text-ink-100"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Project Lab, {detail.career.name}
          </Link>

          <header>
            <p className="eyebrow">
              {detail.career.name} <span aria-hidden="true">/</span> {detail.level_label}
            </p>
            <h1 className="mt-2 max-w-3xl font-display text-h1 font-semibold tracking-tight text-ink-100">{detail.title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-400">{detail.summary}</p>
            <dl className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-3 border-y border-[rgb(var(--fg-tint)/0.1)] py-3 text-xs">
              <Meta label="Level">{detail.level_label}</Meta>
              <Meta label="Estimated time">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" /> about {detail.est_hours} hours
                </span>
              </Meta>
              <Meta label="Difficulty">
                <DifficultyMeter level={detail.difficulty} />
              </Meta>
              <Meta label="Progress">
                {detail.milestones_done} of {detail.milestones_total} milestones
              </Meta>
              <Meta label="Status">
                <span className="inline-flex flex-wrap items-center gap-2">
                  <StageBadge stage={detail.stage} label={detail.stage_label} />
                  <VerifiedBadge badge={detail.verification.badge} reviewer={detail.verification.reviewer_name} date={detail.verification.reviewed_at} size="sm" />
                </span>
              </Meta>
            </dl>
            <div className="mt-6">
              <StageTracker stages={detail.stages} />
            </div>
            {!detail.started && (
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button loading={busy === "start"} onClick={() => act("start", () => api.post<LabProjectDetail>(`${base}/start`), "lab_project_started")} className="gap-1.5">
                  Start this project <ArrowRight className="h-3.5 w-3.5" />
                </Button>
                <span className="text-xs text-ink-500">Opening a project does not count as progress. Ticking real milestones does.</span>
              </div>
            )}
          </header>

          {actionError && <Alert className="mt-6">{actionError}</Alert>}

          <div className="mt-8 lg:hidden">
            <label htmlFor="jump" className="font-mono text-[10px] uppercase tracking-wide text-ink-500">
              Jump to
            </label>
            <select
              id="jump"
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) document.getElementById(e.target.value)?.scrollIntoView({ behavior: "smooth" });
              }}
              className="focus-ring mt-1.5 w-full rounded-xl border border-[rgb(var(--fg-tint)/0.14)] bg-base-950 px-3 py-2.5 text-sm text-ink-100"
            >
              <option value="">Choose a section</option>
              {NAV.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-10 grid gap-10 lg:grid-cols-[13rem_minmax(0,1fr)]">
            <nav aria-label="In this project" className="hidden lg:block">
              <ul className="sticky top-24 space-y-1 border-l border-[rgb(var(--fg-tint)/0.12)]">
                {NAV.map((n, i) => (
                  <li key={n.id}>
                    <a href={`#${n.id}`} className="focus-ring -ml-px block border-l border-transparent py-1.5 pl-4 text-xs text-ink-400 transition-colors hover:border-accent hover:text-ink-100">
                      <span className="mr-2 font-mono text-[10px] text-ink-500">{String(i + 1).padStart(2, "0")}</span>
                      {n.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="min-w-0 space-y-14">
              <section aria-labelledby="overview">
                <SectionHeading n="01" id="overview" title="Overview" />
                <div className="mt-5 grid gap-6 md:grid-cols-3">
                  <Prose label="What you will build">{detail.overview.build}</Prose>
                  <Prose label="The problem">{detail.overview.problem}</Prose>
                  <Prose label="Why it matters">{detail.overview.why}</Prose>
                </div>
                <div className="mt-6 rounded-xl border border-accent/30 bg-accent/5 p-4">
                  <p className="font-mono text-[10px] uppercase tracking-wide text-accent-light">Your deliverable</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-100">{detail.deliverable}</p>
                </div>
                {detail.security_notes.length > 0 && (
                  <div className="mt-4 rounded-xl border border-warning/30 bg-warning/5 p-4">
                    <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wide text-warning">
                      <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" /> Safety and ethics
                    </p>
                    <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-ink-300">
                      {detail.security_notes.map((n) => (
                        <li key={n}>{n}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="mt-6 grid gap-6 sm:grid-cols-2">
                  <LinkList title="Recommended before this project" empty="No earlier project is needed. You can start here." items={detail.recommended_before} />
                  <LinkList title="You are ready for" empty="This is the end of the current path." items={detail.ready_for} />
                </div>
              </section>

              <section aria-labelledby="skills">
                <SectionHeading n="02" id="skills" title="Skills and tools" kicker="Every tool is here because the project needs it. If you cannot say what a tool does for the project, you do not need it." />
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {detail.skills.map((s) => (
                    <span key={s} className="rounded-[0.25rem] border border-[rgb(var(--fg-tint)/0.12)] px-2 py-0.5 text-xs text-ink-300">
                      {s}
                    </span>
                  ))}
                </div>
                <dl className="mt-5 divide-y divide-[rgb(var(--fg-tint)/0.08)] border-y border-[rgb(var(--fg-tint)/0.08)]">
                  {detail.tools.map((t) => (
                    <div key={t.name} className="grid gap-1 py-3 sm:grid-cols-[13rem_1fr] sm:gap-6">
                      <dt className="text-sm font-medium text-ink-100">{t.name}</dt>
                      <dd className="text-sm leading-relaxed text-ink-400">{t.reason}</dd>
                    </div>
                  ))}
                </dl>
              </section>

              <section aria-labelledby="requirements">
                <SectionHeading n="03" id="requirements" title="Requirements" kicker="Your project is finished when all of these are true of what you built." />
                <ol className="mt-5 space-y-2.5">
                  {detail.requirements.map((r, i) => (
                    <li key={r} className="flex gap-3 text-sm leading-relaxed text-ink-300">
                      <span className="mt-0.5 font-mono text-xs text-ink-500">{String(i + 1).padStart(2, "0")}</span>
                      {r}
                    </li>
                  ))}
                </ol>
              </section>

              <section aria-labelledby="milestones">
                <SectionHeading n="04" id="milestones" title="Milestones" kicker="Work through these in order. Tick a milestone when the work exists. CareerFound keeps count and never ticks for you." />
                <MilestoneList detail={detail} busy={busy} onToggle={tickMilestone} />
              </section>

              <section aria-labelledby="document">
                <SectionHeading n="05" id="document" title="Document" kicker="Documentation is part of the project, not an extra. This is what a reader sees first and what an interviewer opens." />
                <dl className="mt-5 divide-y divide-[rgb(var(--fg-tint)/0.08)] border-y border-[rgb(var(--fg-tint)/0.08)]">
                  {detail.documentation.map((d) => (
                    <div key={d.key} className="grid gap-1 py-3 sm:grid-cols-[13rem_1fr] sm:gap-6">
                      <dt className="text-sm font-medium text-ink-100">{d.title}</dt>
                      <dd className="text-sm leading-relaxed text-ink-400">{d.detail}</dd>
                    </div>
                  ))}
                </dl>
                {detail.kind === "code" && (
                  <>
                    <h3 className="mt-8 text-sm font-semibold text-ink-100">README Builder</h3>
                    <p className="mt-1 text-xs text-ink-500">Fill each section from your own project and copy the result into README.md.</p>
                    <ReadmeBuilder detail={detail} />
                  </>
                )}
              </section>

              <section aria-labelledby="github">
                <SectionHeading
                  n="06"
                  id="github"
                  title={detail.kind === "code" ? "Publish to GitHub" : "Publish"}
                  kicker="A project nobody can see does not help your career. Publish it, then check it the way a stranger would."
                />
                <GithubWorkflow
                  detail={detail}
                  busy={busy}
                  onChecklist={tickItem}
                  onSaveRepo={async (url) => act("repo", () => api.put<LabProjectDetail>(`${base}/repository`, { url }))}
                  onCheckRepo={async () => act("check", () => api.post<LabProjectDetail>(`${base}/repository/check`), "lab_repo_checked")}
                />
              </section>

              <section aria-labelledby="verify">
                <SectionHeading
                  n="07"
                  id="verify"
                  title="Get it reviewed"
                  kicker="Two different things can be true of your project. CareerFound can check that your repository exists, and a person can read the work and verify it."
                />
                <VerificationPanel detail={detail} busy={busy === "review"} onSubmit={async (note) => act("review", () => api.post<LabProjectDetail>(`${base}/submit-review`, { note }))} />
              </section>

              <section aria-labelledby="complete">
                <SectionHeading n="08" id="complete" title="Complete and add to your portfolio" kicker="Completion is based on the evidence above, not on opening the page." />
                <CompletionPanel
                  detail={detail}
                  busy={busy}
                  error={null}
                  onCriterion={tickItem}
                  onComplete={async () => act("complete", () => api.post<LabProjectDetail>(`${base}/complete`), "project_completed")}
                  onPortfolio={async () => act("portfolio", () => api.post<LabProjectDetail>(`${base}/portfolio`), "portfolio_item_generated")}
                />
              </section>

              <section aria-labelledby="interview">
                <SectionHeading n="09" id="interview" title="Interview prep" kicker="Questions an interviewer could ask about this exact project. Write answers you could say out loud." />
                <InterviewPrep
                  detail={detail}
                  saving={busy === "interview"}
                  onSave={async (answers) => {
                    await act("interview", () => api.put<LabProjectDetail>(`${base}/interview`, { answers }), "lab_interview_saved");
                  }}
                />
              </section>

              <section aria-labelledby="guidance">
                <SectionHeading n="10" id="guidance" title="Hints and common mistakes" />
                <div className="mt-5 grid gap-8 md:grid-cols-2">
                  <BulletBlock title="Hints" items={detail.hints} />
                  <BulletBlock title="Common mistakes" items={detail.common_mistakes} />
                </div>
                <p className="mt-10 border-t border-[rgb(var(--fg-tint)/0.1)] pt-4 text-xs leading-relaxed text-ink-500">{detail.evidence_note}</p>
              </section>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-wide text-ink-500">{label}</dt>
      <dd className="mt-1 text-ink-200">{children}</dd>
    </div>
  );
}

function Prose({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-mono text-[10px] uppercase tracking-wide text-ink-500">{label}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-300">{children}</p>
    </div>
  );
}

function BulletBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="font-mono text-[10px] uppercase tracking-wide text-ink-500">{title}</h3>
      <ul className="mt-3 space-y-2.5">
        {items.map((i) => (
          <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-ink-300">
            <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-accent-light" aria-hidden="true" />
            {i}
          </li>
        ))}
      </ul>
    </div>
  );
}

function LinkList({ title, empty, items }: { title: string; empty: string; items: LabLink[] }) {
  return (
    <div>
      <h3 className="font-mono text-[10px] uppercase tracking-wide text-ink-500">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-ink-500">{empty}</p>
      ) : (
        <ul className="mt-2 space-y-1.5">
          {items.map((p) => (
            <li key={p.id}>
              <Link href={`/projects/${p.id}`} className="focus-ring flex items-baseline justify-between gap-3 rounded text-sm text-ink-100 hover:text-accent-light">
                <span>{p.title}</span>
                <span className={cn("font-mono text-[10px] uppercase", p.completed ? "text-success" : "text-ink-500")}>{p.completed ? "done" : p.stage_label}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
