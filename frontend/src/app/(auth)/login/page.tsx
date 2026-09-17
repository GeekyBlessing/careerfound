"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { BrandTile } from "@/components/brand/logo";
import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard");
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
          <h1 className="text-lg font-semibold tracking-tight text-ink-100">Welcome back</h1>
          <p className="mt-1 text-sm text-ink-500">Log in to continue your roadmap.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && <Alert>{error}</Alert>}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="mb-0">Password</Label>
                <Link href="/forgot-password" className="focus-ring mb-1.5 rounded-sm text-xs font-medium text-accent-light hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" loading={loading}>
              Log in
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-500">
            New to CareerFound?{" "}
            <Link href="/onboarding" className="focus-ring rounded-sm font-medium text-accent-light hover:underline">
              Find your tech path
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
