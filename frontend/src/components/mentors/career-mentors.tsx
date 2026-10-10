"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { MentorAvatar } from "@/components/mentors/mentor-avatar";
import { SmartMentorRecommendation } from "@/components/mentors/smart-mentor-recommendation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Mentor } from "@/types";

/**
 * Mentors for one career, on that career's page. Signed-in people get the
 * personalised match built from their own skill gaps. Everyone else sees the
 * public list of mentors who cover this career, so the page never silently
 * shows nothing (and never calls an endpoint that needs a login).
 */
export function CareerMentors({ pathSlug, pathName }: { pathSlug: string; pathName: string }) {
  const { user, loading } = useAuth();
  const [mentors, setMentors] = useState<Mentor[] | null>(null);

  useEffect(() => {
    if (loading || user) return;
    let cancelled = false;
    api
      .get<Mentor[]>(`/mentors?path=${encodeURIComponent(pathSlug)}`, { auth: false })
      .then((res) => {
        if (!cancelled) setMentors(res);
      })
      .catch(() => {
        if (!cancelled) setMentors([]);
      });
    return () => {
      cancelled = true;
    };
  }, [pathSlug, user, loading]);

  if (loading) return null;
  if (user) return <SmartMentorRecommendation pathSlug={pathSlug} pathName={pathName} />;
  if (!mentors || mentors.length === 0) return null;

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-100">
          <Users className="h-4 w-4 text-accent-light" /> Mentors for {pathName}
        </h3>
        <Link href={`/mentors?path=${encodeURIComponent(pathSlug)}`} className="flex items-center gap-1 text-xs font-medium text-accent-light hover:underline">
          See all mentors <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <ul className="space-y-3">
        {mentors.map((m) => (
          <li key={m.id}>
            <Link href={`/mentors/${m.slug || m.id}`} className="focus-ring flex items-center gap-3 rounded-xl p-1 hover:bg-[rgb(var(--fg-tint)/0.04)]">
              <MentorAvatar displayName={m.display_name} avatarUrl={m.avatar_url} size="md" />
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-ink-100">{m.display_name}</span>
                <span className="block truncate text-xs text-ink-500">{m.headline}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
