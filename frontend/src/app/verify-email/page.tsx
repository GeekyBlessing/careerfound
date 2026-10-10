"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { GlobalNav } from "@/components/layout/global-nav";
import { useAuth } from "@/lib/auth";
import { api, ApiError } from "@/lib/api";
import { useVerificationResend } from "@/lib/verification";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailInner />
    </Suspense>
  );
}

type Outcome =
  | { kind: "loading" }
  | { kind: "success" }
  | { kind: "already_verified" }
  | { kind: "expired" | "replaced" | "invalid"; message: string };

function VerifyEmailInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { refreshUser, user } = useAuth();
  const [outcome, setOutcome] = useState<Outcome>({ kind: "loading" });
  // One link, one request. React can run this effect twice in development, and the
  // second request would otherwise overwrite a success with an error.
  const requested = useRef<string | null>(null);

  useEffect(() => {
    if (token && requested.current === token) return;
    requested.current = token;
    if (!token) {
      setOutcome({
        kind: "invalid",
        message: "This verification link is missing its token. Try opening the link from your email again.",
      });
      return;
    }
    api
      .post("/auth/verify-email", { token }, { auth: false })
      .then(async () => {
        setOutcome({ kind: "success" });
        if (user) await refreshUser();
      })
      .catch(async (err) => {
        if (err instanceof ApiError && err.code === "already_verified") {
          setOutcome({ kind: "already_verified" });
          if (user) await refreshUser();
          return;
        }
        const code = err instanceof ApiError ? err.code : "";
        const message =
          err instanceof ApiError ? err.message : "We could not reach CareerFound. Check your connection and try again.";
        setOutcome({ kind: code === "link_expired" ? "expired" : code === "link_replaced" ? "replaced" : "invalid", message });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <>
      <GlobalNav />
      <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4 py-10">
        <div className="bg-contour pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px]" />
        <div className="w-full max-w-sm">
          <Card className="animate-fade-in-up p-8 text-center shadow-raised" role="status" aria-live="polite">
            {outcome.kind === "loading" && (
              <>
                <div
                  className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent"
                  aria-hidden="true"
                />
                <h1 className="text-lg font-semibold tracking-tight text-ink-100">Verifying your email</h1>
                <p className="mt-1 text-sm text-ink-500">This will just take a second.</p>
              </>
            )}
            {outcome.kind === "success" && (
              <>
                <CheckCircle2 className="mx-auto mb-4 h-10 w-10 text-accent-light" aria-hidden="true" />
                <h1 className="text-lg font-semibold tracking-tight text-ink-100">Email verified</h1>
                <p className="mt-1 text-sm text-ink-500">Your CareerFound account is confirmed. Thanks for checking.</p>
                <Link href={user ? "/dashboard" : "/login?next=%2Fdashboard"}>
                  <Button className="mt-6 w-full">{user ? "Go to dashboard" : "Sign in to continue"}</Button>
                </Link>
              </>
            )}
            {outcome.kind === "already_verified" && (
              <>
                <CheckCircle2 className="mx-auto mb-4 h-10 w-10 text-accent-light" aria-hidden="true" />
                <h1 className="text-lg font-semibold tracking-tight text-ink-100">Already verified</h1>
                <p className="mt-1 text-sm text-ink-500">
                  This email address is already confirmed, so there is nothing more to do.
                </p>
                <Link href={user ? "/dashboard" : "/login?next=%2Fdashboard"}>
                  <Button className="mt-6 w-full">{user ? "Go to dashboard" : "Sign in"}</Button>
                </Link>
              </>
            )}
            {(outcome.kind === "expired" || outcome.kind === "replaced" || outcome.kind === "invalid") && (
              <LinkProblem kind={outcome.kind} message={outcome.message} signedIn={!!user} />
            )}
          </Card>
        </div>
      </div>
    </>
  );
}

function LinkProblem({
  kind,
  message,
  signedIn,
}: {
  kind: "expired" | "replaced" | "invalid";
  message: string;
  signedIn: boolean;
}) {
  const { sending, notice, remaining, resend } = useVerificationResend();
  const Icon = kind === "expired" ? Clock : XCircle;
  const title =
    kind === "expired" ? "This link has expired" : kind === "replaced" ? "This link was replaced" : "This link did not work";
  const sent = notice?.tone === "success";

  return (
    <>
      <Icon className={`mx-auto mb-4 h-10 w-10 ${kind === "invalid" ? "text-danger" : "text-warning"}`} aria-hidden="true" />
      <h1 className="text-lg font-semibold tracking-tight text-ink-100">{title}</h1>
      <p className="mt-1 text-sm text-ink-500">{message}</p>

      {notice && (
        <Alert variant={notice.tone === "error" ? "error" : "info"} className="mt-5 text-left">
          {notice.text}
        </Alert>
      )}

      {signedIn ? (
        <div className="mt-6 space-y-3">
          {!sent && (
            <Button className="w-full" onClick={resend} loading={sending} disabled={remaining > 0}>
              {remaining > 0 ? `Send a new link in ${remaining}s` : "Send me a new link"}
            </Button>
          )}
          <Link href="/verify-pending">
            <Button variant="secondary" className="w-full">
              Open verification page
            </Button>
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          <p className="text-xs text-ink-500">Sign in to your account and we can send a fresh link.</p>
          <Link href="/login?next=%2Fverify-pending">
            <Button className="w-full">Sign in to get a new link</Button>
          </Link>
        </div>
      )}
    </>
  );
}
