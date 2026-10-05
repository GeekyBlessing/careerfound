"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ProgressBar } from "@/components/ui/progress";
import { SkeletonCard } from "@/components/ui/skeleton";
import { ReadinessRing } from "@/components/career/readiness-ring";
import { api, ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { CareerReadiness } from "@/types/career";

export default function ReadinessPage() {
  const [data, setData] = useState<CareerReadiness | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<CareerReadiness>("/career/readiness")
      .then(setData)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load your readiness."));
  }, []);

  return (
    <AppShell>
      <div className="space-y-12">
        <header className="max-w-3xl">
          <p className="eyebrow">Career readiness</p>
          <h1 className="mt-2 font-display text-h1 font-semibold tracking-tight text-ink-100">
            {data?.career ? `How ready you are for a ${data.career.name} job` : "How ready you are for your first job"}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-400">
            One score out of 100, built from seven things you actually did here. Each one has a target, so you can check the arithmetic and see exactly what moves it.
          </p>
        </header>

        {error && <Alert>{error}</Alert>}
        {!data && !error && <SkeletonCard />}

        {data && !data.has_path && (
          <EmptyState
            icon={Compass}
            title="Pick a career to start measuring"
            description={data.why}
            action={
              <Link href={data.next_action.href} className="focus-ring rounded-xl">
                <Button className="gap-1.5" tabIndex={-1}>
                  {data.next_action.title} <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            }
          />
        )}

        {data && data.has_path && <Body data={data} />}
      </div>
    </AppShell>
  );
}

function Body({ data }: { data: CareerReadiness }) {
  const opp = data.biggest_opportunity;
  const live = data.signals.filter((s) => s.available);
  const left = data.signals.filter((s) => !s.available);

  return (
    <>
      <section className="grid gap-10 border-y border-[rgb(var(--fg-tint)/0.12)] py-10 lg:grid-cols-[auto_1fr] lg:gap-14">
        <div className="flex flex-col items-center gap-4 text-center lg:items-start lg:text-left">
          <ReadinessRing score={data.score} active={data.has_activity} size={196} />
          <p className="font-display text-xl font-semibold text-ink-100">{data.band}</p>
        </div>
        <div className="space-y-6">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wide text-ink-500">Why it is {data.has_activity ? data.score : "not scored yet"}</p>
            <p className="mt-2 max-w-2xl text-base leading-relaxed text-ink-200">{data.why}</p>
          </div>
          {opp && (
            <div className="max-w-2xl rounded-2xl border border-accent/30 bg-accent/[0.06] p-5">
              <p className="font-mono text-[10px] uppercase tracking-wide text-accent-light">Your biggest opportunity</p>
              <p className="mt-2 text-sm text-ink-300">{opp.text}</p>
              <p className="mt-3 font-display text-lg font-semibold text-ink-100">{opp.action.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-ink-400">{opp.action.reason}</p>
              <Link href={opp.action.href} className="focus-ring mt-4 inline-flex rounded-xl">
                <Button className="gap-1.5" tabIndex={-1}>
                  {opp.action.cta} <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      <section aria-labelledby="signals">
        <h2 id="signals" className="font-display text-h2 font-semibold tracking-tight text-ink-100">
          The seven signals
        </h2>
        {data.formula && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-400">{data.formula}</p>}
        <ol className="mt-6 divide-y divide-[rgb(var(--fg-tint)/0.1)] border-y border-[rgb(var(--fg-tint)/0.1)]">
          {live.map((s) => {
            const done = (s.pct ?? 0) >= 100;
            return (
              <li key={s.key} className="grid gap-4 py-6 md:grid-cols-[14rem_1fr] md:gap-8">
                <div>
                  <p className="font-display text-lg font-semibold text-ink-100">{s.label}</p>
                  <p className="mt-1 font-mono text-[11px] text-ink-500">
                    {s.points.toFixed(1)} of {s.weight.toFixed(1)} points
                  </p>
                </div>
                <div className="min-w-0">
                  <div className="flex items-baseline justify-between gap-4">
                    <p className="text-sm leading-relaxed text-ink-300">{s.detail}</p>
                    <span className="shrink-0 font-mono text-sm text-ink-200">{s.pct}%</span>
                  </div>
                  <ProgressBar value={s.pct ?? 0} tone={done ? "success" : "accent"} className="mt-3" />
                  {s.action && !done && (
                    <p className="mt-3 text-sm">
                      <span className="text-ink-500">To raise it: </span>
                      <Link href={s.action.href} className={cn("focus-ring rounded font-medium text-accent-light hover:underline")}>
                        {s.action.title}
                      </Link>
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
        {left.length > 0 && (
          <div className="mt-6 rounded-2xl border border-dashed border-[rgb(var(--fg-tint)/0.14)] p-5">
            <p className="text-sm font-medium text-ink-200">Left out for this career: {left.map((s) => s.label.toLowerCase()).join(" and ")}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-400">
              These need a Project Lab, and {data.career?.name ?? "this career"} does not have one yet. They are left out of your score instead of counted as zero, and the other signals are scaled so the total is still out of 100.
            </p>
          </div>
        )}
      </section>

      <section className="max-w-3xl border-t border-[rgb(var(--fg-tint)/0.12)] pt-6">
        <h2 className="font-display text-xl font-semibold text-ink-100">What does not count</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-400">{data.not_counted}</p>
        <p className="mt-3 text-sm leading-relaxed text-ink-400">
          A score is a way to see progress, not a promise about hiring. Employers decide on your work, and the work lives in your{" "}
          <Link href="/portfolio" className="text-accent-light hover:underline">
            portfolio
          </Link>
          .
        </p>
      </section>
    </>
  );
}
