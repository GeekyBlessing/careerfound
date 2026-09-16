import type { Metadata } from "next";
import Link from "next/link";
import { Mail, ArrowRight } from "lucide-react";
import { PublicShell } from "@/components/layout/public-shell";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Contact | CareerFound",
  description: "Get in touch with the CareerFound team.",
};

export default function ContactPage() {
  return (
    <PublicShell>
      <div className="mx-auto max-w-xl py-8 sm:py-12">
        <SectionHeading eyebrow="Contact" title="Get in touch" />

        <Card className="mt-10">
          <CardContent className="p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-accent/12 text-accent-light">
              <Mail className="h-5 w-5" />
            </div>
            <p className="mt-4 text-sm text-ink-500">
              We&apos;re a small, early-stage team. For questions, feedback, or an issue with your account, email
              us directly and we&apos;ll get back to you.
            </p>
            <a
              href="mailto:hello@mycareerfound.com"
              className="mt-4 inline-block text-base font-medium text-accent-light hover:underline"
            >
              hello@mycareerfound.com
            </a>
          </CardContent>
        </Card>

        <p className="mt-8 text-center text-sm text-ink-500">
          Looking for a quick answer instead?{" "}
          <Link href="/faq" className="font-medium text-accent-light hover:underline">
            Check the FAQ
          </Link>
        </p>
      </div>
    </PublicShell>
  );
}
