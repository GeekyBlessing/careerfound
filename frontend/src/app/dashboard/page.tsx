"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Circle,
  ArrowRight,
  ArrowDown,
  MessageCircle,
  Flag,
  Sparkles,
  Lightbulb,
  Clock,
  History,
} from "lucide-react";
import { AppShell, StreakBadge } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Alert } from "@/components/ui/alert";
import { PathTrack, type PathWaypoint } from "@/components/marketing/path-track";
import { ProjectLabCard } from "@/components/lab/dashboard-card";
import { CareerReadinessCard } from "@/components/career/readiness-card";
import { SmartMentorRecommendation } from "@/components/mentors/smart-mentor-recommendation";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatMinutes, formatRelativeTime } from "@/lib/utils";
import type { Dashboard, MissionTask, PhaseItem, Roadmap } from "@/types";
import type { CareerReadiness } from "@/types/career";

/** A completed project/quiz doesn't carry its own minute estimate in the
 * roadmap payload the way a lesson does, so this reuses the same fixed
 * convention dashboard_service.py already uses when sizing "today's
 * mission" (project ≈ 45 min, quiz/checkpoint ≈ 10 min) rather than
 * inventing a second, different guess here. */
const PROJECT_MINUTES_ESTIMATE = 45;
const QUIZ_MINUTES_ESTIMATE = 10;

function computeRoadmapStats(phases: PhaseItem[]) {
  let totalItems = 0;
  let completedItems = 0;
  let learningMinutes = 0;

  for (const phase of phases) {
    for (const lesson of phase.lessons) {
      totalItems += 1;
      if (lesson.status === "completed") {
        completedItems += 1;
        learningMinutes += lesson.est_minutes;
      }
    }
    for (const project of phase.projects) {
      totalItems += 1;
      if (project.status === "completed") {
        completedItems += 1;
        learningMinutes += PROJECT_MINUTES_ESTIMATE;
      }
    }
    for (const quiz of phase.quizzes) {
      totalItems += 1;
      if (quiz.status === "completed") {
        completedItems += 1;
        learningMinutes += QUIZ_MINUTES_ESTIMATE;
      }
    }
  }

  const milestonesCompleted = phases.filter((p) => p.progress_pct === 100).length;
  const progressPct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return {
    totalItems,
    completedItems,
    learningMinutes,
    milestonesCompleted,
    milestonesTotal: phases.length,
    progressPct,
  };
}

function timeOfDayGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [readiness, setReadiness] = useState<CareerReadiness | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      api.get<Dashboard>("/dashboard"),
      api.get<Roadmap>("/roadmaps/active").catch(() => null), // no active roadmap yet is expected, not an error
      api.get<CareerReadiness>("/career/readiness").catch(() => null), // the next move degrades to the roadmap CTA
    ])
      .then(([d, r, c]) => {
        setDashboard(d);
        setRoadmap(r);
        setReadiness(c);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load your dashboard."))
      .finally(() => setLoading(false));
  }, [user]);

  const stats = useMemo(() => (roadmap ? computeRoadmapStats(roadmap.phases) : null), [roadmap]);
  const firstName = user?.full_name.split(" ")[0] || "there";

  return (
    <AppShell>
      {loading && <DashboardSkeleton />}
      {error && <Alert>{error}</Alert>}

      {dashboard && !dashboard.has_active_roadmap && (
        <EmptyState
          icon={Sparkles}
          title="You haven't started a roadmap yet"
          description="Take the 'Find Your Tech Path' assessment to get a personalized roadmap built around what actually fits you."
          className="mt-4 py-20"
          action={
            <Link href="/onboarding">
              <Button className="gap-1.5">
                Find My Tech Path <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          }
        />
      )}

      {dashboard && dashboard.has_active_roadmap && (
        <div className="space-y-10 sm:space-y-12">
          <HeroStatus firstName={firstName} dashboard={dashboard} roadmap={roadmap} stats={stats} readiness={readiness} />

          {stats && <StatStrip dashboard={dashboard} stats={stats} />}

          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-start lg:gap-8">
            {dashboard.today_mission && <TodayMission mission={dashboard.today_mission} />}
            {roadmap && <RoadmapTimeline roadmap={roadmap} />}
          </div>

          <div className="grid gap-6 lg:grid-cols-2 lg:items-start lg:gap-8">
            <NextStep dashboard={dashboard} />
            {dashboard.path_slug && (
              <Card className="border-warm/20 bg-warm/[0.03] p-6">
                <SmartMentorRecommendation pathSlug={dashboard.path_slug} pathName={dashboard.path_name || "your path"} variant="featured" />
              </Card>
            )}
          </div>

          <ProjectLabCard />

          <div className="grid gap-6 lg:grid-cols-2 lg:items-start lg:gap-8">
            <CareerReadinessCard data={readiness} showAction={false} />
            <RecentActivity items={dashboard.recent_activity} />
          </div>
        </div>
      )}
    </AppShell>
  );
}

/** Section A + the CTA: the career goal as the dashboard's actual reason
 * for existing, not a status line buried above a grid of cards. Progress
 * is real (computed from the live roadmap payload, not the readiness
 * score, which measures something different), and the stage breadcrumb
 * uses this user's own real phase titles, whatever path they're on. */
function HeroStatus({
  firstName,
  dashboard,
  roadmap,
  stats,
  readiness,
}: {
  firstName: string;
  dashboard: Dashboard;
  roadmap: Roadmap | null;
  stats: ReturnType<typeof computeRoadmapStats> | null;
  readiness: CareerReadiness | null;
}) {
  // One primary action. When the readiness model has a recommendation it wins,
  // because it looks across the whole journey. Otherwise fall back to the roadmap.
  const move = readiness?.has_path ? (readiness.biggest_opportunity?.action ?? readiness.next_action) : null;
  return (
    <div>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
        <div>
          <p className="eyebrow">{timeOfDayGreeting()}, {firstName}</p>
          <h1 className="mt-2 font-display text-display font-semibold tracking-tight text-ink-100">
            You&apos;re working toward{" "}
            <span className="text-accent-light">{dashboard.path_name}</span>
          </h1>
        </div>
        <StreakBadge days={dashboard.current_streak_days} />
      </div>

      {stats && (
        <div className="mt-6 max-w-xl">
          <div className="flex items-baseline justify-between">
            <p className="text-sm font-medium text-ink-300">{stats.progressPct}% of your roadmap completed</p>
          </div>
          <ProgressBar value={stats.progressPct} className="mt-2" trackClassName="h-2.5" />
        </div>
      )}

      {roadmap && roadmap.phases.length > 0 && (
        <ol className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1.5">
          {roadmap.phases.map((phase, i) => (
            <li key={phase.id} className="flex items-center gap-2">
              <span
                className={
                  phase.progress_pct === 100
                    ? "font-mono text-[11px] uppercase tracking-wide text-accent-light"
                    : phase.progress_pct > 0
                    ? "font-mono text-[11px] font-semibold uppercase tracking-wide text-ink-100"
                    : "font-mono text-[11px] uppercase tracking-wide text-ink-500"
                }
              >
                {phase.title}
              </span>
              {i < roadmap.phases.length - 1 && <ArrowRight className="h-3 w-3 text-ink-700" aria-hidden="true" />}
            </li>
          ))}
        </ol>
      )}

      {move ? (
        <div className="mt-7 max-w-2xl rounded-2xl border border-accent/25 bg-accent/[0.04] p-5 sm:p-6">
          <p className="font-mono text-[10px] uppercase tracking-wide text-accent-light">Your next move</p>
          <p className="mt-2 font-display text-xl font-semibold leading-snug tracking-tight text-ink-100">{move.title}</p>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-400">{move.reason}</p>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href={move.href} className="focus-ring rounded-xl">
              <Button className="gap-1.5" tabIndex={-1}>
                {move.cta} <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
            {move.href !== "/roadmap" && (
              <Link href="/roadmap" className="focus-ring rounded text-sm font-medium text-ink-400 hover:text-accent-light">
                Open my roadmap
              </Link>
            )}
          </div>
        </div>
      ) : (
        <Link href="/roadmap" className="mt-6 inline-block">
          <Button className="gap-1.5">
            Continue roadmap <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      )}
    </div>
  );
}

/** Section C: five distinct, compact readouts in a single rail (divided by
 * hairlines) rather than five identical bordered cards — the numbers are
 * meant to be scanned together, not treated as five separate widgets. */
function StatStrip({ dashboard, stats }: { dashboard: Dashboard; stats: ReturnType<typeof computeRoadmapStats> }) {
  const items: { value: string; label: string }[] = [
    { value: `${stats.progressPct}%`, label: "Roadmap progress" },
    { value: `${stats.milestonesCompleted}/${stats.milestonesTotal}`, label: "Milestones completed" },
    { value: `${stats.completedItems}`, label: "Steps completed" },
    { value: formatMinutes(stats.learningMinutes), label: "Learning time" },
    { value: `${dashboard.current_streak_days}`, label: "Day streak" },
  ];
  return (
    <div className="grid grid-cols-2 gap-y-5 rounded-2xl border border-[rgb(var(--fg-tint)/0.08)] bg-[rgb(var(--fg-tint)/0.02)] px-5 py-5 sm:grid-cols-5 sm:divide-x sm:divide-[rgb(var(--fg-tint)/0.08)]">
      {items.map((item) => (
        <div key={item.label} className="px-1 sm:px-5 sm:first:pl-0 sm:last:pr-0">
          <p className="font-display text-2xl font-semibold tabular-nums text-ink-100 sm:text-3xl">{item.value}</p>
          <p className="mt-0.5 text-xs text-ink-500">{item.label}</p>
        </div>
      ))}
    </div>
  );
}

/** Where a mission task can actually be worked on. Projects have their own
 * standalone page; lessons/exercises/quizzes don't yet, so they route to the
 * roadmap phase accordion that contains them rather than a dead end. */
function missionTaskHref(task: MissionTask): string {
  if (task.type === "challenge" && task.ref_id) return `/projects/${task.ref_id}`;
  return "/roadmap";
}

/** Section E + F: the day's real interactive centerpiece. Completion is
 * server-truth (see the comment on `done` below), so this never lets a
 * click here silently drift out of sync with the roadmap itself. */
function TodayMission({ mission }: { mission: NonNullable<Dashboard["today_mission"]> }) {
  const tasks = mission.tasks;
  const completedCount = tasks.filter((t) => t.done).length;
  const allDone = tasks.length > 0 && completedCount === tasks.length;
  const nextTask = tasks.find((t) => !t.done) ?? null;

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center justify-between border-b border-[rgb(var(--fg-tint)/0.08)] px-6 py-4">
        <p className="eyebrow">Today&apos;s mission</p>
        <span className="flex items-center gap-1.5 font-mono text-xs text-ink-500">
          <Clock className="h-3.5 w-3.5" /> {formatMinutes(mission.total_minutes)}
        </span>
      </div>

      <div className="p-6">
        {allDone ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <span className="animate-pop-in flex h-12 w-12 items-center justify-center rounded-full bg-success/15 text-success">
              <CheckCircle2 className="h-6 w-6" />
            </span>
            <p className="font-display text-lg font-semibold text-ink-100">All done for today</p>
            <p className="max-w-xs text-sm text-ink-500">
              Every task in today&apos;s mission is complete. Come back tomorrow for the next one, or get ahead on your roadmap.
            </p>
            <Link href="/roadmap">
              <Button variant="secondary" size="sm" className="mt-1 gap-1.5">
                Get ahead on your roadmap <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <Badge tone="accent">{completedCount}/{tasks.length} done</Badge>

            <ul className="mt-4 space-y-2.5">
              {tasks.map((task, i) => (
                <li key={i}>
                  <Link
                    href={missionTaskHref(task)}
                    className="focus-ring flex min-h-[44px] items-start gap-3 rounded-xl border border-[rgb(var(--fg-tint)/0.06)] bg-[rgb(var(--fg-tint)/0.02)] px-4 py-3 transition-colors hover:bg-[rgb(var(--fg-tint)/0.04)]"
                  >
                    <span className="mt-0.5 flex-shrink-0 text-ink-500">
                      {task.done ? (
                        <CheckCircle2 className="h-5 w-5 animate-pop-in text-success" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-medium ${task.done ? "text-ink-500 line-through" : "text-ink-100"}`}>
                        {task.title}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-ink-500">
                        <Badge className="capitalize">{task.type}</Badge>
                        <span>{task.est_minutes} min</span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>

            {nextTask && (
              <Link href={missionTaskHref(nextTask)} className="mt-5 block">
                <Button className="w-full gap-1.5">
                  Start mission <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            )}
          </>
        )}
      </div>

      {/* Section F: "Why this matters" — a real insight, not a grey box. */}
      <div className="flex gap-3 border-t border-[rgb(var(--fg-tint)/0.08)] bg-accent/[0.04] px-6 py-4">
        <Lightbulb className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent-light" />
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wide text-accent-light">Why this matters</p>
          <p className="mt-1 text-sm leading-relaxed text-ink-300">{mission.rationale}</p>
        </div>
      </div>
    </Card>
  );
}

/** Section G: the roadmap as a connected path (done / current / upcoming),
 * reusing the same <PathTrack> primitive the roadmap page itself uses for
 * its journey overview, rather than a second, different-looking timeline
 * component. Real phase titles and summaries, not placeholder stage names. */
function RoadmapTimeline({ roadmap }: { roadmap: Roadmap }) {
  const firstIncomplete = roadmap.phases.findIndex((p) => p.progress_pct < 100);
  const waypoints: PathWaypoint[] = roadmap.phases.map((phase, i) => ({
    icon: Flag,
    label: phase.title,
    caption: phase.summary,
    state: phase.progress_pct === 100 ? "done" : i === firstIncomplete ? "active" : "upcoming",
  }));

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <p className="eyebrow">Career roadmap</p>
        <Link href="/roadmap" className="text-xs font-medium text-accent-light hover:underline">
          Open full roadmap
        </Link>
      </div>
      <PathTrack waypoints={waypoints} orientation="vertical" size="sm" className="mt-5" />
    </Card>
  );
}

/** Section H: "Your next step" — a short, real, forward-looking chain
 * (what's next, then what, then the milestone it leads to), not a
 * decorative example. Every line comes straight off the dashboard payload. */
function NextStep({ dashboard }: { dashboard: Dashboard }) {
  const tasks = dashboard.today_mission?.tasks ?? [];
  const firstIncompleteIdx = tasks.findIndex((t) => !t.done);
  const afterNext = firstIncompleteIdx >= 0 ? tasks.slice(firstIncompleteIdx + 1).find((t) => !t.done) : null;

  const steps: string[] = [dashboard.recommended_next_action];
  if (afterNext) steps.push(afterNext.title);
  if (dashboard.upcoming_milestone) steps.push(`Then: ${dashboard.upcoming_milestone}`);

  return (
    <Card className="p-6">
      <p className="eyebrow">Today on your roadmap</p>
      <ol className="mt-4 space-y-3">
        {steps.map((step, i) => (
          <li key={i} className="flex flex-col gap-2">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-accent/12 font-mono text-[10px] font-semibold text-accent-light">
                {i + 1}
              </span>
              <p className="text-sm leading-snug text-ink-200">{step}</p>
            </div>
            {i < steps.length - 1 && <ArrowDown className="ml-[9px] h-3.5 w-3.5 text-ink-700" aria-hidden="true" />}
          </li>
        ))}
      </ol>
      <Link
        href="/mentor"
        className="focus-ring mt-5 flex items-center gap-2 rounded-lg border-t border-[rgb(var(--fg-tint)/0.08)] pt-4 text-xs font-medium text-ink-400 hover:text-accent-light"
      >
        <MessageCircle className="h-3.5 w-3.5" /> Stuck? Ask the AI Mentor for a hint.
      </Link>
    </Card>
  );
}

/** Section J: a subtle feed, real events only (no synthesized rows), with
 * an honest empty state instead of a blank gap. */
function RecentActivity({ items }: { items: Dashboard["recent_activity"] }) {
  return (
    <Card className="p-6">
      <p className="eyebrow flex items-center gap-1.5">
        <History className="h-3.5 w-3.5" /> Recent activity
      </p>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-ink-500">No activity yet. Complete your first lesson to see it here.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-success" />
              <div className="min-w-0 flex-1">
                <p className="text-ink-300">{item.label}</p>
                <p className="text-xs text-ink-500">{formatRelativeTime(item.created_at)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-10">
      <div>
        <Skeleton className="h-3 w-32" />
        <Skeleton className="mt-3 h-9 w-80" />
        <Skeleton className="mt-6 h-2.5 w-full max-w-xl rounded-full" />
      </div>
      <Skeleton className="h-24 w-full rounded-2xl" />
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Skeleton className="h-80 w-full rounded-2xl" />
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    </div>
  );
}
