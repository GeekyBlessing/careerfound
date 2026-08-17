"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Star, Briefcase, ArrowRight, X, UserPlus } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { SkeletonCard } from "@/components/ui/skeleton";
import { MentorAvatar } from "@/components/mentors/mentor-avatar";
import { MentorBadge } from "@/components/mentors/mentor-badge";
import { api, ApiError } from "@/lib/api";
import { formatCents } from "@/lib/utils";
import type { Mentor } from "@/types";

export default function MentorsPage() {
  return (
    <Suspense fallback={null}>
      <MentorsPageInner />
    </Suspense>
  );
}

function MentorsPageInner() {
  const searchParams = useSearchParams();
  const pathFilter = searchParams.get("path");

  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const query = pathFilter ? `?path=${encodeURIComponent(pathFilter)}` : "";
    api
      .get<Mentor[]>(`/mentors${query}`)
      .then(setMentors)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load mentors."))
      .finally(() => setLoading(false));
  }, [pathFilter]);

  return (
    <AppShell>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-accent-light">Mentorship Marketplace</p>
          <h1 className="mt-1 text-2xl font-semibold text-ink-100">Real professionals, when you need a human</h1>
          <p className="mt-1 text-sm text-ink-500">
            Booking is fully functional and stored — payment capture is a Phase 2 integration point (see docs), so
            sessions are created in &ldquo;requested&rdquo; status without a real charge.
          </p>
          {pathFilter && (
            <div className="mt-3 flex items-center gap-2">
              <Badge tone="accent" className="capitalize">
                {pathFilter.replace(/-/g, " ")}
              </Badge>
              <Link href="/mentors" className="flex items-center gap-1 text-xs text-ink-500 hover:text-ink-300">
                <X className="h-3 w-3" /> Clear filter
              </Link>
            </div>
          )}
        </div>
        <Link href="/mentors/apply">
          <Button variant="secondary" size="sm" className="gap-1.5">
            <UserPlus className="h-3.5 w-3.5" /> Apply to become a mentor
          </Button>
        </Link>
      </div>

      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}
      {error && <Alert>{error}</Alert>}

      {!loading && !error && mentors.length === 0 && (
        <Alert>
          No mentors match &ldquo;{pathFilter?.replace(/-/g, " ")}&rdquo; yet.{" "}
          <Link href="/mentors" className="underline">
            Browse all mentors
          </Link>{" "}
          instead.
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mentors.map((mentor) => (
          <Link key={mentor.id} href={`/mentors/${mentor.id}`}>
            <Card className="h-full transition-colors hover:bg-white/[0.045]">
              <CardContent className="flex h-full flex-col p-6">
                <div className="flex items-center gap-3">
                  <MentorAvatar displayName={mentor.display_name} avatarUrl={mentor.avatar_url} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink-100">{mentor.display_name}</p>
                    <div className="flex items-center gap-1 text-xs text-ink-500">
                      <Star className="h-3 w-3 fill-warning text-warning" />
                      {mentor.rating_count > 0 ? `${mentor.rating_avg.toFixed(1)} (${mentor.rating_count})` : "No ratings yet"}
                    </div>
                  </div>
                  <MentorBadge mentor={mentor} />
                </div>
                <p className="mt-3 text-sm text-ink-300">{mentor.headline}</p>
                <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-ink-500">{mentor.bio}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {mentor.paths.map((p) => (
                    <Badge key={p}>{p.replace(/-/g, " ")}</Badge>
                  ))}
                </div>
                <div className="mt-4 flex flex-1 items-end justify-between text-xs text-ink-500">
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-3 w-3" /> {mentor.years_experience ? `${mentor.years_experience} yrs` : "New mentor"}
                  </span>
                  <span className="font-medium text-ink-300">
                    {mentor.hourly_rate_cents > 0 ? `${formatCents(mentor.hourly_rate_cents, mentor.currency)}/hr` : "Free"}
                  </span>
                </div>
                <Button size="sm" variant="secondary" className="mt-4 w-full gap-1.5">
                  View profile <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
