import type { Metadata } from "next";
import { Check, MessageCircleQuestion } from "lucide-react";
import { PublicShell } from "@/components/layout/public-shell";
import { SectionHeading } from "@/components/marketing/section-heading";
import { ServiceRequestForm } from "@/components/marketing/service-request-form";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { pricingTiers } from "@/lib/marketing-content";

export const metadata: Metadata = {
  title: "Career Consultation | CareerFound",
  description: "A focused 30-minute career consultation with CareerFound's founder: ₦10,000 or $7. A paid service.",
};

export default function ConsultationPage() {
  const tier = pricingTiers.find((t) => t.name === "Career Consultation")!;

  return (
    <PublicShell>
      <div className="py-8 sm:py-12">
        <SectionHeading
          as="h1"
          eyebrow="Career Consultation"
          title="One focused conversation, 30 minutes"
          description="For when you have one specific question or decision and want a straight answer, not an ongoing program."
        />

        <div className="mx-auto mt-10 grid max-w-4xl gap-8 lg:grid-cols-5">
          <Card className="p-8 lg:col-span-3">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/12 text-accent-light">
              <MessageCircleQuestion className="h-5 w-5" />
            </div>
            <Badge tone="warning" className="mb-4 w-fit">Paid service</Badge>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-ink-100">{tier.price}</span>
              <span className="text-sm text-ink-500">/ {tier.period}</span>
            </div>
            <p className="mt-1 text-sm text-ink-500">or {tier.priceAlt}</p>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-500">
              A single, focused 30-minute session. What&apos;s included:
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
              payment and a time.
            </p>
          </Card>

          <div className="lg:col-span-2">
            <ServiceRequestForm service="consultation" serviceLabel="Career Consultation" />
          </div>
        </div>
      </div>
    </PublicShell>
  );
}
