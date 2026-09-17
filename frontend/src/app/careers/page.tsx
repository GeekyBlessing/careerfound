"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { PublicShell } from "@/components/layout/public-shell";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DifficultyMeter } from "@/components/ui/difficulty-meter";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { SkeletonCard } from "@/components/ui/skeleton";
import { api, ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { CareerPath } from "@/types";

type DifficultyFilter = "all" | "beginner" | "intermediate" | "advanced";

const DIFFICULTY_FILTERS: { key: DifficultyFilter; label: string; test: (d: number) => boolean }[] = [
  { key: "all", label: "All paths", test: () => true },
  { key: "beginner", label: "Beginner friendly", test: (d) => d <= 2 },
  { key: "intermediate", label: "Intermediate", test: (d) => d === 3 },
  { key: "advanced", label: "Advanced", test: (d) => d >= 4 },
];

export default function CareersListPage() {
  const [paths, setPaths] = useState<CareerPath[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState<DifficultyFilter>("all");

  useEffect(() => {
    api
      .get<CareerPath[]>("/careers")
      .then(setPaths)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load career paths."));
  }, []);

  const activeDifficulty = DIFFICULTY_FILTERS.find((f) => f.key === difficulty) ?? {
    key: "all" as const,
    label: "All paths",
    test: () => true,
  };

  const visiblePaths = useMemo(() => {
    if (!paths) return [];
    const test = DIFFICULTY_FILTERS.find((f) => f.key === difficulty)?.test ?? (() => true);
    const q = query.trim().toLowerCase();
    return paths.filter((path) => {
      if (!test(path.difficulty)) return false;
      if (!q) return true;
      return (
        path.name.toLowerCase().includes(q) ||
        path.summary.toLowerCase().includes(q) ||
        path.entry_roles.some((r) => r.toLowerCase().includes(q)) ||
        path.tools.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [paths, query, difficulty]);

  return (
    <PublicShell>
      <div className="py-8 sm:py-12">
        <SectionHeading
          as="h1"
          eyebrow="Career paths"
          title={paths ? `${paths.length} tech careers, one honest assessment to find yours` : "Tech careers, one honest assessment to find yours"}
          description="Browse the full directory, or take the assessment for a recommendation based on how you actually think and work."
        />

        {paths && (
          <div className="mx-auto mt-8 flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-500" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, role, or tool"
                aria-label="Search career paths"
                className="pl-8"
              />
            </div>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by difficulty">
              {DIFFICULTY_FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setDifficulty(f.key)}
                  className={cn(
                    "focus-ring whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-150 ease-smooth active:translate-y-px",
                    f.key === difficulty
                      ? "border-accent/40 bg-accent/15 text-accent-light shadow-xs"
                      : "border-[rgb(var(--fg-tint)/0.1)] text-ink-400 hover:border-[rgb(var(--fg-tint)/0.2)] hover:bg-[rgb(var(--fg-tint)/0.04)]"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && <Alert className="mx-auto mt-10 max-w-lg">{error}</Alert>}

        {!paths && !error && (
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}

        {paths && visiblePaths.length === 0 && (
          <p className="mt-12 text-center text-sm text-ink-500">No career paths match &quot;{query}&quot;.</p>
        )}

        {paths && visiblePaths.length > 0 && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visiblePaths.map((path) => (
              <Link key={path.id} href={`/careers/${path.slug}`}>
                <Card interactive className="flex h-full flex-col p-6">
                  <p className="font-display text-base font-semibold tracking-tight text-ink-100">{path.name}</p>
                  <p className="mt-2 flex-1 text-xs leading-relaxed text-ink-500">{path.summary}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {path.entry_roles.slice(0, 2).map((r) => (
                      <Badge key={r}>{r}</Badge>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-[rgb(var(--fg-tint)/0.06)] pt-3">
                    <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wide text-ink-500">
                      <DifficultyMeter level={path.difficulty} /> {path.difficulty}/5
                    </span>
                    <span className="flex items-center gap-1 text-xs font-medium text-accent-light">
                      Explore <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PublicShell>
  );
}
