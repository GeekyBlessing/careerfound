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
            <h2 className="text-sm font-semibold text-ink-100">Mentor marketplace sessions</h2>
            <p className="mt-2">
              Booking a session in the mentor marketplace (the &ldquo;Real professionals&rdquo; directory) reserves
              a request with a mentor, it doesn&apos;t guarantee the mentor accepts or attends. Demo mentor
              profiles are for testing the experience and aren&apos;t bookable with a real person, they&apos;re
              clearly labeled as demo in the product. This is separate from the paid 1:1 Career Mentorship program
              and the Career Consultation service described on their own pages, which are real, priced offerings.
            </p>
          </section>
          <section>
            <h2 className="text-sm font-semibold text-ink-100">AI features</h2>
            <p className="mt-2">
              The AI Mentor, career recommendation, and project-feedback features are software, not a licensed
              career counselor or a human mentor, and they can be wrong or give incomplete advice. Don&apos;t treat
              anything they say as professional, legal, medical, or financial advice. You keep ownership of the
              text you submit to these features (like a project write-up or a chat message); we use it only to
              generate a response for you, as described in the Privacy Policy.
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
            <h2 className="text-sm font-semibold text-ink-100">Disclaimer and limitation of liability</h2>
            <p className="mt-2">
              CareerFound is provided &ldquo;as is,&rdquo; without warranties of any kind, express or implied,
              including that it will be uninterrupted, error-free, or fit for a particular purpose. To the
              fullest extent the law allows, CareerFound and its team aren&apos;t liable for indirect, incidental,
              or consequential damages arising from your use of the product. Nothing here limits liability where
              the law doesn&apos;t allow it to be limited.
            </p>
          </section>
          <section>
            <h2 className="text-sm font-semibold text-ink-100">Suspending or ending your account</h2>
            <p className="mt-2">
              You can stop using CareerFound at any time; email us if you&apos;d like your account removed (see
              the Privacy Policy). We may suspend or terminate an account that violates these terms, for example
              by abusing the platform, attempting to access another user&apos;s data, or misusing the AI features
              to generate harmful content.
            </p>
          </section>
          <section>
            <h2 className="text-sm font-semibold text-ink-100">Disagreements</h2>
            <p className="mt-2">
              If something goes wrong, email us first at{" "}
              <a href="mailto:hello@mycareerfound.com" className="text-accent-light hover:underline">
                hello@mycareerfound.com
              </a>{" "}
              so we can try to sort it out directly. This section is intentionally light because we haven&apos;t
              yet had a lawyer set the formal governing law, jurisdiction, and dispute-resolution process, see the
              note at the top of this page.
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
