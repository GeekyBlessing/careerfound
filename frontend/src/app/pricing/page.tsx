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
  description: "Start free. Pro and paid mentorship pricing, explained honestly, no hidden checkout.",
};

export default function PricingPage() {
  return (
    <PublicShell>
      <div className="py-8 sm:py-12">
        <SectionHeading eyebrow="Pricing" title="Start free. Upgrade when you're ready to accelerate." />

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {pricingTiers.map((tier) => (
            <Card key={tier.name} className={cn("flex flex-col p-8", tier.highlighted && "border-accent/40")}>
              {tier.highlighted && <Badge tone="accent" className="mb-4 w-fit">Most popular</Badge>}
              <h3 className="text-lg font-semibold text-ink-100">{tier.name}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-semibold text-ink-100">{tier.price}</span>
                <span className="text-sm text-ink-500">{tier.period}</span>
              </div>
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
          Pro billing is not live yet, the tier above shows the plan we&apos;re building toward. Everyone gets
          the Free tier today. Mentorship sessions are booked and confirmed for real, payment capture is a
          Phase 2 integration point, so founding sessions are free.
        </p>
      </div>
    </PublicShell>
  );
}
