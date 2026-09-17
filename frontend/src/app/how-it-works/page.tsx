import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PublicShell } from "@/components/layout/public-shell";
import { SectionHeading } from "@/components/marketing/section-heading";
import { JourneySteps } from "@/components/marketing/journey-steps";
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
          as="h1"
          eyebrow="How it works"
          title="From confused to job-ready, one clear step at a time"
          description="No guessing, no generic course catalog. Every step builds on the last."
        />

        <JourneySteps steps={steps} className="mt-14" />

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
