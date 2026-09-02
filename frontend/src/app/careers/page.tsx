"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Signal } from "lucide-react";
import { PublicShell } from "@/components/layout/public-shell";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { SkeletonCard } from "@/components/ui/skeleton";
import { api, ApiError } from "@/lib/api";
import type { CareerPath } from "@/types";

export default function CareersListPage() {
  const [paths, setPaths] = useState<CareerPath[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<CareerPath[]>("/careers")
      .then(setPaths)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load career paths."));
  }, []);

  return (
    <PublicShell>
      <div className="py-8 sm:py-12">
        <SectionHeading
          eyebrow="Career paths"
          title={paths ? `${paths.length} tech careers, one honest assessment to find yours` : "Tech careers, one honest assessment to find yours"}
          description="We don't just ask what you want to learn, we help you discover what actually fits how you think and what you enjoy."
        />

        {error && <Alert className="mx-auto mt-10 max-w-lg">{error}</Alert>}

        {!paths && !error && (
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}

        {paths && (
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {paths.map((path) => (
              <Link key={path.id} href={`/careers/${path.slug}`}>
                <Card className="flex h-full flex-col p-6 transition-colors hover:bg-[rgb(var(--fg-tint)/0.045)]">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-ink-100">{path.name}</p>
                    <span className="flex flex-shrink-0 items-center gap-1 text-xs text-ink-500">
                      <Signal className="h-3 w-3" /> {path.difficulty}/5
                    </span>
                  </div>
                  <p className="mt-2 flex-1 text-xs leading-relaxed text-ink-500">{path.summary}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {path.entry_roles.slice(0, 2).map((r) => (
                      <Badge key={r}>{r}</Badge>
                    ))}
                  </div>
                  <span className="mt-4 flex items-center gap-1.5 text-xs font-medium text-accent-light">
                    Explore career <ArrowRight className="h-3 w-3" />
                  </span>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PublicShell>
  );
}
