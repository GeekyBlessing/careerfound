import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}

export function formatCents(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}

/**
 * Short price label for a mentor card/list item. A founding mentor's
 * hourly_rate_cents is 0 because their real offerings are the fixed-price
 * mentorship/consultation packages, not an hourly rate, so 0 must never
 * render as "Free" or "$0/hr" for them. Falls back to the demo-marketplace
 * hourly rate (or "Free" when that is genuinely unset) for everyone else.
 */
export function mentorPriceLabel(mentor: {
  hourly_rate_cents: number;
  currency: string;
  is_founding_mentor: boolean;
  consultation_price_label: string;
  mentorship_price_label: string;
}): string {
  if (mentor.is_founding_mentor) {
    if (mentor.consultation_price_label) return `From ${mentor.consultation_price_label}`;
    if (mentor.mentorship_price_label) return mentor.mentorship_price_label;
    return "See pricing";
  }
  return mentor.hourly_rate_cents > 0 ? `${formatCents(mentor.hourly_rate_cents, mentor.currency)}/hr` : "Free";
}
