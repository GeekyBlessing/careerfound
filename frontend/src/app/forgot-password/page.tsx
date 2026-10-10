"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { GlobalNav } from "@/components/layout/global-nav";
import { api, ApiError } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  // Seconds until another request is allowed, so the button can't be hammered.
  const [wait, setWait] = useState(0);

  useEffect(() => {
    if (wait <= 0) return;
    const id = window.setTimeout(() => setWait((w) => w - 1), 1000);
    return () => window.clearTimeout(id);
  }, [wait]);

  async function request() {
    setError(null);
    setLoading(true);
    try {
      const res = await api.post<{ message: string }>("/auth/forgot-password", { email }, { auth: false });
      // The same state is shown whether or not this email has an account (the
      // API never reveals which). The wording only says a request was made.
      setNotice(res.message);
      setSubmitted(true);
      setWait(60);
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        setError("Too many requests for this address. Please wait a minute and try again.");
        setWait(60);
      } else {
        setError(err instanceof ApiError ? err.message : "We could not reach CareerFound. Check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    void request();
  }

  return (
    <>
      <GlobalNav />
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4 py-10">
      <div className="bg-contour pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px]" />
      <div className="w-full max-w-sm">
        <Card className="animate-fade-in-up p-8 shadow-raised">
          {submitted ? (
            <div className="text-center">
              <MailCheck className="mx-auto mb-4 h-10 w-10 text-accent-light" aria-hidden="true" />
              <h1 className="text-lg font-semibold tracking-tight text-ink-100">Check your email</h1>
              <p className="mt-2 text-sm text-ink-500" aria-live="polite">
                {notice ?? "If an account exists for that email, we have asked our email service to send a reset link."}
              </p>
              <ul className="mt-4 space-y-1.5 text-left text-xs text-ink-500">
                <li>Look in your inbox for an email from CareerFound.</li>
                <li>Not there after a few minutes? Check spam, junk and Promotions.</li>
                <li>The link works once and expires in 1 hour.</li>
                <li>Check that you typed <span className="text-ink-300">{email}</span> correctly.</li>
              </ul>
              {error && <Alert className="mt-4 text-left">{error}</Alert>}
              <Button variant="secondary" className="mt-5 w-full" onClick={() => void request()} loading={loading} disabled={wait > 0}>
                {wait > 0 ? `Send again in ${wait}s` : "Send the link again"}
              </Button>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setError(null);
                }}
                className="focus-ring mt-3 rounded-sm text-xs text-ink-500 hover:text-ink-100 hover:underline"
              >
                Use a different email
              </button>
              <Link href="/login" className="focus-ring mt-4 block rounded-sm text-sm font-medium text-accent-light hover:underline">
                Back to log in
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-lg font-semibold tracking-tight text-ink-100">Reset your password</h1>
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
    </>
  );
}
