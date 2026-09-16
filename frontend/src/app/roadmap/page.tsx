"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown, CheckCircle2, Circle, BookOpen, FolderGit2, ListChecks, Network } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress";
import { SkeletonCard } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Alert } from "@/components/ui/alert";
import { SkillGraphView } from "@/components/charts/skill-graph-view";
import { SmartMentorRecommendation } from "@/components/mentors/smart-mentor-recommendation";
import { MentorRecommendationsPanel } from "@/components/mentors/mentor-recommendations-panel";
import { api, ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Roadmap, PhaseItem, LessonItem, ProjectItem, QuizItem, SkillGraph } from "@/types";

export default function RoadmapPage() {
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [skillGraph, setSkillGraph] = useState<SkillGraph | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showGraph, setShowGraph] = useState(false);

  useEffect(() => {
    Promise.all([api.get<Roadmap>("/roadmaps/active"), api.get<SkillGraph>("/skill-graph")])
      .then(([r, g]) => {
        setRoadmap(r);
        setSkillGraph(g);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load your roadmap."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell>
      {loading && (
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {error && !loading && (
        <EmptyState
          icon={BookOpen}
          title="No active roadmap yet"
          description={error}
          action={
            <Link href="/onboarding">
              <Button>Find My Tech Path</Button>
            </Link>
          }
        />
      )}

      {roadmap && (
        <div className="space-y-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="eyebrow">Your roadmap</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink-100">{roadmap.path_name}</h1>
            </div>
            {skillGraph && (
              <Button variant="secondary" size="sm" className="gap-1.5" onClick={() => setShowGraph((s) => !s)}>
                <Network className="h-3.5 w-3.5" />
                {showGraph ? "Hide" : "Show"} skill graph
              </Button>
            )}
          </div>

          {showGraph && skillGraph && (
            <Card>
              <CardContent className="p-6">
                <p className="mb-4 text-sm font-medium text-ink-100">Skill dependency graph</p>
                <SkillGraphView graph={skillGraph} />
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {roadmap.phases.map((phase, i) => (
              <PhaseAccordion key={phase.id} phase={phase} defaultOpen={i === 0 || (phase.progress_pct > 0 && phase.progress_pct < 100)} />
            ))}
          </div>

          <MentorRecommendationsPanel roadmapId={roadmap.id} />

          <SmartMentorRecommendation pathSlug={roadmap.path_slug} pathName={roadmap.path_name} />
        </div>
      )}
    </AppShell>
  );
}

function PhaseAccordion({ phase, defaultOpen }: { phase: PhaseItem; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Card>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="focus-ring flex w-full items-center justify-between gap-4 rounded-2xl p-5 text-left transition-colors hover:bg-[rgb(var(--fg-tint)/0.02)]"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-ink-100">{phase.title}</p>
            {phase.progress_pct === 100 && <Badge tone="success">Complete</Badge>}
          </div>
          <p className="mt-1 truncate text-xs text-ink-500">{phase.summary}</p>
          <div className="mt-3 max-w-xs">
            <ProgressBar value={phase.progress_pct} tone={phase.progress_pct === 100 ? "success" : "accent"} />
          </div>
        </div>
        <ChevronDown className={cn("h-4 w-4 flex-shrink-0 text-ink-500 transition-transform duration-200", open && "rotate-180")} />
      </button>

      {open && (
        <CardContent className="space-y-2 border-t border-[rgb(var(--fg-tint)/0.06)] p-5 pt-4">
          {phase.lessons.map((lesson) => (
            <LessonRow key={lesson.id} lesson={lesson} />
          ))}
          {phase.projects.map((project) => (
            <ProjectRow key={project.id} project={project} />
          ))}
          {phase.quizzes.map((quiz) => (
            <QuizRow key={quiz.id} quiz={quiz} />
          ))}
        </CardContent>
      )}
    </Card>
  );
}

function StatusIcon({ status }: { status: string }) {
  return status === "completed" ? (
    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-success" />
  ) : (
    <Circle className="h-4 w-4 flex-shrink-0 text-ink-700" />
  );
}

function LessonRow({ lesson }: { lesson: LessonItem }) {
  const [completing, setCompleting] = useState(false);
  const [status, setStatus] = useState(lesson.status);
  const [expanded, setExpanded] = useState(false);

  async function markComplete() {
    setCompleting(true);
    try {
      await api.post(`/lessons/${lesson.id}/complete`);
      setStatus("completed");
    } catch {
      // no-op: UI stays in prior state, user can retry
    } finally {
      setCompleting(false);
    }
  }

  return (
    <div className="rounded-xl border border-[rgb(var(--fg-tint)/0.06)] bg-[rgb(var(--fg-tint)/0.015)] px-4 py-3">
      <div className="flex items-start gap-3">
        <StatusIcon status={status} />
        <div className="min-w-0 flex-1">
          <button
            className="w-full text-left focus-ring rounded-lg"
            aria-expanded={expanded}
            onClick={() => setExpanded((e) => !e)}
          >
            <p className="flex items-center gap-2 text-sm font-medium text-ink-100">
              <BookOpen className="h-3.5 w-3.5 text-ink-500" /> {lesson.title}
            </p>
            <p className="mt-0.5 text-xs text-ink-500">{lesson.est_minutes} min · {lesson.concept_summary}</p>
          </button>
          {expanded && (
            <div className="mt-3 animate-fade-in-up space-y-2 rounded-lg bg-base-950/60 p-3 text-xs leading-relaxed text-ink-400">
              <p className="italic text-ink-500">{lesson.beginner_explainer}</p>
              <div className="whitespace-pre-wrap text-ink-300">{lesson.content_md}</div>
            </div>
          )}
        </div>
        {status !== "completed" && (
          <Button size="sm" variant="secondary" onClick={markComplete} loading={completing}>
            Mark done
          </Button>
        )}
      </div>
    </div>
  );
}

function ProjectRow({ project }: { project: ProjectItem }) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="flex items-start gap-3 rounded-xl border border-[rgb(var(--fg-tint)/0.06)] bg-[rgb(var(--fg-tint)/0.015)] px-4 py-3 transition-colors hover:bg-[rgb(var(--fg-tint)/0.03)] focus-ring"
    >
      <StatusIcon status={project.status} />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 text-sm font-medium text-ink-100">
          <FolderGit2 className="h-3.5 w-3.5 text-ink-500" /> {project.title}
        </p>
        <p className="mt-0.5 text-xs text-ink-500">{project.teaches}</p>
      </div>
      <Badge>Project</Badge>
    </Link>
  );
}

function QuizRow({ quiz }: { quiz: QuizItem }) {
  return (
    <Link
      href={`/roadmap/quiz/${quiz.id}`}
      className="flex items-start gap-3 rounded-xl border border-[rgb(var(--fg-tint)/0.06)] bg-[rgb(var(--fg-tint)/0.015)] px-4 py-3 transition-colors hover:bg-[rgb(var(--fg-tint)/0.03)] focus-ring"
    >
      <StatusIcon status={quiz.status} />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 text-sm font-medium text-ink-100">
          <ListChecks className="h-3.5 w-3.5 text-ink-500" /> {quiz.title}
        </p>
        <p className="mt-0.5 text-xs text-ink-500">Checkpoint · pass at {quiz.passing_score}%</p>
      </div>
      <Badge>Checkpoint</Badge>
    </Link>
  );
}
