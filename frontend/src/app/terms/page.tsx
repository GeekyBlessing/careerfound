import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/public-shell";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Alert } from "@/components/ui/alert";

export const metadata: Metadata = {
  title: "Terms | CareerFound",
  description: "The terms for using CareerFound.",
};

export default function TermsPage() {
  return (
    <PublicShell>
      <div className="mx-auto max-w-2xl py-8 sm:py-12">
        <SectionHeading as="h1" eyebrow="Terms" title="Terms of use" />

        <Alert variant="info" className="mt-8">
          This is a plain-language description of the terms today, written by the team, not a lawyer. It will be
          replaced with a formally drafted agreement as the product grows.
        </Alert>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-ink-300">
          <section>
            <h2 className="text-sm font-semibold text-ink-100">The product, honestly</h2>
            <p className="mt-2">
              CareerFound is an early-stage product. The career assessment, roadmap, and free-tier lessons and
              projects are functional today. Some things aren&apos;t finished yet: Pro isn&apos;t billable, and
              mentor session payment is a placeholder, sessions are free during this founding period. We&apos;ll
              tell you clearly, in the product, when something is a demo or not yet live rather than presenting it
              as finished.
            </p>
          </section>
          <section>
            <h2 className="text-sm font-semibold text-ink-100">Your account</h2>
            <p className="mt-2">
              You&apos;re responsible for keeping your login credentials secure and for the accuracy of the
              information you give us. You must be old enough to legally use online services in your country to
              create an account.
            </p>
          </section>
          <section>
            <h2 className="text-sm font-semibold text-ink-100">Content you provide</h2>
            <p className="mt-2">
              Project submissions, portfolio entries, and messages you write (like mentor booking notes) are yours.
              You&apos;re responsible for what you submit, don&apos;t upload anything you don&apos;t have the
              rights to.
            </p>
          </section>
          <section>
            <h2 className="text-sm font-semibold text-ink-100">Mentorship sessions</h2>
            <p className="mt-2">
              Booking a session reserves a request with a mentor, it doesn&apos;t guarantee the mentor accepts or
              attends. Demo mentor profiles are for testing the experience and aren&apos;t bookable with a real
              person, they&apos;re clearly labeled as demo in the product.
            </p>
          </section>
          <section>
            <h2 className="text-sm font-semibold text-ink-100">No guarantees</h2>
            <p className="mt-2">
              We don&apos;t guarantee specific outcomes like job placement, interviews, or a certain salary.
              CareerFound is a tool to help you learn and prepare, the result depends on you.
            </p>
          </section>
          <section>
            <h2 className="text-sm font-semibold text-ink-100">Changes</h2>
            <p className="mt-2">
              We&apos;re actively building this product and these terms may change as features do. We&apos;ll keep
              this page current rather than silently changing behavior it doesn&apos;t describe.
            </p>
          </section>
        </div>
      </div>
    </PublicShell>
  );
}
