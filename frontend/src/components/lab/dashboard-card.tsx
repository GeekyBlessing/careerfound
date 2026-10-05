"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { api } from "@/lib/api";
import type { LabOverview } from "@/types/lab";
import { StageBadge } from "./common";

/**
 * The dashboard's window into the Project Lab. Everything shown is counted
 * from evidence the learner produced (repositories GitHub reported as public,
 * portfolio entries, written interview answers). Renders nothing for a career
 * that has no curriculum yet, so the dashboard never shows an empty promise.
 */
export function ProjectLabCard() {
  const [data, setData] = useState<LabOverview | null>(null);

  useEffect(() => {
    api
      .get<LabOverview>("/lab/overview")
      .then(setData)
      .catch(() => setData(null));
  }, []);

  if (!data?.available || !data.career || !data.totals) return null;
  const t = data.totals;
  const target = data.current ?? data.next;
  const upcoming = (data.projects ?? []).filter((p) => !p.flags.completed && p.id !== target?.id).slice(0, 3);
  const pct = t.projects ? Math.round(((t.completed ?? 0) / t.projects) * 100) : 0;

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Project Lab</p>
          <h2 className="mt-1 font-display text-h3 font-semibold tracking-tight text-ink-100">{data.career.name} projects</h2>
        </div>
        <Link href={`/projects?career=${data.career.slug}`} className="focus-ring inline-flex items-center gap-1 rounded text-xs font-medium text-accent-light hover:underline">
          See the full path <ArrowRight className="h-3 w-3" aria-hidden="true" />
        </Link>
      </div>

      <div className="mt-4">
        <ProgressBar value={pct} tone="success" />
        <p className="mt-1.5 font-mono text-[11px] text-ink-500">
          {t.completed ?? 0} of {t.projects} projects completed
        </p>
      </div>

      <dl className="mt-5 grid grid-cols-3 gap-4 border-y border-[rgb(var(--fg-tint)/0.1)] py-4 text-xs">
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-wide text-ink-500">On GitHub</dt>
          <dd className="mt-1 font-display text-lg font-semibold text-ink-100">{t.published ?? 0}</dd>
        </div>
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-wide text-ink-500">In portfolio</dt>
          <dd className="mt-1 font-display text-lg font-semibold text-ink-100">{t.portfolio_ready ?? 0}</dd>
        </div>
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-wide text-ink-500">Interview ready</dt>
          <dd className="mt-1 font-display text-lg font-semibold text-ink-100">{t.interview_ready ?? 0}</dd>
        </div>
      </dl>

      {target && (
        <div className="mt-5">
          <p className="font-mono text-[10px] uppercase tracking-wide text-accent-light">{data.current ? "Current project" : "Start here"}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
            <p className="font-display text-base font-semibold text-ink-100">{target.title}</p>
            <StageBadge stage={target.stage} label={target.stage_label} />
          </div>
          <p className="mt-1 text-xs text-ink-500">
            {target.level_label}, about {target.est_hours} hours, {target.milestones_done} of {target.milestones_total} milestones done
          </p>
          <Link href={`/projects/${target.id}`} className="focus-ring mt-3 inline-flex rounded-xl">
            <Button size="sm" className="gap-1.5" tabIndex={-1}>
              {data.current ? "Continue" : "Open project"} <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      )}

      {upcoming.length > 0 && (
        <div className="mt-5">
          <p className="font-mono text-[10px] uppercase tracking-wide text-ink-500">Up next</p>
          <ul className="mt-2 space-y-1.5">
            {upcoming.map((p) => (
              <li key={p.id}>
                <Link href={`/projects/${p.id}`} className="focus-ring flex items-baseline justify-between gap-3 rounded text-sm text-ink-300 hover:text-accent-light">
                  <span>{p.title}</span>
                  <span className="font-mono text-[10px] uppercase text-ink-500">{p.level_label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
