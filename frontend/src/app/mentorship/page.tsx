import type { Metadata } from "next";
import { Check } from "lucide-react";
import { PublicShell } from "@/components/layout/public-shell";
import { SectionHeading } from "@/components/marketing/section-heading";
import { ServiceRequestForm } from "@/components/marketing/service-request-form";
import { Badge } from "@/components/ui/badge";
import { pricingTiers } from "@/lib/marketing-content";

export const metadata: Metadata = {
  title: "1:1 Career Mentorship | CareerFound",
  description: "2 months of direct, one-on-one mentorship with CareerFound's founder: ₦250,000 or $200. A paid service.",
};

export default function MentorshipPage() {
  const tier = pricingTiers.find((t) => t.name === "1:1 Career Mentorship")!;

  return (
    <PublicShell>
      <div className="py-8 sm:py-12">
        <SectionHeading
          eyebrow="1:1 Career Mentorship"
          title="Direct mentorship, for two months"
          description="This is a paid, hands-on mentorship program with Toriola, CareerFound's founder, not a marketplace booking with a stranger."
        />

        <div className="mx-auto mt-10 grid max-w-4xl gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <Badge tone="warning" className="mb-4 w-fit">Paid service</Badge>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-ink-100">{tier.price}</span>
              <span className="text-sm text-ink-500">/ {tier.period}</span>
            </div>
            <p className="mt-1 text-sm text-ink-500">or {tier.priceAlt}</p>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-500">
              A structured, two-month program for people who want direction, not just information. What&apos;s
              included:
            </p>
            <ul className="mt-5 space-y-2.5 text-sm text-ink-300">
              {tier.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" />
                  {f}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-xs leading-relaxed text-ink-500">
              Submitting the form sends a request, it does not charge you. We&apos;ll reply by email to arrange
              payment and your first session.
            </p>
          </div>

          <div className="lg:col-span-2">
            <ServiceRequestForm service="mentorship" serviceLabel="1:1 Career Mentorship" />
          </div>
        </div>
      </div>
    </PublicShell>
  );
}
