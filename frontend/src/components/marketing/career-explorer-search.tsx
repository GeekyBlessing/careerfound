"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { api } from "@/lib/api";
import { CAREER_CATEGORIES } from "@/lib/career-categories";
import { searchCareers, type SearchableCareer } from "@/lib/career-search";
import type { CareerPath } from "@/types";

/**
 * The homepage's real search/discovery moment: not a decorative input, it
 * searches the live catalogue as you type, across career names, categories,
 * skills, tools, roles and keywords ("AWS", "Python", "Figma"). Deliberately
 * a plain numbered list (index, name, small category label) rather than
 * another grid of cards, so it reads as a catalogue index and the category
 * stays metadata that never competes with the career name.
 *
 * The names and categories render immediately from the bundled taxonomy; the
 * fuller searchable data (tools, roles, skills, keywords) is fetched from the
 * API and swapped in when it arrives, so search degrades to name and category
 * if the API is unreachable instead of breaking.
 */
const FALLBACK_CATALOGUE: SearchableCareer[] = CAREER_CATEGORIES.flatMap((cat) =>
  cat.paths.map((p) => ({ slug: p.slug, name: p.name, category_label: cat.name }))
);

export function CareerExplorerSearch() {
  const [query, setQuery] = useState("");
  const [careers, setCareers] = useState<SearchableCareer[]>(FALLBACK_CATALOGUE);

  useEffect(() => {
    let cancelled = false;
    api
      .get<CareerPath[]>("/careers")
      .then((paths) => {
        if (cancelled || paths.length === 0) return;
        // The API orders by name; show them in catalogue order instead.
        const order = new Map(FALLBACK_CATALOGUE.map((c, i) => [c.slug, i]));
        setCareers([...paths].sort((a, b) => (order.get(a.slug) ?? 99) - (order.get(b.slug) ?? 99)));
      })
      .catch(() => {
        /* keep the bundled taxonomy */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const results = useMemo(() => searchCareers(careers, query), [careers, query]);

  return (
    <div>
      <label htmlFor="career-search" className="sr-only">
        Search careers, skills, tools or roles
      </label>
      <div className="relative border-b-2 border-ink-100 focus-within:border-accent-light">
        <Search className="pointer-events-none absolute left-0 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-500" />
        <input
          id="career-search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search careers, skills or roles"
          className="w-full bg-transparent py-4 pl-8 font-display text-xl text-ink-100 placeholder:text-ink-500 focus:outline-none sm:text-2xl"
        />
      </div>

      <div className="mt-2 max-h-[22rem] overflow-y-auto" aria-live="polite">
        {results.length === 0 && (
          <p className="py-6 text-sm text-ink-500">
            No match for &ldquo;{query}&rdquo;.{" "}
            <Link href="/careers" className="text-accent-light hover:underline">
              Browse the full directory
            </Link>{" "}
            instead.
          </p>
        )}
        {results.map(({ career, matchedOn }, i) => (
          <Link
            key={career.slug}
            href={`/careers/${career.slug}`}
            className="focus-ring group flex items-center justify-between gap-4 border-b border-[rgb(var(--fg-tint)/0.08)] py-3.5 first:pt-4"
          >
            <span className="flex min-w-0 items-baseline gap-3.5">
              <span className="font-mono text-xs text-ink-500">{String(i + 1).padStart(2, "0")}</span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-ink-100 group-hover:text-accent-light">{career.name}</span>
                {matchedOn && <span className="block truncate text-xs text-ink-500">{matchedOn}</span>}
              </span>
              <span className="hidden font-mono text-[10px] uppercase tracking-wide text-ink-500 sm:inline">{career.category_label}</span>
            </span>
            <ArrowRight className="h-3.5 w-3.5 flex-shrink-0 text-ink-500 opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
        ))}
      </div>
    </div>
  );
}
