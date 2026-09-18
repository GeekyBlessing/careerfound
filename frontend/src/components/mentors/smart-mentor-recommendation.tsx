"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Star, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MentorAvatar } from "@/components/mentors/mentor-avatar";
import { MentorBadge } from "@/components/mentors/mentor-badge";
import { api, ApiError } from "@/lib/api";
import { mentorPriceLabel } from "@/lib/utils";
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
export function SmartMentorRecommendation({
  pathSlug,
  pathName,
  variant = "compact",
}: {
  pathSlug: string;
  pathName: string;
  /** "compact" (default) is the original list-teaser used on the roadmap
   * page — unchanged. "featured" is the dashboard's "Your Mentor Match"
   * treatment: a large photo, rating and a real reason presented as the
   * section's whole purpose rather than a secondary panel. Both read from
   * the same GET /mentors/recommended call; only the presentation differs. */
  variant?: "compact" | "featured";
}) {
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

  if (variant === "featured") {
    return <FeaturedMentorMatch data={data} error={error} pathSlug={pathSlug} />;
  }

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
                className="block rounded-xl border border-[rgb(var(--fg-tint)/0.1)] bg-base-950/40 p-4 transition hover:border-accent/30"
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
                      {mentorPriceLabel(top.mentor)}
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

/**
 * The dashboard's "Your Mentor Match": a real photo at real size, a real
 * reason grounded in the same skill-gap snapshot as the compact variant,
 * and a "View profile" action that goes straight to /mentors/{id} — never
 * to /mentors/apply, which is a completely different, unrelated route (see
 * MentorBadge's own note on never conflating real and demo mentors).
 * Designs its own empty state (no silent null-render) for the case where
 * this path genuinely has no mentor coverage yet.
 */
function FeaturedMentorMatch({
  data,
  error,
  pathSlug,
}: {
  data: MentorRecommendationRequest | null;
  error: string | null;
  pathSlug: string;
}) {
  return (
    <div>
      <p className="eyebrow">Your mentor match</p>

      {!data && !error && (
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-16 w-16 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      )}

      {(error || (data && data.matches.length === 0)) && (
        <div className="mt-4 flex flex-col items-center gap-3 rounded-xl border border-dashed border-[rgb(var(--fg-tint)/0.12)] px-5 py-8 text-center">
          <Users className="h-5 w-5 text-ink-500" />
          <p className="text-sm font-medium text-ink-100">No mentor match yet</p>
          <p className="max-w-[220px] text-xs leading-relaxed text-ink-500">
            We don&apos;t have a strong mentor match for this path yet. Browse the full marketplace instead.
          </p>
          <Link href={`/mentors?path=${encodeURIComponent(pathSlug)}`}>
            <Button variant="secondary" size="sm">
              Browse mentors
            </Button>
          </Link>
        </div>
      )}

      {data && data.matches.length > 0 && (() => {
        const top = data.matches[0];
        if (!top) return null;
        return (
          <div className="mt-4">
            <div className="flex items-start gap-4">
              <MentorAvatar displayName={top.mentor.display_name} avatarUrl={top.mentor.avatar_url} size="md" />
              <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-display text-lg font-semibold leading-tight text-ink-100">{top.mentor.display_name}</p>
                  <MentorBadge mentor={top.mentor} />
                </div>
                <p className="mt-0.5 text-xs text-ink-500">{top.mentor.headline}</p>
                <div className="mt-1.5 flex items-center gap-1.5 text-xs text-ink-400">
                  <Star className="h-3 w-3 fill-warning text-warning" />
                  {top.mentor.rating_count > 0 ? top.mentor.rating_avg.toFixed(1) : "No ratings yet"}
                  <span className="text-ink-700">·</span>
                  {mentorPriceLabel(top.mentor)}
                </div>
              </div>
            </div>

            <p className="mt-4 border-l-2 border-accent/40 pl-3 text-sm italic leading-relaxed text-ink-300">
              &ldquo;{top.reason}&rdquo;
            </p>

            <Link href={`/mentors/${top.mentor.id}`} className="mt-5 block">
              <Button variant="secondary" size="sm" className="w-full gap-1.5">
                View profile <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        );
      })()}
    </div>
  );
}
