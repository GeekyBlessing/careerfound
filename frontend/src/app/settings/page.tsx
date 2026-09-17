"use client";

import { useState } from "react";
import { Palette, User as UserIcon, Mail, Shield, CheckCircle2, AlertCircle } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ThemeToggleSegmented } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { IconTile } from "@/components/ui/icon-tile";
import { useAuth } from "@/lib/auth";
import { initials } from "@/lib/utils";
import { api, ApiError } from "@/lib/api";

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [prefsSaving, setPrefsSaving] = useState(false);

  async function handleResendVerification() {
    setResending(true);
    setResendMessage(null);
    try {
      const res = await api.post<{ message: string }>("/auth/resend-verification");
      setResendMessage(res.message);
    } catch (err) {
      setResendMessage(err instanceof ApiError ? err.message : "Couldn't resend the verification email.");
    } finally {
      setResending(false);
    }
  }

  async function handleMarketingToggle(next: boolean) {
    setPrefsSaving(true);
    try {
      await api.patch("/users/me/email-preferences", { marketing_opt_in: next });
      await refreshUser();
    } finally {
      setPrefsSaving(false);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="font-display text-h1 font-semibold tracking-tight text-ink-100">Settings</h1>
          <p className="mt-1 text-sm text-ink-500">Manage your profile and how CareerFound looks for you.</p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <IconTile icon={UserIcon} size="sm" />
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/20 text-lg font-semibold text-accent-light shadow-xs">
              {user ? initials(user.full_name) : "?"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink-100">{user?.full_name ?? "Loading..."}</p>
              <p className="flex items-center gap-1.5 truncate text-xs text-ink-500">
                <Mail className="h-3 w-3" />
                {user?.email}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <IconTile icon={Mail} size="sm" />
            <CardTitle>Email</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-ink-100">Verification status</p>
                <p className="mt-0.5 text-xs text-ink-500">
                  {user?.email_verified ? "Your email address is confirmed." : "Confirm your email to secure your account."}
                </p>
              </div>
              {user?.email_verified ? (
                <Badge tone="success" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Verified
                </Badge>
              ) : (
                <Badge tone="warning" className="gap-1">
                  <AlertCircle className="h-3 w-3" /> Not verified
                </Badge>
              )}
            </div>
            {!user?.email_verified && (
              <div>
                <Button variant="secondary" size="sm" onClick={handleResendVerification} loading={resending}>
                  Resend verification email
                </Button>
                {resendMessage && <p className="mt-2 text-xs text-ink-500">{resendMessage}</p>}
              </div>
            )}

            <div className="flex items-center justify-between gap-4 border-t border-[rgb(var(--fg-tint)/0.06)] pt-5">
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink-100">Product updates</p>
                <p className="mt-0.5 text-xs text-ink-500">
                  Career recommendations, roadmap nudges, and project reminders. Off by default, you choose to get these.
                </p>
              </div>
              <Switch
                checked={!!user?.marketing_opt_in}
                onChange={handleMarketingToggle}
                disabled={prefsSaving}
                label="Product update emails"
              />
            </div>
            <p className="text-xs text-ink-500">
              Account emails (verification, password reset, booking and payment confirmations) always send and aren&apos;t
              affected by this setting.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <IconTile icon={Palette} size="sm" />
            <CardTitle>Appearance</CardTitle>
            <CardDescription className="mt-0 ml-auto">Light or dark mode</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-ink-400">
              Choose how CareerFound looks on this device. Your choice is saved and applies every time you sign in here.
            </p>
            <ThemeToggleSegmented />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <IconTile icon={Shield} size="sm" />
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-ink-400">
              Plan: <span className="font-medium text-ink-100">{user?.plan === "pro" ? "Pro" : "Free"}</span>
            </p>
            <p className="mt-1 text-sm text-ink-400">
              Role: <span className="font-medium text-ink-100 capitalize">{user?.role ?? "member"}</span>
            </p>
            {user?.plan !== "pro" && (
              <p className="mt-4 rounded-lg bg-[rgb(var(--fg-tint)/0.04)] px-3 py-2.5 text-xs leading-relaxed text-ink-500">
                Pro (deeper AI features on top of the free tools above) is still being built. Planned at $10/month,
                it isn&apos;t billable yet, so nothing will be charged.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
