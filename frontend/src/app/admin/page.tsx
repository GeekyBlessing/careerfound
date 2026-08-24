"use client";

import { useEffect, useState } from "react";
import { Users, TrendingUp, BookOpen, FolderGit2, Briefcase, Check, X } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SkeletonCard } from "@/components/ui/skeleton";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { MentorApplication } from "@/types";

interface AdminOverview {
  total_users: number;
  daily_active_users: number;
  weekly_active_users: number;
  total_assessments_completed: number;
  total_roadmaps_started: number;
  total_projects_completed: number;
  total_lessons_completed: number;
  most_popular_paths: { path: string; roadmaps_started: number }[];
  completion_rate_pct: number;
  mentor_sessions_booked: number;
}

export default function AdminPage() {
  const { user } = useAuth();
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    api
      .get<AdminOverview>("/admin/metrics/overview")
      .then(setOverview)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load admin metrics."))
      .finally(() => setLoading(false));
  }, [user]);

  if (user && user.role !== "admin") {
    return (
      <AppShell>
        <Alert>You need admin access to view this page.</Alert>
      </AppShell>
    );
  }

  const stats = overview
    ? [
        { label: "Total users", value: overview.total_users, icon: Users },
        { label: "Daily active users", value: overview.daily_active_users, icon: TrendingUp },
        { label: "Weekly active users", value: overview.weekly_active_users, icon: TrendingUp },
        { label: "Assessments completed", value: overview.total_assessments_completed, icon: BookOpen },
        { label: "Roadmaps started", value: overview.total_roadmaps_started, icon: BookOpen },
        { label: "Projects completed", value: overview.total_projects_completed, icon: FolderGit2 },
        { label: "Lessons completed", value: overview.total_lessons_completed, icon: BookOpen },
        { label: "Mentor sessions booked", value: overview.mentor_sessions_booked, icon: Briefcase },
      ]
    : [];

  return (
    <AppShell>
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-accent-light">Admin</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink-100">Platform overview</h1>
      </div>

      {loading && <SkeletonCard />}
      {error && <Alert>{error}</Alert>}

      {overview && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => (
              <Card key={s.label}>
                <CardContent className="p-5">
                  <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-[rgb(var(--fg-tint)/0.06)] text-ink-300">
                    <s.icon className="h-4 w-4" />
                  </div>
                  <p className="text-2xl font-semibold text-ink-100">{s.value}</p>
                  <p className="text-xs text-ink-500">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardContent className="p-6">
              <p className="mb-4 text-sm font-semibold text-ink-100">Most popular paths</p>
              <div className="space-y-3">
                {overview.most_popular_paths.length === 0 && <p className="text-xs text-ink-500">No roadmaps started yet.</p>}
                {overview.most_popular_paths.map((p) => (
                  <div key={p.path} className="flex items-center justify-between text-sm">
                    <span className="text-ink-300">{p.path}</span>
                    <span className="text-ink-500">{p.roadmaps_started} started</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-ink-500">Lesson completion rate: {overview.completion_rate_pct}%</p>
            </CardContent>
          </Card>

          <MentorApplicationsSection />
        </div>
      )}
    </AppShell>
  );
}

function MentorApplicationsSection() {
  const [applications, setApplications] = useState<MentorApplication[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);

  function load() {
    api
      .get<MentorApplication[]>("/mentor-applications?status_filter=pending")
      .then(setApplications)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load mentor applications."));
  }

  useEffect(load, []);

  async function act(id: string, action: "approve" | "reject") {
    setActingId(id);
    try {
      await api.post(`/mentor-applications/${id}/${action}`, {});
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't update that application.");
    } finally {
      setActingId(null);
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <p className="mb-1 text-sm font-semibold text-ink-100">Pending mentor applications</p>
        <p className="mb-4 text-xs text-ink-500">
          Approval creates a real, but explicitly unverified, mentor profile, no automated identity or expertise
          check is performed.
        </p>
        {error && <Alert className="mb-4">{error}</Alert>}
        {applications && applications.length === 0 && <p className="text-xs text-ink-500">No pending applications.</p>}
        <div className="space-y-3">
          {applications?.map((app) => (
            <div key={app.id} className="rounded-xl border border-[rgb(var(--fg-tint)/0.06)] bg-[rgb(var(--fg-tint)/0.02)] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink-100">
                    {app.applicant_name} <span className="text-xs text-ink-500">({app.applicant_email})</span>
                  </p>
                  <p className="mt-0.5 text-xs text-ink-400">{app.headline}</p>
                  <p className="mt-1.5 text-xs text-ink-500">{app.bio}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {app.paths.map((p) => (
                      <Badge key={p}>{p.replace(/-/g, " ")}</Badge>
                    ))}
                  </div>
                  {app.years_experience != null && (
                    <p className="mt-1.5 text-xs text-ink-500">{app.years_experience} years of experience (self-reported)</p>
                  )}
                </div>
                <div className="flex flex-shrink-0 gap-2">
                  <Button size="sm" onClick={() => act(app.id, "approve")} loading={actingId === app.id} className="gap-1">
                    <Check className="h-3 w-3" /> Approve
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => act(app.id, "reject")} loading={actingId === app.id} className="gap-1">
                    <X className="h-3 w-3" /> Reject
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
