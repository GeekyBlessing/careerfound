"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BrandTile } from "@/components/brand/logo";
import { useAuth } from "@/lib/auth";
import { api, ApiError } from "@/lib/api";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailInner />
    </Suspense>
  );
}

function VerifyEmailInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { refreshUser, user } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setError("This verification link is missing its token. Try opening the link from your email again.");
      return;
    }
    api
      .post("/auth/verify-email", { token }, { auth: false })
      .then(async () => {
        setStatus("success");
        if (user) await refreshUser();
      })
      .catch((err) => {
        setStatus("error");
        setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div className="bg-contour pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px]" />
      <div className="w-full max-w-sm">
        <Link href="/" className="focus-ring mb-8 flex items-center justify-center gap-2 rounded-lg font-display font-semibold text-ink-100">
          <BrandTile className="h-7 w-7" />
          CareerFound
        </Link>
        <Card className="animate-fade-in-up p-8 text-center shadow-raised" role="status" aria-live="polite">
          {status === "loading" && (
            <>
              <div
                className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent"
                aria-hidden="true"
              />
              <h1 className="text-lg font-semibold tracking-tight text-ink-100">Verifying your email</h1>
              <p className="mt-1 text-sm text-ink-500">This will just take a second.</p>
            </>
          )}
          {status === "success" && (
            <>
              <CheckCircle2 className="mx-auto mb-4 h-10 w-10 text-accent-light" aria-hidden="true" />
              <h1 className="text-lg font-semibold tracking-tight text-ink-100">Email verified</h1>
              <p className="mt-1 text-sm text-ink-500">Your CareerFound account is confirmed.</p>
              <Link href={user ? "/dashboard" : "/login"}>
                <Button className="mt-6 w-full">{user ? "Go to dashboard" : "Log in"}</Button>
              </Link>
            </>
          )}
          {status === "error" && (
            <>
              <XCircle className="mx-auto mb-4 h-10 w-10 text-danger" aria-hidden="true" />
              <h1 className="text-lg font-semibold tracking-tight text-ink-100">Couldn&apos;t verify your email</h1>
              <p className="mt-1 text-sm text-ink-500">{error}</p>
              <Link href="/settings">
                <Button variant="secondary" className="mt-6 w-full">
                  Go to settings
                </Button>
              </Link>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
