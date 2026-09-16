import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/public-shell";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Alert } from "@/components/ui/alert";

export const metadata: Metadata = {
  title: "Refunds and Cancellations | CareerFound",
  description: "CareerFound's refund and cancellation policy for paid mentorship and consultation services.",
};

export default function RefundPolicyPage() {
  return (
    <PublicShell>
      <div className="mx-auto max-w-2xl py-8 sm:py-12">
        <SectionHeading as="h1" eyebrow="Refunds" title="Refunds and cancellations" />

        <Alert variant="info" className="mt-8">
          This is a plain-language description of the policy today, written by the team, not a lawyer. It will be
          replaced with a formally drafted policy as the product grows, and you should have it reviewed
          appropriately before relying on it for a real launch.
        </Alert>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-ink-300">
          <section>
            <h2 className="text-sm font-semibold text-ink-100">What this policy covers</h2>
            <p className="mt-2">
              This page covers CareerFound&apos;s two paid, human services: 1:1 Career Mentorship (2 months) and
              Career Consultation (a single 30-minute session). It doesn&apos;t cover the free assessment,
              roadmap, lessons, or projects, since there&apos;s nothing paid to refund there.
            </p>
          </section>
          <section>
            <h2 className="text-sm font-semibold text-ink-100">No payment is taken yet</h2>
            <p className="mt-2">
              CareerFound doesn&apos;t have a live payment processor connected today. Submitting a Mentorship or
              Consultation request through the pricing, mentorship, or consultation pages sends a real request
              (and a real confirmation email) to reserve your spot at the listed price, but no charge is made at
              submission time. You&apos;ll be told clearly, before any real charge is introduced, exactly how and
              when you&apos;d be billed.
            </p>
          </section>
          <section>
            <h2 className="text-sm font-semibold text-ink-100">Our intended policy once billing is live</h2>
            <p className="mt-2">
              Once real payment collection is turned on, our intent is: if you cancel a Career Consultation before
              it&apos;s scheduled or with reasonable notice beforehand, you&apos;re entitled to a full refund. If
              you cancel a Career Mentorship engagement before your first session, you&apos;re entitled to a full
              refund; after your first session has taken place, refunds for the remaining unused portion are
              considered case by case, since mentor time for your engagement has already been reserved. Requesting
              a reschedule instead of a cancellation costs nothing.
            </p>
          </section>
          <section>
            <h2 className="text-sm font-semibold text-ink-100">If a mentor doesn&apos;t show, or is a poor fit</h2>
            <p className="mt-2">
              If a scheduled Mentorship or Consultation session doesn&apos;t happen because of something on our or
              the mentor&apos;s side (a no-show, a cancellation with no reschedule offered), you&apos;re entitled
              to a full refund or a free replacement session, whichever you prefer.
            </p>
          </section>
          <section>
            <h2 className="text-sm font-semibold text-ink-100">How to request a cancellation or refund</h2>
            <p className="mt-2">
              Email{" "}
              <a href="mailto:hello@mycareerfound.com" className="text-accent-light hover:underline">
                hello@mycareerfound.com
              </a>{" "}
              with your name and which service you booked, and we&apos;ll handle it directly. Since there&apos;s no
              live billing yet, this currently means cancelling your reserved request, once real payments are
              live, refunds will be issued back to your original payment method.
            </p>
          </section>
          <section>
            <h2 className="text-sm font-semibold text-ink-100">Mentor marketplace sessions</h2>
            <p className="mt-2">
              Sessions booked through the mentor marketplace directory are a separate, currently free feature (see
              the Terms of use), not the paid Mentorship or Consultation services this policy is about, so there&apos;s
              nothing to refund there today either.
            </p>
          </section>
        </div>
      </div>
    </PublicShell>
  );
}
