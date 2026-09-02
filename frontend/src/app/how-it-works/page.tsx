import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PublicShell } from "@/components/layout/public-shell";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { steps } from "@/lib/marketing-content";

export const metadata: Metadata = {
  title: "How It Works | CareerFound",
  description: "From confused to job-ready: discover your path, get a roadmap, build real projects, and track your readiness.",
};

export default function HowItWorksPage() {
  return (
    <PublicShell>
      <div className="py-8 sm:py-12">
        <SectionHeading
          eyebrow="How it works"
          title="From confused to job-ready, one clear step at a time"
          description="No guessing, no generic course catalog. Every step builds on the last."
        />

        <div className="mx-auto mt-14 max-w-2xl space-y-6">
          {steps.map((s, i) => (
            <Card key={s.title} className="flex gap-5 p-6">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent-light">
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-ink-100">{s.title.replace(/^\d+\.\s*/, "")}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-500">{s.body}</p>
              </div>
              {i < steps.length - 1 && <span className="sr-only">Then:</span>}
            </Card>
          ))}
        </div>

        <div className="mt-14 text-center">
          <Link href="/onboarding">
            <Button size="lg" className="gap-2">
              Find My Tech Path <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <p className="mt-3 text-xs text-ink-500">No credit card required · Takes about 5 minutes</p>
        </div>
      </div>
    </PublicShell>
  );
}
