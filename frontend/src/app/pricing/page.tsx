import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { PublicShell } from "@/components/layout/public-shell";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { pricingTiers } from "@/lib/marketing-content";

export const metadata: Metadata = {
  title: "Pricing | CareerFound",
  description: "Free to start. Real, paid pricing for 1:1 mentorship and career consultation, explained honestly.",
};

export default function PricingPage() {
  return (
    <PublicShell>
      <div className="py-8 sm:py-12">
        <SectionHeading
          eyebrow="Pricing"
          title="Start free. Bring in a human when you're ready."
          description="The assessment, roadmap, and projects are free. 1:1 mentorship and the career consultation are paid, real services, priced clearly below."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {pricingTiers.map((tier) => (
            <Card
              key={tier.name}
              className={cn(
                "relative flex flex-col p-8",
                tier.highlighted && "border-accent/40 shadow-raised sm:-translate-y-2"
              )}
            >
              {tier.highlighted && (
                <div className="absolute inset-x-0 -top-px mx-auto h-px w-2/3 bg-gradient-to-r from-transparent via-accent-light to-transparent" />
              )}
              {tier.paid ? (
                <Badge tone="warning" className="mb-4 w-fit">Paid service</Badge>
              ) : tier.highlighted ? (
                <Badge tone="accent" className="mb-4 w-fit">Most popular</Badge>
              ) : null}
              <h3 className="text-lg font-semibold tracking-tight text-ink-100">{tier.name}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-semibold text-ink-100">{tier.price}</span>
                <span className="text-sm text-ink-500">{tier.period}</span>
              </div>
              {tier.priceAlt && <p className="mt-0.5 text-xs text-ink-500">or {tier.priceAlt}</p>}
              <p className="mt-3 text-sm text-ink-500">{tier.description}</p>
              <ul className="mt-6 flex-1 space-y-2.5 text-sm text-ink-300">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href={tier.href} className="mt-8">
                <Button variant={tier.highlighted ? "primary" : "secondary"} className="w-full">
                  {tier.cta}
                </Button>
              </Link>
            </Card>
          ))}
        </div>

        <p className="mx-auto mt-10 max-w-xl text-center text-sm text-ink-500">
          Mentorship and consultation requests go to the CareerFound team directly, nothing is charged
          automatically. A broader paid Pro plan (deeper AI features on the free tools above, planned at
          $10/month) is still being built and isn&apos;t billable yet.
        </p>
      </div>
    </PublicShell>
  );
}
