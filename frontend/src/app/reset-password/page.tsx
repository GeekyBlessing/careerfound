"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { BrandTile } from "@/components/brand/logo";
import { api, ApiError } from "@/lib/api";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordInner />
    </Suspense>
  );
}

function ResetPasswordInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!token) {
      setError("This reset link is missing its token. Try opening the link from your email again.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, new_password: password }, { auth: false });
      setDone(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div className="bg-contour pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px]" />
      <div className="w-full max-w-sm">
        <Link href="/" className="focus-ring mb-8 flex items-center justify-center gap-2 rounded-lg font-display font-semibold text-ink-100">
          <BrandTile className="h-7 w-7" />
          CareerFound
        </Link>
        <Card className="animate-fade-in-up p-8 shadow-raised">
          {done ? (
            <div className="text-center" role="status" aria-live="polite">
              <CheckCircle2 className="mx-auto mb-4 h-10 w-10 text-accent-light" aria-hidden="true" />
              <h1 className="text-lg font-semibold tracking-tight text-ink-100">Password reset</h1>
              <p className="mt-2 text-sm text-ink-500">Taking you to log in...</p>
            </div>
          ) : (
            <>
              <h1 className="text-lg font-semibold tracking-tight text-ink-100">Choose a new password</h1>
              <p className="mt-1 text-sm text-ink-500">This link can only be used once.</p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                {error && <Alert>{error}</Alert>}
                <div>
                  <Label htmlFor="password">New password</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <p className="mt-1 text-xs text-ink-500">At least 8 characters.</p>
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm new password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" loading={loading}>
                  Reset password
                </Button>
              </form>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
