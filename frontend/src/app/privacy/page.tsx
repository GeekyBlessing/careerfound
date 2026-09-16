import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/public-shell";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Alert } from "@/components/ui/alert";

export const metadata: Metadata = {
  title: "Privacy | CareerFound",
  description: "How CareerFound collects, uses, and stores your data.",
};

export default function PrivacyPage() {
  return (
    <PublicShell>
      <div className="mx-auto max-w-2xl py-8 sm:py-12">
        <SectionHeading as="h1" eyebrow="Privacy" title="Privacy policy" />

        <Alert variant="info" className="mt-8">
          This page is a plain-language description of what CareerFound actually collects and does today, written
          by the team, not a lawyer. It isn&apos;t a substitute for a formal legal review, and it will be replaced
          with a properly drafted policy as the product grows.
        </Alert>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-ink-300">
          <section>
            <h2 className="text-sm font-semibold text-ink-100">What we collect</h2>
            <p className="mt-2">
              When you create an account: your name, email, and a password (stored as a one-way hash, we never
              store or see your plain-text password). As you use the product: your career assessment answers,
              roadmap and project progress, and any messages you send when booking a mentor session. If you
              contact us, whatever you send us.
            </p>
          </section>
          <section>
            <h2 className="text-sm font-semibold text-ink-100">What we don&apos;t collect</h2>
            <p className="mt-2">
              We don&apos;t currently run third-party analytics or advertising trackers on the site. We
              don&apos;t collect payment details, because there&apos;s no live payment processor connected yet.
            </p>
          </section>
          <section>
            <h2 className="text-sm font-semibold text-ink-100">How we use it</h2>
            <p className="mt-2">
              To run your account (login, your roadmap, your progress), to send account emails (welcome, email
              verification, password reset, and booking confirmations), and, only if you&apos;ve opted in under
              Settings, occasional product update emails. We don&apos;t sell your data.
            </p>
          </section>
          <section>
            <h2 className="text-sm font-semibold text-ink-100">Where it&apos;s stored</h2>
            <p className="mt-2">
              In a database on our hosting provider, with the application itself hosted on standard cloud
              infrastructure. We don&apos;t share your data with third parties beyond the services that make the
              product work (like our email delivery provider).
            </p>
          </section>
          <section>
            <h2 className="text-sm font-semibold text-ink-100">Your choices</h2>
            <p className="mt-2">
              You can turn optional product emails on or off any time in Settings. There&apos;s no self-serve
              account deletion in the app yet, if you want your account and data removed, email us at{" "}
              <a href="mailto:hello@mycareerfound.com" className="text-accent-light hover:underline">
                hello@mycareerfound.com
              </a>{" "}
              and we&apos;ll handle it directly.
            </p>
          </section>
        </div>
      </div>
    </PublicShell>
  );
}
