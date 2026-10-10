"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { GlobalNav } from "@/components/layout/global-nav";
import { useAuth } from "@/lib/auth";
import { api, ApiError } from "@/lib/api";
import {
  maskEmail,
  useVerificationResend,
  type VerificationSent,
  type VerificationStatus,
} from "@/lib/verification";

/**
 * The one place a person finishes verifying. It never claims an email was
 * delivered: the API only knows whether the email service accepted the
 * request, so the copy says "asked our email service" and tells people where
 * to look if it does not show up. Access to the rest of the app is unchanged:
 * unverified accounts can keep using CareerFound, this page is the clear way
 * to complete verification.
 */
export default function VerifyPendingPage() {
  const { user, loading, refreshUser, logout } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const { sending, notice, setNotice, remaining, startCooldown, resend } = useVerificationResend();
  const [checking, setChecking] = useState(false);
  const [changing, setChanging] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login?next=%2Fverify-pending");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user || user.email_verified) return;
    api
      .get<VerificationStatus>("/auth/verification-status")
      .then((s) => {
        setStatus(s);
        startCooldown(s.resend_available_in);
      })
      .catch(() => undefined);
  }, [user, startCooldown]);

  const checkNow = useCallback(async () => {
    setChecking(true);
    setNotice(null);
    try {
      const s = await api.get<VerificationStatus>("/auth/verification-status");
      if (s.email_verified) {
        await refreshUser();
      } else {
        setNotice({ tone: "info", text: "Not verified yet. Open the link in the email from CareerFound, then check again." });
      }
    } catch {
      setNotice({ tone: "error", text: "We could not check right now. Please try again in a moment." });
    } finally {
      setChecking(false);
    }
  }, [refreshUser, setNotice]);

  if (loading || !user) {
    return (
      <>
        <GlobalNav />
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      </>
    );
  }

  const masked = status?.masked_email ?? maskEmail(user.email);

  if (user.email_verified) {
    return (
      <Shell>
        <Card className="animate-fade-in-up p-8 text-center shadow-raised" role="status">
          <CheckCircle2 className="mx-auto mb-4 h-10 w-10 text-accent-light" aria-hidden="true" />
          <h1 className="text-lg font-semibold tracking-tight text-ink-100">Your email is verified</h1>
          <p className="mt-1 text-sm text-ink-500">{masked} is confirmed. There is nothing more to do here.</p>
          <Link href="/dashboard">
            <Button className="mt-6 w-full">Go to dashboard</Button>
          </Link>
        </Card>
      </Shell>
    );
  }

  const resendLabel = remaining > 0 ? `Resend email in ${remaining}s` : "Resend email";

  return (
    <Shell>
      <Card className="animate-fade-in-up p-6 shadow-raised sm:p-8">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/15 text-accent-light">
          <Mail className="h-5 w-5" aria-hidden="true" />
        </div>
        <h1 className="mt-4 text-lg font-semibold tracking-tight text-ink-100">Verify your email</h1>
        <p className="mt-1 text-sm text-ink-500">
          Open the link in the email from CareerFound to confirm <span className="font-medium text-ink-100">{masked}</span>.
        </p>

        <ul className="mt-5 space-y-2 text-sm text-ink-400">
          <li>Check your inbox for an email from CareerFound.</li>
          <li>Not there after a minute? Look in spam, junk and Promotions.</li>
          <li>The link works for 48 hours. Asking for a new one replaces the old link.</li>
        </ul>

        {status && !status.email_configured && (
          <Alert variant="info" className="mt-5">
            Email sending is not switched on for CareerFound yet, so verification emails cannot go out right now. Your
            account is saved and you can keep using CareerFound. You can try again at any time.
          </Alert>
        )}

        <div aria-live="polite" className="mt-5 min-h-[1px]">
          {notice && (
            <Alert variant={notice.tone === "error" ? "error" : "info"}>
              {notice.text}
            </Alert>
          )}
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Button
            className="flex-1"
            onClick={resend}
            loading={sending}
            disabled={remaining > 0}
            aria-label={remaining > 0 ? `Resend email, available in ${remaining} seconds` : "Resend email"}
          >
            {sending ? "Sending" : resendLabel}
          </Button>
          <Button variant="secondary" className="flex-1" onClick={checkNow} loading={checking}>
            I have verified
          </Button>
        </div>

        <div className="mt-6 border-t border-[rgb(var(--fg-tint)/0.08)] pt-5">
          {changing ? (
            <ChangeEmailForm
              onCancel={() => setChanging(false)}
              onDone={async (res) => {
                setChanging(false);
                setNotice({ tone: res.accepted ? "success" : "error", text: res.message });
                startCooldown(res.resend_available_in);
                await refreshUser();
                setStatus((s) => (s ? { ...s, masked_email: res.masked_email } : s));
              }}
            />
          ) : (
            <p className="text-sm text-ink-500">
              Wrong address?{" "}
              <button
                type="button"
                onClick={() => setChanging(true)}
                className="focus-ring rounded-sm font-medium text-accent-light hover:underline"
              >
                Change email
              </button>
            </p>
          )}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm">
          <Link href="/dashboard" className="focus-ring rounded-sm font-medium text-accent-light hover:underline">
            Continue to CareerFound
          </Link>
          <button
            type="button"
            onClick={() => {
              logout();
              router.push("/login");
            }}
            className="focus-ring rounded-sm text-ink-500 hover:text-ink-100 hover:underline"
          >
            Back to sign in
          </button>
        </div>
      </Card>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <GlobalNav />
      <div className="relative flex min-h-[calc(100vh-4rem)] items-start justify-center overflow-hidden px-4 py-10 sm:items-center">
        <div className="bg-contour pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px]" />
        <div className="w-full max-w-md">{children}</div>
      </div>
    </>
  );
}

function ChangeEmailForm({
  onCancel,
  onDone,
}: {
  onCancel: () => void;
  onDone: (res: VerificationSent) => void | Promise<void>;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await api.post<VerificationSent>("/auth/change-email", { new_email: email, password });
      await onDone(res);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <p className="text-sm font-medium text-ink-100">Change your email address</p>
      <p className="text-xs text-ink-500">
        We ask for your password so nobody else can redirect your account&apos;s email. Links sent to the old address
        stop working.
      </p>
      {error && <Alert>{error}</Alert>}
      <div>
        <Label htmlFor="new-email">New email</Label>
        <Input id="new-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="current-password">Current password</Label>
        <Input
          id="current-password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div className="flex gap-3">
        <Button type="submit" loading={saving} className="flex-1">
          Save and send link
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
