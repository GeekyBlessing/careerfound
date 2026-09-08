"use client";

import { useState } from "react";
import Link from "next/link";
import { Compass, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { api, ApiError } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email }, { auth: false });
      // Always show the same success state, whether or not this email has
      // an account, the backend intentionally never reveals which.
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2 font-semibold text-ink-100">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent">
            <Compass className="h-4 w-4 text-white" />
          </span>
          CareerFound
        </Link>
        <Card className="p-8">
          {submitted ? (
            <div className="text-center">
              <MailCheck className="mx-auto mb-4 h-10 w-10 text-accent-light" aria-hidden="true" />
              <h1 className="text-lg font-semibold text-ink-100">Check your email</h1>
              <p className="mt-2 text-sm text-ink-500">
                If an account exists for <span className="text-ink-300">{email}</span>, a password reset link is on
                its way. It expires in 1 hour.
              </p>
              <Link href="/login" className="focus-ring mt-6 block rounded-sm text-sm font-medium text-accent-light hover:underline">
                Back to log in
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-lg font-semibold text-ink-100">Reset your password</h1>
              <p className="mt-1 text-sm text-ink-500">Enter your email and we&apos;ll send you a reset link.</p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                {error && <Alert>{error}</Alert>}
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" loading={loading}>
                  Send reset link
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-ink-500">
                Remembered it?{" "}
                <Link href="/login" className="focus-ring rounded-sm font-medium text-accent-light hover:underline">
                  Log in
                </Link>
              </p>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
