import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PublicShell } from "@/components/layout/public-shell";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About | CareerFound",
  description: "Why CareerFound exists, what it actually does, and who it's built for.",
};

export default function AboutPage() {
  return (
    <PublicShell>
      <div className="mx-auto max-w-2xl py-8 sm:py-12">
        <SectionHeading eyebrow="About" title="Why CareerFound exists" />

        <div className="mt-10 space-y-6 text-sm leading-relaxed text-ink-300">
          <p>
            Most people who want to get into tech run into the same wall before they even start: there are too
            many possible paths, too much conflicting advice, and no clear way to tell which one actually fits
            them. Cybersecurity, software engineering, data, cloud, design, IT support, dozens of names on a
            list, no honest way to compare them against your own time, budget, and interests.
          </p>
          <p>
            CareerFound is built to replace that guesswork with a straight answer. You answer honest questions
            about your situation and how you think, and the assessment gives you a specific recommendation
            instead of a catalog. From there you get a roadmap for that one path, real projects to build along
            the way, and a way to track how close you are to being job-ready, instead of a pile of course links
            and no sense of progress.
          </p>
          <p>
            The platform is early. Some parts, like the mentor marketplace, mix a small number of real,
            clearly-labeled mentors with sample profiles used for testing the experience. Payment and some
            advanced features aren&apos;t live yet. Where something isn&apos;t finished, we&apos;d rather say so
            than fake it, so what you see working is actually working.
          </p>
          <p>
            CareerFound is for people just starting out, especially people who feel behind or unsure where to
            begin. If that&apos;s you, the assessment is the fastest way to find out where you&apos;d actually
            fit.
          </p>
        </div>

        <Card className="mt-10">
          <CardContent className="flex flex-col items-start gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-ink-100">Ready to find your path?</p>
            <Link href="/onboarding">
              <Button className="gap-1.5">
                Find My Tech Path <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </PublicShell>
  );
}
