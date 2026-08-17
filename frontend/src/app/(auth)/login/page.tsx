"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
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
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2 font-semibold text-ink-100">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent">
            <Compass className="h-4 w-4 text-white" />
          </span>
          CareerFound
        </Link>
        <Card className="p-8">
          <h1 className="text-lg font-semibold text-ink-100">Welcome back</h1>
          <p className="mt-1 text-sm text-ink-500">Log in to continue your roadmap.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && <Alert>{error}</Alert>}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" loading={loading}>
              Log in
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-500">
            New to CareerFound?{" "}
            <Link href="/onboarding" className="font-medium text-accent-light hover:underline">
              Find your tech path
            </Link>
          </p>
          <p className="mt-2 text-center text-xs text-ink-500">
            Demo account: demo@careerfound.dev / DemoPass123!
          </p>
        </Card>
      </div>
    </div>
  );
}
