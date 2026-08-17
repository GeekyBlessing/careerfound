"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Input, Textarea } from "@/components/ui/input";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";

const PATH_OPTIONS = [
  "cybersecurity",
  "software-engineering",
  "frontend-development",
  "backend-engineering",
  "full-stack-development",
  "cloud-engineering",
  "cloud-security",
  "soc-analysis",
  "penetration-testing",
  "devops",
  "data-analysis",
  "data-engineering",
  "ai-ml-engineering",
  "product-design",
  "ui-ux-design",
  "product-management",
  "technical-writing",
  "qa-engineering",
  "no-code-automation",
  "it-support",
  "solutions-architecture",
];

export default function ApplyToMentorPage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.full_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [years, setYears] = useState("");
  const [paths, setPaths] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function togglePath(slug: string) {
    setPaths((prev) => (prev.includes(slug) ? prev.filter((p) => p !== slug) : [...prev, slug]));
  }

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      await api.post("/mentor-applications", {
        applicant_name: name,
        applicant_email: email,
        headline,
        bio,
        paths,
        years_experience: years ? Number(years) : null,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't submit your application.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell>
      <div className="mb-6 max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-accent-light">Mentorship</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink-100">Apply to become a mentor</h1>
        <p className="mt-1 text-sm text-ink-500">
          Tell us about yourself. Applications are reviewed manually — there&apos;s no automated identity or
          expertise verification, so approved profiles start unverified until reviewed further.
        </p>
      </div>

      {submitted ? (
        <Card className="max-w-2xl p-6">
          <div className="flex items-center gap-3 text-success">
            <CheckCircle2 className="h-5 w-5" />
            <p className="text-sm font-medium">Application submitted</p>
          </div>
          <p className="mt-2 text-sm text-ink-400">
            Thanks — we&apos;ll review it and follow up at {email}. If approved, sign in with this email and claim
            your mentor profile from the mentor dashboard.
          </p>
        </Card>
      ) : (
        <Card className="max-w-2xl">
          <CardContent className="space-y-4 p-6">
            {error && <Alert>{error}</Alert>}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name">
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </Field>
              <Field label="Email">
                <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
              </Field>
            </div>
            <Field label="Headline">
              <Input
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Backend Engineer | Mentor"
              />
            </Field>
            <Field label="Bio">
              <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} />
            </Field>
            <Field label="Years of experience (optional)">
              <Input value={years} onChange={(e) => setYears(e.target.value)} type="number" min={0} className="max-w-[160px]" />
            </Field>
            <Field label="Which career paths would you mentor?">
              <div className="flex flex-wrap gap-2">
                {PATH_OPTIONS.map((slug) => (
                  <button
                    key={slug}
                    type="button"
                    onClick={() => togglePath(slug)}
                    className={`rounded-full border px-3 py-1 text-xs capitalize transition-colors ${
                      paths.includes(slug)
                        ? "border-accent/40 bg-accent/15 text-accent-light"
                        : "border-white/10 bg-white/[0.03] text-ink-400 hover:bg-white/[0.06]"
                    }`}
                  >
                    {slug.replace(/-/g, " ")}
                  </button>
                ))}
              </div>
            </Field>
            <Button
              onClick={submit}
              loading={submitting}
              disabled={!name || !email || !headline || paths.length === 0}
              className="w-full"
            >
              Submit application
            </Button>
          </CardContent>
        </Card>
      )}
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-ink-300">{label}</span>
      {children}
    </label>
  );
}
