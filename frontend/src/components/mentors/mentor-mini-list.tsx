"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, ArrowRight, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MentorAvatar } from "@/components/mentors/mentor-avatar";
import { api, ApiError } from "@/lib/api";
import { mentorPriceLabel } from "@/lib/utils";
import type { Mentor } from "@/types";

/**
 * Compact "Find a mentor for this path" section — reused on the dashboard,
 * the active roadmap page, and a career's detail page. Fetches mentors
 * filtered to a single path via GET /mentors?path=<slug> and links out to
 * the full marketplace (pre-filtered) for booking.
 */
export function MentorMiniList({ pathSlug, pathName, limit = 3 }: { pathSlug: string; pathName: string; limit?: number }) {
  const [mentors, setMentors] = useState<Mentor[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setMentors(null);
    setError(null);
    api
      .get<Mentor[]>(`/mentors?path=${encodeURIComponent(pathSlug)}`)
      .then((data) => {
        if (!cancelled) setMentors(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Couldn't load mentors.");
      });
    return () => {
      cancelled = true;
    };
  }, [pathSlug]);

  if (error) return null; // fail quietly — this is a secondary section, not the main content
  if (mentors && mentors.length === 0) return null;

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-accent-light" />
          <h3 className="text-sm font-semibold text-ink-100">Find a mentor for {pathName}</h3>
        </div>
        <Link
          href={`/mentors?path=${encodeURIComponent(pathSlug)}`}
          className="flex items-center gap-1 text-xs font-medium text-accent-light hover:text-accent"
        >
          See all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {!mentors && (
        <div className="grid gap-3 sm:grid-cols-3">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
      )}

      {mentors && mentors.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-3">
          {mentors.slice(0, limit).map((mentor) => (
            <Link
              key={mentor.id}
              href={`/mentors?path=${encodeURIComponent(pathSlug)}`}
              className="block rounded-xl border border-[rgb(var(--fg-tint)/0.1)] bg-base-950/40 p-4 transition hover:border-accent/30"
            >
              <div className="flex items-center gap-2.5">
                <MentorAvatar displayName={mentor.display_name} avatarUrl={mentor.avatar_url} size="sm" />
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-ink-100">{mentor.display_name}</p>
                  <div className="flex items-center gap-1 text-[11px] text-ink-500">
                    <Star className="h-2.5 w-2.5 fill-warning text-warning" />
                    {mentor.rating_avg.toFixed(1)}
                  </div>
                </div>
              </div>
              <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-ink-500">{mentor.headline}</p>
              <p className="mt-2 text-[11px] font-medium text-ink-300">{mentorPriceLabel(mentor)}</p>
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}
