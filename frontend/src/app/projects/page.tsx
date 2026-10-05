"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Clock } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DifficultyMeter } from "@/components/ui/difficulty-meter";
import { ProgressBar } from "@/components/ui/progress";
import { SkeletonCard } from "@/components/ui/skeleton";
import { StageBadge } from "@/components/lab/common";
import { api, ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { RoleProjectCatalogEntry } from "@/types";
import type { LabCareerOption, LabCurriculum, LabProjectSummary } from "@/types/lab";

export default function ProjectLabPage() {
  return (
    <Suspense fallback={null}>
      <ProjectLab />
    </Suspense>
  );
}

function ProjectLab() {
  const router = useRouter();
  const params = useSearchParams();
  const requested = params.get("career");

  const [catalog, setCatalog] = useState<RoleProjectCatalogEntry[] | null>(null);
  const [labCareers, setLabCareers] = useState<LabCareerOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [curriculum, setCurriculum] = useState<LabCurriculum | null>(null);
  const [loadingCurriculum, setLoadingCurriculum] = useState(false);

  useEffect(() => {
    Promise.all([api.get<RoleProjectCatalogEntry[]>("/careers/projects/catalog"), api.get<LabCareerOption[]>("/lab/careers")])
      .then(([c, l]) => {
        setCatalog(c);
        setLabCareers(l);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load the Project Lab."));
  }, []);

  const labSlugs = useMemo(() => new Set(labCareers.map((c) => c.slug)), [labCareers]);
  const selected = useMemo(() => {
    if (!catalog) return null;
    if (requested && catalog.some((e) => e.path.slug === requested)) return requested;
    return labCareers[0]?.slug ?? catalog[0]?.path.slug ?? null;
  }, [catalog, requested, labCareers]);

  useEffect(() => {
    setCurriculum(null);
    if (!selected || !labSlugs.has(selected)) return;
    setLoadingCurriculum(true);
    api
      .get<LabCurriculum>(`/lab/careers/${selected}`)
      .then(setCurriculum)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load this curriculum."))
      .finally(() => setLoadingCurriculum(false));
  }, [selected, labSlugs]);

  const entry = catalog?.find((e) => e.path.slug === selected) ?? null;
  const flat = curriculum?.levels.flatMap((l) => l.projects) ?? [];
  const titles = Object.fromEntries(flat.map((p) => [p.id, p.title]));

  return (
    <AppShell>
      <div className="space-y-10">
        <header className="max-w-3xl">
          <p className="eyebrow">Project Lab</p>
          <h1 className="mt-2 font-display text-h1 font-semibold tracking-tight text-ink-100">Build the projects that make you hireable</h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-400">
            Every career has its own project path, from a first small tool to a flagship you can talk about for most of an interview. Each project teaches real skills,
            produces something you can publish, and ends with documentation, a portfolio entry and interview answers in your own words.
          </p>
        </header>

        {error && <Alert>{error}</Alert>}
        {!catalog && !error && <SkeletonCard />}

        {catalog && (
          <div className="flex flex-col gap-4 border-y border-[rgb(var(--fg-tint)/0.1)] py-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="sm:w-80">
              <label htmlFor="lab-career" className="font-mono text-[10px] uppercase tracking-wide text-ink-500">
                Career
              </label>
              <select
                id="lab-career"
                value={selected ?? ""}
                onChange={(e) => router.replace(`/projects?career=${e.target.value}`)}
                className="focus-ring mt-1.5 w-full rounded-xl border border-[rgb(var(--fg-tint)/0.14)] bg-base-950 px-3 py-2.5 text-sm text-ink-100"
              >
                <optgroup label="Full project curriculum">
                  {catalog.filter((e) => labSlugs.has(e.path.slug)).map((e) => (
                    <option key={e.path.slug} value={e.path.slug}>
                      {e.path.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Guided projects, curriculum coming">
                  {catalog.filter((e) => !labSlugs.has(e.path.slug)).map((e) => (
                    <option key={e.path.slug} value={e.path.slug}>
                      {e.path.name}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
            {curriculum?.available && curriculum.totals && (
              <dl className="flex flex-wrap gap-x-7 gap-y-3 text-xs">
                <Stat label="Projects" value={curriculum.totals.projects ?? 0} />
                <Stat label="Completed" value={curriculum.totals.completed ?? 0} />
                <Stat label="Published" value={curriculum.totals.published ?? 0} />
                <Stat label="In portfolio" value={curriculum.totals.portfolio_ready ?? 0} />
                <Stat label="Interview ready" value={curriculum.totals.interview_ready ?? 0} />
              </dl>
            )}
          </div>
        )}

        {loadingCurriculum && <SkeletonCard />}

        {curriculum?.available && (
          <div className="space-y-14">
            <NextUp curriculum={curriculum} flat={flat} />
            {curriculum.levels.map((level, li) => (
              <section key={level.level} aria-labelledby={`level-${level.level}`}>
                <div className="flex flex-wrap items-end justify-between gap-3 border-t border-[rgb(var(--fg-tint)/0.14)] pt-5">
                  <div className="max-w-2xl">
                    <p className="font-mono text-xs text-ink-500">{String(li + 1).padStart(2, "0")}</p>
                    <h2 id={`level-${level.level}`} className="mt-1 font-display text-h2 font-semibold tracking-tight text-ink-100">
                      {level.label}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-ink-400">{level.blurb}</p>
                  </div>
                  <p className="font-mono text-[11px] text-ink-500">
                    {level.projects.filter((p) => p.flags.completed).length} of {level.projects.length} complete
                  </p>
                </div>
                <ol className="mt-4 divide-y divide-[rgb(var(--fg-tint)/0.08)] border-b border-[rgb(var(--fg-tint)/0.08)]">
                  {level.projects.map((p, i) => (
                    <ProjectRow key={p.id} p={p} n={i + 1} titles={titles} />
                  ))}
                </ol>
              </section>
            ))}
            {curriculum.evidence_note && <p className="max-w-3xl border-t border-[rgb(var(--fg-tint)/0.1)] pt-4 text-xs leading-relaxed text-ink-500">{curriculum.evidence_note}</p>}
          </div>
        )}

        {entry && !labSlugs.has(entry.path.slug) && <GuidedProjects entry={entry} />}
      </div>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-wide text-ink-500">{label}</dt>
      <dd className="mt-1 font-display text-xl font-semibold text-ink-100">{value}</dd>
    </div>
  );
}

function NextUp({ curriculum, flat }: { curriculum: LabCurriculum; flat: LabProjectSummary[] }) {
  const current = flat.find((p) => p.flags.started && !p.flags.completed);
  const next = flat.find((p) => p.id === curriculum.next_project_id);
  const target = current ?? next;
  if (!target) {
    return (
      <div className="rounded-xl border border-success/40 bg-success/5 p-5 text-sm text-ink-300">
        You have completed every project in this path. Publish them, add them to your portfolio and finish your interview answers.
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-accent/30 bg-accent/5 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-wide text-accent-light">{current ? "Continue where you left off" : "Start here"}</p>
        <p className="mt-1.5 font-display text-lg font-semibold text-ink-100">{target.title}</p>
        <p className="mt-1 max-w-xl text-sm text-ink-400">{target.summary}</p>
      </div>
      <Link href={`/projects/${target.id}`} className="focus-ring inline-flex rounded-xl">
        <Button className="gap-1.5" tabIndex={-1}>
          {current ? "Continue project" : "Open project"} <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </Link>
    </div>
  );
}

function ProjectRow({ p, n, titles }: { p: LabProjectSummary; n: number; titles: Record<string, string> }) {
  const pct = p.milestones_total ? Math.round((p.milestones_done / p.milestones_total) * 100) : 0;
  const before = p.recommended_before.map((id) => titles[id]).filter(Boolean);
  return (
    <li>
      <Link href={`/projects/${p.id}`} className="focus-ring group grid gap-x-8 gap-y-3 rounded py-5 md:grid-cols-[2.5rem_minmax(0,1fr)_13rem]">
        <span className="hidden font-mono text-xs text-ink-500 md:block">{String(n).padStart(2, "0")}</span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h3 className="font-display text-lg font-semibold tracking-tight text-ink-100 group-hover:text-accent-light">{p.title}</h3>
            <StageBadge stage={p.stage} label={p.stage_label} />
          </div>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-400">{p.summary}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {p.skills.slice(0, 5).map((s) => (
              <span key={s} className="rounded-[0.25rem] border border-[rgb(var(--fg-tint)/0.12)] px-1.5 py-0.5 text-[11px] text-ink-400">
                {s}
              </span>
            ))}
          </div>
          <p className="mt-3 max-w-2xl text-xs leading-relaxed text-ink-500">
            <span className="font-medium text-ink-300">You produce: </span>
            {p.deliverable}
          </p>
          {before.length > 0 && (
            <p className={cn("mt-2 text-xs", p.ready ? "text-ink-500" : "text-warning")}>
              {p.ready ? "You have done the recommended projects: " : "Recommended first: "}
              {before.join(", ")}
            </p>
          )}
        </div>
        <div className="flex flex-row items-center justify-between gap-4 md:flex-col md:items-start md:justify-start md:gap-3">
          <span className="inline-flex items-center gap-1.5 text-xs text-ink-400">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" /> about {p.est_hours} hours
          </span>
          <DifficultyMeter level={p.difficulty} />
          <div className="w-28 md:w-full">
            <ProgressBar value={pct} tone={p.flags.completed ? "success" : "accent"} />
            <p className="mt-1 font-mono text-[10px] text-ink-500">
              {p.milestones_done} of {p.milestones_total} milestones
            </p>
          </div>
        </div>
      </Link>
    </li>
  );
}

function GuidedProjects({ entry }: { entry: RoleProjectCatalogEntry }) {
  return (
    <section aria-labelledby="guided">
      <div className="border-t border-[rgb(var(--fg-tint)/0.14)] pt-5">
        <h2 id="guided" className="font-display text-h2 font-semibold tracking-tight text-ink-100">
          {entry.path.name}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-400">
          The full Project Lab curriculum for this career, with milestones, a GitHub workflow, documentation and interview preparation, is still being written. Until then, these are guided
          projects you can start from the roadmap.
        </p>
        <Link href={`/careers/${entry.path.slug}`} className="focus-ring mt-4 inline-flex rounded-xl">
          <Button className="gap-1.5" tabIndex={-1}>
            See the {entry.path.name} roadmap <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>
      <ol className="mt-6 divide-y divide-[rgb(var(--fg-tint)/0.08)] border-y border-[rgb(var(--fg-tint)/0.08)]">
        {entry.projects.map((project) => (
          <li key={project.id}>
            <Link href={`/projects/${project.id}`} className="focus-ring group flex flex-col gap-1.5 rounded py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
              <div className="min-w-0">
                <p className="font-display text-base font-semibold text-ink-100 group-hover:text-accent-light">{project.title}</p>
                <p className="mt-1 text-sm text-ink-400">{project.teaches}</p>
              </div>
              <div className="flex flex-shrink-0 items-center gap-3 text-xs text-ink-500">
                <Badge>{project.difficulty_label}</Badge>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" aria-hidden="true" /> {project.estimated_duration}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
