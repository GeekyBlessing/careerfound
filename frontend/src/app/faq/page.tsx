import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/public-shell";
import { SectionHeading } from "@/components/marketing/section-heading";
import { faqs } from "@/lib/marketing-content";

export const metadata: Metadata = {
  title: "FAQ | CareerFound",
  description: "Answers to what CareerFound is, how the assessment and roadmap work, pricing, and mentorship.",
};

export default function FAQPage() {
  return (
    <PublicShell>
      <div className="mx-auto max-w-3xl py-8 sm:py-12">
        <SectionHeading eyebrow="FAQ" title="Questions people ask before starting" />
        <div className="mt-10 space-y-3">
          {faqs.map((f) => (
            <details
              key={f.q}
              className="group rounded-xl border border-[rgb(var(--fg-tint)/0.1)] bg-[rgb(var(--fg-tint)/0.03)] p-5 open:bg-[rgb(var(--fg-tint)/0.05)]"
            >
              <summary className="cursor-pointer list-none text-sm font-medium text-ink-100 marker:content-none">
                {f.q}
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-ink-500">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </PublicShell>
  );
}
