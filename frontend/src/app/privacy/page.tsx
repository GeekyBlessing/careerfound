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
          <section>
            <h2 className="text-sm font-semibold text-ink-100">How AI features use your data</h2>
            <p className="mt-2">
              The AI Mentor, career recommendation, and project-feedback features send relevant context (like your
              assessment answers, the project you&apos;re working on, or your chat message) to our AI provider to
              generate a response. That provider processes it to return the response, we don&apos;t use your
              conversations to train any AI model, and it isn&apos;t shared beyond what&apos;s needed to generate
              that one response.
            </p>
          </section>
          <section>
            <h2 className="text-sm font-semibold text-ink-100">How long we keep your data</h2>
            <p className="mt-2">
              We keep your account and progress data for as long as your account is active, so your history stays
              intact across sessions. If you ask us to delete your account (see &ldquo;Your choices&rdquo; above),
              we&apos;ll delete your personal data, keeping only what we&apos;re legally required to retain, if
              anything, or what&apos;s needed to resolve an open dispute or support request.
            </p>
          </section>
          <section>
            <h2 className="text-sm font-semibold text-ink-100">Cookies and similar technology</h2>
            <p className="mt-2">
              We use a small number of strictly-necessary cookies/local storage to keep you signed in and remember
              basic preferences (like your color theme). We don&apos;t use advertising or cross-site tracking
              cookies. If we add product analytics in the future, we&apos;ll update this section first.
            </p>
          </section>
          <section>
            <h2 className="text-sm font-semibold text-ink-100">Who else can see your data</h2>
            <p className="mt-2">
              Beyond our email delivery and AI providers (mentioned above), a mentor you book a session with sees
              the message you send them as part of that booking. We don&apos;t sell, rent, or otherwise share your
              personal data with advertisers or data brokers.
            </p>
          </section>
          <section>
            <h2 className="text-sm font-semibold text-ink-100">Children&apos;s privacy</h2>
            <p className="mt-2">
              CareerFound isn&apos;t directed at children, and we don&apos;t knowingly collect personal data from
              anyone under the age required to legally consent to online services in their country. If you believe
              a child has created an account, contact us and we&apos;ll remove it.
            </p>
          </section>
          <section>
            <h2 className="text-sm font-semibold text-ink-100">Your regional rights (GDPR/CCPA and similar)</h2>
            <p className="mt-2">
              Depending on where you live, you may have rights to access, correct, export, or delete your personal
              data, or to object to certain uses of it. You can exercise any of these by emailing{" "}
              <a href="mailto:hello@mycareerfound.com" className="text-accent-light hover:underline">
                hello@mycareerfound.com
              </a>
              . We haven&apos;t yet completed a formal regional compliance review (e.g. EU GDPR or California CCPA/
              CPRA), see the note at the top of this page.
            </p>
          </section>
          <section>
            <h2 className="text-sm font-semibold text-ink-100">If something goes wrong</h2>
            <p className="mt-2">
              If we become aware of a security incident that affects your personal data, we&apos;ll notify affected
              users and take reasonable steps to address it, consistent with what&apos;s legally required in your
              region.
            </p>
          </section>
        </div>
      </div>
    </PublicShell>
  );
}
