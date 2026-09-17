import type { Metadata } from "next";
import Link from "next/link";
import { Mail, ArrowRight } from "lucide-react";
import { PublicShell } from "@/components/layout/public-shell";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconTile } from "@/components/ui/icon-tile";

export const metadata: Metadata = {
  title: "Contact | CareerFound",
  description: "Get in touch with the CareerFound team.",
};

export default function ContactPage() {
  return (
    <PublicShell>
      <div className="mx-auto max-w-xl py-8 sm:py-12">
        <SectionHeading as="h1" eyebrow="Contact" title="Get in touch" />

        <Card className="mt-10">
          <CardContent className="p-8 text-center">
            <IconTile icon={Mail} size="lg" className="mx-auto" />
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
