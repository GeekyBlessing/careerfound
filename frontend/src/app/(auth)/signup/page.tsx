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

export default function SignupPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      await register(email, password, fullName);
      router.push("/onboarding");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div className="bg-dot-grid pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px]" />
      <div className="w-full max-w-sm">
        <Link href="/" className="focus-ring mb-8 flex items-center justify-center gap-2 rounded-lg font-semibold text-ink-100">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent shadow-xs">
            <Compass className="h-4 w-4 text-white" />
          </span>
          CareerFound
        </Link>
        <Card className="animate-fade-in-up p-8 shadow-raised">
          <h1 className="text-lg font-semibold tracking-tight text-ink-100">Create your account</h1>
          <p className="mt-1 text-sm text-ink-500">Takes less than a minute.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && <Alert>{error}</Alert>}
            <div>
              <Label htmlFor="name">Full name</Label>
              <Input id="name" autoComplete="name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" autoComplete="new-password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
              <p className="mt-1 text-xs text-ink-500">At least 8 characters.</p>
            </div>
            <Button type="submit" className="w-full" loading={loading}>
              Create account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-500">
            Already have an account?{" "}
            <Link href="/login" className="focus-ring rounded-sm font-medium text-accent-light hover:underline">
              Log in
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
