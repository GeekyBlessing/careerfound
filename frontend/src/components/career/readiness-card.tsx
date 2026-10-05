"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { api } from "@/lib/api";
import type { CareerReadiness } from "@/types/career";
import { ReadinessRing } from "./readiness-ring";

/**
 * The dashboard's readiness card. It shows the score, why it is what it is,
 * and exactly one thing to do next, with the full breakdown one click away.
 */
export function CareerReadinessCard({ data: given }: { data?: CareerReadiness | null }) {
  const [data, setData] = useState<CareerReadiness | null>(given ?? null);
  useEffect(() => {
    if (given) return;
    api
      .get<CareerReadiness>("/career/readiness")
      .then(setData)
      .catch(() => setData(null));
  }, [given]);

  if (!data || !data.has_path) return null;
  const top = data.signals.filter((s) => s.available);
  const action = data.biggest_opportunity?.action ?? data.next_action;

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Career readiness</p>
          <h2 className="mt-1 font-display text-h3 font-semibold tracking-tight text-ink-100">{data.band}</h2>
        </div>
        <Link href="/readiness" className="focus-ring inline-flex items-center gap-1 rounded text-xs font-medium text-accent-light hover:underline">
          See how it is calculated <ArrowRight className="h-3 w-3" aria-hidden="true" />
        </Link>
      </div>

      <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-center">
        <ReadinessRing score={data.score} active={data.has_activity} size={136} className="shrink-0 self-center" />
        <ul className="min-w-0 flex-1 space-y-2.5">
          {top.map((s) => (
            <li key={s.key}>
              <div className="flex items-baseline justify-between gap-3 text-xs">
                <span className="text-ink-300">{s.label}</span>
                <span className="font-mono text-[11px] text-ink-500">{s.pct}%</span>
              </div>
              <ProgressBar value={s.pct ?? 0} trackClassName="mt-1 h-1.5" />
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 border-t border-[rgb(var(--fg-tint)/0.1)] pt-5">
        <p className="font-mono text-[10px] uppercase tracking-wide text-accent-light">Do this next</p>
        <p className="mt-1.5 font-display text-base font-semibold text-ink-100">{action.title}</p>
        <p className="mt-1 text-xs leading-relaxed text-ink-500">{action.reason}</p>
        <Link href={action.href} className="focus-ring mt-3 inline-flex rounded-xl">
          <Button size="sm" className="gap-1.5" tabIndex={-1}>
            {action.cta} <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>
    </Card>
  );
}
