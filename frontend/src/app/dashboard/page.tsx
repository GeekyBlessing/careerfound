"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Circle,
  ArrowRight,
  MessageCircle,
  Map as MapIcon,
  Trophy,
  Sparkles,
} from "lucide-react";
import { AppShell, StreakBadge } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadialProgress, ProgressBar } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Alert } from "@/components/ui/alert";
import { SmartMentorRecommendation } from "@/components/mentors/smart-mentor-recommendation";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatMinutes } from "@/lib/utils";
import type { Dashboard, MissionTask } from "@/types";

const READINESS_LABELS: { key: keyof NonNullable<Dashboard["readiness"]>; label: string }[] = [
  { key: "knowledge_pct", label: "Knowledge" },
  { key: "projects_pct", label: "Projects" },
  { key: "portfolio_pct", label: "Portfolio" },
  { key: "interview_pct", label: "Interview readiness" },
  { key: "practical_pct", label: "Practical skills" },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    api
      .get<Dashboard>("/dashboard")
      .then(setDashboard)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load your dashboard."))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <AppShell>
      {loading && <DashboardSkeleton />}
      {error && <Alert>{error}</Alert>}

      {dashboard && !dashboard.has_active_roadmap && (
        <EmptyState
          icon={Sparkles}
          title="You haven't started a roadmap yet"
          description="Take the 'Find Your Tech Path' assessment to get a personalized roadmap built around what actually fits you."
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
        <div className="space-y-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-semibold text-ink-100">{dashboard.greeting}</h1>
              <p className="mt-1 text-sm text-ink-500">
                On track: <span className="text-ink-300">{dashboard.path_name}</span>
              </p>
            </div>
            <StreakBadge days={dashboard.current_streak_days} />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              {dashboard.today_mission && <TodayMissionCard mission={dashboard.today_mission} />}

              <Card>
                <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-ink-500">Recommended next action</p>
                    <p className="mt-1 text-sm font-medium text-ink-100">{dashboard.recommended_next_action}</p>
                  </div>
                  <Link href="/roadmap">
                    <Button variant="secondary" size="sm" className="gap-1.5">
                      Go to roadmap <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                  <CardContent className="p-5">
                    <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.06] text-ink-300">
                      <MapIcon className="h-4 w-4" />
                    </div>
                    <p className="text-xs font-medium uppercase tracking-wide text-ink-500">Current project</p>
                    <p className="mt-1 text-sm text-ink-100">{dashboard.current_project_title || "All caught up"}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-5">
                    <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.06] text-ink-300">
                      <Trophy className="h-4 w-4" />
                    </div>
                    <p className="text-xs font-medium uppercase tracking-wide text-ink-500">Upcoming milestone</p>
                    <p className="mt-1 text-sm text-ink-100">{dashboard.upcoming_milestone || "Final phase!"}</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="space-y-6">
              {dashboard.readiness && <ReadinessCard readiness={dashboard.readiness} />}
              <Card>
                <CardContent className="p-6">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-accent/15 text-accent-light">
                    <MessageCircle className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-semibold text-ink-100">Stuck on something?</p>
                  <p className="mt-1 text-xs text-ink-500">Your AI Mentor gives hints, not just answers.</p>
                  <Link href="/mentor">
                    <Button variant="secondary" size="sm" className="mt-4 w-full gap-1.5">
                      Ask the AI Mentor <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>

          {dashboard.path_slug && (
            <SmartMentorRecommendation pathSlug={dashboard.path_slug} pathName={dashboard.path_name || "your path"} />
          )}
        </div>
      )}
    </AppShell>
  );
}

function TodayMissionCard({ mission }: { mission: NonNullable<Dashboard["today_mission"]> }) {
  const [tasks, setTasks] = useState<MissionTask[]>(mission.tasks);
  const completedCount = tasks.filter((t) => t.done).length;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-accent-light">Today&apos;s mission</p>
            <p className="mt-1 text-sm text-ink-500">⏱ {formatMinutes(mission.total_minutes)} total</p>
          </div>
          <Badge tone="accent">{completedCount}/{tasks.length} done</Badge>
        </div>

        <ul className="mt-5 space-y-2.5">
          {tasks.map((task, i) => (
            <li
              key={i}
              className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 transition-colors hover:bg-white/[0.04]"
            >
              <button
                onClick={() =>
                  setTasks((prev) => prev.map((t, idx) => (idx === i ? { ...t, done: !t.done } : t)))
                }
                className="mt-0.5 flex-shrink-0 text-ink-500 hover:text-accent-light focus-ring rounded-full"
                aria-label={task.done ? "Mark as not done" : "Mark as done"}
              >
                {task.done ? <CheckCircle2 className="h-5 w-5 text-success" /> : <Circle className="h-5 w-5" />}
              </button>
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-medium ${task.done ? "text-ink-500 line-through" : "text-ink-100"}`}>
                  {task.title}
                </p>
                <div className="mt-1 flex items-center gap-2 text-xs text-ink-500">
                  <Badge className="capitalize">{task.type}</Badge>
                  <span>{task.est_minutes} min</span>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-5 rounded-xl bg-accent/[0.06] px-4 py-3 text-xs leading-relaxed text-ink-400">
          <span className="font-medium text-accent-light">Why you&apos;re doing this: </span>
          {mission.rationale}
        </p>
      </CardContent>
    </Card>
  );
}

function ReadinessCard({ readiness }: { readiness: NonNullable<Dashboard["readiness"]> }) {
  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Tech Readiness Score</p>
        <div className="mt-4 flex items-center justify-center">
          <RadialProgress value={readiness.overall} size={120} label="/ 100" />
        </div>
        <div className="mt-5 space-y-3">
          {READINESS_LABELS.map((item) => (
            <div key={item.key}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-ink-400">{item.label}</span>
                <span className="text-ink-300">{readiness[item.key]}%</span>
              </div>
              <ProgressBar value={readiness[item.key] as number} />
            </div>
          ))}
        </div>
        {readiness.next_actions.length > 0 && (
          <div className="mt-5 border-t border-white/10 pt-4">
            <p className="mb-2 text-xs font-medium text-ink-300">What would move your score up:</p>
            <ul className="space-y-1.5 text-xs text-ink-500">
              {readiness.next_actions.map((a, i) => (
                <li key={i}>• {a}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    </div>
  );
}
