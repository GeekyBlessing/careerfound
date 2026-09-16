"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Clock, LayoutGrid, Search, Wrench, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input, Label } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { SkeletonCard } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { api, ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { RoleProjectCatalogEntry, CareerProjectItem } from "@/types";

const TIER_TONE: Record<CareerProjectItem["difficulty_label"], "success" | "accent" | "danger"> = {
  Beginner: "success",
  Intermediate: "accent",
  Expert: "danger",
};

type DifficultyFilter = "all" | CareerProjectItem["difficulty_label"];

const DIFFICULTY_FILTERS: { key: DifficultyFilter; label: string }[] = [
  { key: "all", label: "All levels" },
  { key: "Beginner", label: "Beginner" },
  { key: "Intermediate", label: "Intermediate" },
  { key: "Expert", label: "Expert" },
];

export default function ProjectsByRolePage() {
  const [catalog, setCatalog] = useState<RoleProjectCatalogEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeRole, setActiveRole] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState<DifficultyFilter>("all");

  useEffect(() => {
    api
      .get<RoleProjectCatalogEntry[]>("/careers/projects/catalog")
      .then(setCatalog)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load the project catalog."));
  }, []);

  const totalProjects = useMemo(() => (catalog ?? []).reduce((sum, entry) => sum + entry.projects.length, 0), [catalog]);

  const activeEntry = useMemo(() => (catalog ?? []).find((entry) => entry.path.slug === activeRole) ?? null, [catalog, activeRole]);

  const visibleProjects = useMemo(() => {
    if (!activeEntry) return [];
    const q = query.trim().toLowerCase();
    return activeEntry.projects.filter((p) => {
      if (difficulty !== "all" && p.difficulty_label !== difficulty) return false;
      if (!q) return true;
      return p.title.toLowerCase().includes(q) || p.teaches.toLowerCase().includes(q);
    });
  }, [activeEntry, query, difficulty]);

  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <p className="eyebrow">
            <LayoutGrid className="h-3.5 w-3.5" /> Project discovery
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink-100">Projects by role</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-400">
            Browse real, hands-on projects organized by career role. Pick a role to see what you would actually
            build, at every difficulty level, before you commit to a roadmap.
          </p>
          {catalog && (
            <p className="mt-2 text-xs text-ink-500">
              {catalog.length} roles, {totalProjects} projects
            </p>
          )}
        </div>

        {error && <Alert>{error}</Alert>}

        {!catalog && !error && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}

        {catalog && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {catalog.map((entry) => {
              const active = entry.path.slug === activeRole;
              return (
                <button
                  key={entry.path.slug}
                  onClick={() => setActiveRole(active ? null : entry.path.slug)}
                  aria-pressed={active}
                  className={cn(
                    "focus-ring rounded-2xl border p-4 text-left transition-all duration-150 ease-smooth active:translate-y-px",
                    active
                      ? "border-accent/40 bg-accent/10 shadow-xs"
                      : "border-[rgb(var(--fg-tint)/0.08)] bg-[rgb(var(--fg-tint)/0.03)] hover:border-[rgb(var(--fg-tint)/0.16)] hover:bg-[rgb(var(--fg-tint)/0.05)]"
                  )}
                >
                  <p className={cn("text-sm font-semibold", active ? "text-accent-light" : "text-ink-100")}>{entry.path.name}</p>
                  <p className="mt-1 text-xs text-ink-500">
                    {entry.projects.length} project{entry.projects.length === 1 ? "" : "s"}
                  </p>
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] text-ink-500">
                    <Wrench className="h-3 w-3" />
                    <span className="truncate">{entry.path.tools.slice(0, 3).join(", ")}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {activeEntry && (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-ink-100">{activeEntry.path.name} projects</h2>
                <p className="text-sm text-ink-500">{activeEntry.path.summary}</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-500" aria-hidden="true" />
                  <Label htmlFor="project-search" className="sr-only">
                    Search projects
                  </Label>
                  <Input
                    id="project-search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search projects"
                    aria-label="Search projects"
                    className="w-full pl-8 sm:w-56"
                  />
                </div>
                <Link href={`/careers/${activeEntry.path.slug}`}>
                  <Button className="w-full gap-1.5 whitespace-nowrap sm:w-auto">
                    Start this roadmap <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by difficulty">
              {DIFFICULTY_FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setDifficulty(f.key)}
                  aria-pressed={difficulty === f.key}
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

            {visibleProjects.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {visibleProjects.map((project) => (
                  <Link key={project.id} href={`/projects/${project.id}`} className="focus-ring block rounded-2xl">
                    <Card interactive className="flex h-full flex-col p-4">
                      <div className="flex items-center justify-between gap-2">
                        <Badge tone={TIER_TONE[project.difficulty_label]}>{project.difficulty_label}</Badge>
                        <span className="flex items-center gap-1 text-[11px] text-ink-500">
                          <Clock className="h-3 w-3" /> {project.estimated_duration}
                        </span>
                      </div>
                      <p className="mt-3 text-sm font-semibold text-ink-100">{project.title}</p>
                      <p className="mt-1.5 flex-1 text-xs leading-relaxed text-ink-500">{project.teaches}</p>
                      {project.prerequisites.length > 0 && (
                        <div className="mt-3">
                          <p className="text-[11px] font-medium text-ink-300">Skills you&apos;ll use</p>
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {project.prerequisites.slice(0, 4).map((skill) => (
                              <Badge key={skill} tone="neutral" className="text-[10px]">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {activeEntry.path.tools.length > 0 && (
                        <p className="mt-3 flex items-center gap-1.5 text-[11px] text-ink-500">
                          <Wrench className="h-3 w-3 shrink-0" />
                          <span className="truncate">{activeEntry.path.tools.slice(0, 3).join(", ")}</span>
                        </p>
                      )}
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Search}
                title="No projects match your filters"
                description={`Try a different search term or difficulty level within ${activeEntry.path.name}.`}
              />
            )}
          </div>
        )}

        {catalog && catalog.length > 0 && !activeEntry && (
          <Alert variant="info">Pick a role above to see its full project list.</Alert>
        )}

        {catalog && catalog.length === 0 && (
          <EmptyState
            icon={LayoutGrid}
            title="No projects available yet"
            description="We're still building out role-based projects. Check back soon."
          />
        )}
      </div>
    </AppShell>
  );
}
