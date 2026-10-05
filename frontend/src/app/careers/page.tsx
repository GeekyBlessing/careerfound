"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { PublicShell } from "@/components/layout/public-shell";
import { SectionHeading } from "@/components/marketing/section-heading";
import { DifficultyMeter } from "@/components/ui/difficulty-meter";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { api, ApiError } from "@/lib/api";
import { CAREER_CATEGORIES, CAREER_ORDER, careerBySlug } from "@/lib/career-categories";
import { searchCareers } from "@/lib/career-search";
import { cn } from "@/lib/utils";
import type { CareerPath } from "@/types";

type DifficultyFilter = "all" | "beginner" | "intermediate" | "advanced";

const DIFFICULTY_FILTERS: { key: DifficultyFilter; label: string; test: (d: number) => boolean }[] = [
  { key: "all", label: "Any level", test: () => true },
  { key: "beginner", label: "Beginner friendly", test: (d) => d <= 2 },
  { key: "intermediate", label: "Intermediate", test: (d) => d === 3 },
  { key: "advanced", label: "Advanced", test: (d) => d >= 4 },
];

const chipClass = (active: boolean) =>
  cn(
    "focus-ring whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-150 ease-smooth active:translate-y-px",
    active
      ? "border-accent/40 bg-accent/15 text-accent-light shadow-xs"
      : "border-[rgb(var(--fg-tint)/0.1)] text-ink-400 hover:border-[rgb(var(--fg-tint)/0.2)] hover:bg-[rgb(var(--fg-tint)/0.04)]"
  );

/**
 * The career directory. Categories here are filters, never entries: the list
 * is always careers, numbered in catalogue order, with the category shown as
 * small metadata beside the name. Search covers names, skills, tools, roles
 * and keywords, and each row names the careers it is closely related to.
 */
export default function CareersListPage() {
  const [paths, setPaths] = useState<CareerPath[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState<DifficultyFilter>("all");
  const [category, setCategory] = useState<string>("all");

  useEffect(() => {
    api
      .get<CareerPath[]>("/careers")
      .then((list) => {
        const order = new Map(CAREER_ORDER.map((slug, i) => [slug, i]));
        setPaths([...list].sort((a, b) => (order.get(a.slug) ?? 99) - (order.get(b.slug) ?? 99)));
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load career paths."));
  }, []);

  // Deep link from the homepage and nav: /careers?category=security
  useEffect(() => {
    const wanted = new URLSearchParams(window.location.search).get("category");
    if (wanted && CAREER_CATEGORIES.some((c) => c.slug === wanted)) setCategory(wanted);
  }, []);

  function chooseCategory(slug: string) {
    setCategory(slug);
    const url = new URL(window.location.href);
    if (slug === "all") url.searchParams.delete("category");
    else url.searchParams.set("category", slug);
    window.history.replaceState(null, "", url.toString());
  }

  const visible = useMemo(() => {
    if (!paths) return [];
    const test = DIFFICULTY_FILTERS.find((f) => f.key === difficulty)?.test ?? (() => true);
    const inScope = paths.filter((p) => test(p.difficulty) && (category === "all" || p.category === category));
    return searchCareers(inScope, query);
  }, [paths, query, difficulty, category]);

  const countsByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of paths ?? []) counts[p.category] = (counts[p.category] ?? 0) + 1;
    return counts;
  }, [paths]);

  return (
    <PublicShell>
      <div className="py-8 sm:py-12">
        <SectionHeading
          as="h1"
          eyebrow="Career paths"
          title={
            paths
              ? `${paths.length} careers across ${CAREER_CATEGORIES.length} fields, one honest assessment to find yours`
              : "Tech careers, one honest assessment to find yours"
          }
          description="Every career is a path of its own, with its own skills, tools, projects and roadmap. Use the field filters to narrow the list, or take the assessment for a recommendation."
        />

        {paths && (
          <div className="mx-auto mt-8 max-w-4xl space-y-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-500" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search careers, skills, tools or roles (try AWS, Python or Figma)"
                aria-label="Search careers"
                className="pl-8"
              />
            </div>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by field">
              <button onClick={() => chooseCategory("all")} className={chipClass(category === "all")} aria-pressed={category === "all"}>
                All fields <span className="ml-1 font-mono text-[10px] opacity-70">{paths.length}</span>
              </button>
              {CAREER_CATEGORIES.map((c) => (
                <button key={c.slug} onClick={() => chooseCategory(c.slug)} className={chipClass(category === c.slug)} aria-pressed={category === c.slug}>
                  {c.name} <span className="ml-1 font-mono text-[10px] opacity-70">{countsByCategory[c.slug] ?? 0}</span>
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by difficulty">
              {DIFFICULTY_FILTERS.map((f) => (
                <button key={f.key} onClick={() => setDifficulty(f.key)} className={chipClass(f.key === difficulty)} aria-pressed={f.key === difficulty}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && <Alert className="mx-auto mt-10 max-w-lg">{error}</Alert>}

        {!paths && !error && (
          <div className="mx-auto mt-12 max-w-4xl space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        )}

        {paths && visible.length === 0 && (
          <p className="mt-12 text-center text-sm text-ink-500">
            No career matches{query ? <> &quot;{query}&quot;</> : " those filters"}. Try a broader search or{" "}
            <button
              onClick={() => {
                setQuery("");
                setDifficulty("all");
                chooseCategory("all");
              }}
              className="text-accent-light hover:underline"
            >
              clear the filters
            </button>
            .
          </p>
        )}

        {paths && visible.length > 0 && (
          <ol className="mx-auto mt-8 max-w-4xl border-t border-[rgb(var(--fg-tint)/0.1)]" aria-label="Careers">
            {visible.map(({ career: path, matchedOn }, i) => {
              const related = path.related_slugs
                .map((slug) => careerBySlug(slug)?.name)
                .filter((name): name is string => Boolean(name))
                .slice(0, 3);
              return (
                <li key={path.id} className="border-b border-[rgb(var(--fg-tint)/0.1)]">
                  <Link
                    href={`/careers/${path.slug}`}
                    className="focus-ring group grid grid-cols-[2.25rem_1fr_auto] items-start gap-x-3 gap-y-1 py-5 sm:grid-cols-[3rem_1fr_auto] sm:gap-x-5"
                  >
                    <span className="pt-1.5 font-mono text-xs text-ink-500">{String(i + 1).padStart(2, "0")}</span>
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                        <span className="font-display text-xl font-semibold tracking-tight text-ink-100 group-hover:text-accent-light">{path.name}</span>
                        <span className="font-mono text-[10px] uppercase tracking-wide text-ink-500">{path.category_label}</span>
                      </span>
                      <span className="mt-1.5 block text-sm leading-relaxed text-ink-400">{path.summary}</span>
                      {matchedOn && <span className="mt-1 block text-xs text-accent-light">Matches: {matchedOn}</span>}
                      {related.length > 0 && (
                        <span className="mt-2 block text-xs text-ink-500">
                          Related: <span className="text-ink-400">{related.join(", ")}</span>
                        </span>
                      )}
                    </span>
                    <span className="flex flex-col items-end gap-2 pt-1.5">
                      <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wide text-ink-500">
                        <DifficultyMeter level={path.difficulty} /> {path.difficulty}/5
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-ink-500 transition-transform group-hover:translate-x-0.5 group-hover:text-accent-light" />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        )}

        <p className="mx-auto mt-10 max-w-4xl text-center text-xs text-ink-500">
          Not sure where to start?{" "}
          <Link href="/onboarding" className="text-accent-light hover:underline">
            Take the assessment
          </Link>{" "}
          and get a best match, a strong alternative and a wild card.
        </p>
      </div>
    </PublicShell>
  );
}
