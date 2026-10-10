"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";

/** j*****@gmail.com. Same rule as the API, so what the page shows matches what the API reports. */
export function maskEmail(address: string): string {
  const at = address.indexOf("@");
  if (at < 1) return "***";
  const local = address.slice(0, at);
  const stars = Math.min(Math.max(local.length - 1, 2), 6);
  return `${local[0]}${"*".repeat(stars)}${address.slice(at)}`;
}

export interface VerificationSent {
  message: string;
  masked_email: string;
  accepted: boolean;
  resend_available_in: number;
}

export interface VerificationStatus {
  email_verified: boolean;
  masked_email: string;
  resend_available_in: number;
  email_configured: boolean;
}

export interface ResendNotice {
  tone: "success" | "error" | "info";
  text: string;
  /** True when retrying will not help until the service is fixed on our side. */
  setupProblem?: boolean;
}

/**
 * Turns a failed resend into something true to show. The API already words
 * the message; this only adds what the client must act on (the countdown)
 * and keeps a network failure from looking like an email failure.
 */
export function describeResendError(err: unknown): { notice: ResendNotice; cooldown: number } {
  if (err instanceof ApiError) {
    if (err.code === "resend_cooldown") {
      const wait = Number(err.details.retry_after) || 60;
      return {
        notice: { tone: "info", text: `A link was just requested. You can ask for another in ${wait} seconds.` },
        cooldown: wait,
      };
    }
    if (err.code === "already_verified") {
      return { notice: { tone: "success", text: "This email address is already verified." }, cooldown: 0 };
    }
    if (err.status === 429) {
      return { notice: { tone: "info", text: "Too many attempts. Please wait a minute and try again." }, cooldown: 60 };
    }
    return {
      notice: { tone: "error", text: err.message, setupProblem: err.details.setup_problem === true },
      cooldown: 0,
    };
  }
  return {
    notice: { tone: "error", text: "We could not reach CareerFound. Check your connection and try again." },
    cooldown: 0,
  };
}

/** Resend state shared by the banner target page, settings and the expired-link page. */
export function useVerificationResend(initialCooldown = 0) {
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<ResendNotice | null>(null);
  const [cooldownEnd, setCooldownEnd] = useState<number | null>(
    initialCooldown > 0 ? Date.now() + initialCooldown * 1000 : null
  );
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!cooldownEnd) return;
    const id = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(id);
  }, [cooldownEnd]);

  const remaining = cooldownEnd ? Math.max(0, Math.ceil((cooldownEnd - now) / 1000)) : 0;

  const startCooldown = useCallback((seconds: number) => {
    setNow(Date.now());
    setCooldownEnd(seconds > 0 ? Date.now() + seconds * 1000 : null);
  }, []);

  const resend = useCallback(async (): Promise<boolean> => {
    setSending(true);
    setNotice(null);
    try {
      const res = await api.post<VerificationSent>("/auth/resend-verification");
      setNotice({ tone: "success", text: res.message });
      startCooldown(res.resend_available_in || 60);
      return true;
    } catch (err) {
      const { notice: n, cooldown } = describeResendError(err);
      setNotice(n);
      startCooldown(cooldown);
      return false;
    } finally {
      setSending(false);
    }
  }, [startCooldown]);

  return { sending, notice, setNotice, remaining, startCooldown, resend };
}
