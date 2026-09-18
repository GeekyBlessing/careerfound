"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { CAREER_CATEGORIES } from "@/lib/career-categories";

/**
 * The homepage's real search/discovery moment: not a decorative input, it
 * actually filters the live 21-path catalog by name or category as you
 * type. Deliberately plain-list output (name, category, arrow) rather than
 * another grid of cards, so this reads as a catalogue index, not a fourth
 * feature section.
 */
export function CareerExplorerSearch() {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const flat = CAREER_CATEGORIES.flatMap((cat) => cat.paths.map((p) => ({ ...p, category: cat.name })));
    if (!q) return flat;
    return flat.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  }, [query]);

  return (
    <div>
      <label htmlFor="career-search" className="sr-only">
        Search careers or categories
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

      <div className="mt-2 max-h-[22rem] overflow-y-auto">
        {results.length === 0 && (
          <p className="py-6 text-sm text-ink-500">
            No match for &ldquo;{query}&rdquo;.{" "}
            <Link href="/careers" className="text-accent-light hover:underline">
              Browse the full directory
            </Link>{" "}
            instead.
          </p>
        )}
        {results.map((p, i) => (
          <Link
            key={p.slug}
            href={`/careers/${p.slug}`}
            className="focus-ring group flex items-center justify-between gap-4 border-b border-[rgb(var(--fg-tint)/0.08)] py-3.5 first:pt-4"
          >
            <span className="flex items-baseline gap-3.5 min-w-0">
              <span className="font-mono text-xs text-ink-500">{String(i + 1).padStart(2, "0")}</span>
              <span className="truncate text-sm font-medium text-ink-100 group-hover:text-accent-light">{p.name}</span>
              <span className="hidden font-mono text-[10px] uppercase tracking-wide text-ink-500 sm:inline">{p.category}</span>
            </span>
            <ArrowRight className="h-3.5 w-3.5 flex-shrink-0 text-ink-500 opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
        ))}
      </div>
    </div>
  );
}
