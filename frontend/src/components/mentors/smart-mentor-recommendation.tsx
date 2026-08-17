"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { MentorAvatar } from "@/components/mentors/mentor-avatar";
import { MentorBadge } from "@/components/mentors/mentor-badge";
import { api, ApiError } from "@/lib/api";
import { formatCents } from "@/lib/utils";
import type { MentorRecommendationRequest } from "@/types";

const LEVEL_TONE: Record<string, "success" | "accent" | "warning" | "neutral"> = {
  Beginner: "warning",
  Intermediate: "accent",
  Advanced: "success",
  "Not started": "neutral",
};

/**
 * The "smart mentorship" panel: reads the user's real skill-gap snapshot for
 * a path (GET /mentors/recommended) and surfaces the best-matched mentor
 * with a reason grounded in that data — reused on the dashboard, the active
 * roadmap page, and a career's detail page. Replaces the plain directory
 * teaser (MentorMiniList) everywhere it appeared.
 */
export function SmartMentorRecommendation({ pathSlug, pathName }: { pathSlug: string; pathName: string }) {
  const [data, setData] = useState<MentorRecommendationRequest | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setError(null);
    api
      .get<MentorRecommendationRequest>(`/mentors/recommended?path=${encodeURIComponent(pathSlug)}`)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Couldn't load mentor recommendations.");
      });
    return () => {
      cancelled = true;
    };
  }, [pathSlug]);

  if (error) return null; // secondary section — fail quietly
  if (data && data.matches.length === 0) return null;

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent-light" />
          <h3 className="text-sm font-semibold text-ink-100">Mentorship for {pathName}</h3>
        </div>
        <Link
          href={`/mentors?path=${encodeURIComponent(pathSlug)}`}
          className="flex items-center gap-1 text-xs font-medium text-accent-light hover:text-accent"
        >
          See all mentors <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {!data && (
        <div className="space-y-3">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
      )}

      {data && data.matches.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs text-ink-500">
            <span>Your current level:</span>
            <Badge tone={LEVEL_TONE[data.snapshot.level] || "neutral"}>{data.snapshot.level}</Badge>
            {data.snapshot.gaps.length > 0 && (
              <span>
                Biggest gaps: <span className="text-ink-300">{data.snapshot.gaps.map((g) => g.label).join(", ")}</span>
              </span>
            )}
          </div>

          {(() => {
            const top = data.matches[0];
            if (!top) return null;
            return (
              <Link
                href={`/mentors/${top.mentor.id}`}
                className="block rounded-xl border border-white/10 bg-base-950/40 p-4 transition hover:border-accent/30"
              >
                <div className="flex items-start gap-3">
                  <MentorAvatar displayName={top.mentor.display_name} avatarUrl={top.mentor.avatar_url} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-ink-100">{top.mentor.display_name}</p>
                      <MentorBadge mentor={top.mentor} />
                    </div>
                    <div className="mt-0.5 flex items-center gap-1 text-[11px] text-ink-500">
                      <Star className="h-2.5 w-2.5 fill-warning text-warning" />
                      {top.mentor.rating_count > 0 ? top.mentor.rating_avg.toFixed(1) : "No ratings yet"}
                      <span className="mx-1">·</span>
                      {top.mentor.hourly_rate_cents > 0 ? `${formatCents(top.mentor.hourly_rate_cents, top.mentor.currency)}/hr` : "Free"}
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-ink-400">{top.reason}</p>
                  </div>
                </div>
              </Link>
            );
          })()}
        </div>
      )}
    </Card>
  );
}
