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

/**
 * Short, human relative time ("2 hours ago", "Yesterday", "3 days ago")
 * for real timestamps (XP events, activity feed) — never a guess, always
 * derived from an actual ISO timestamp the backend recorded.
 */
export function formatRelativeTime(isoDate: string): string {
  const then = new Date(isoDate).getTime();
  if (Number.isNaN(then)) return "";
  const diffMs = Date.now() - then;
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  const weeks = Math.round(days / 7);
  if (weeks < 5) return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  const months = Math.round(days / 30);
  return `${months} month${months === 1 ? "" : "s"} ago`;
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
  // Any real mentor with a published program or consultation price shows it,
  // founding or not; "Free" is only for a mentor with no price of any kind.
  if (mentor.consultation_price_label) return `From ${mentor.consultation_price_label}`;
  if (mentor.mentorship_price_label) return mentor.mentorship_price_label;
  if (mentor.is_founding_mentor) return "See pricing";
  return mentor.hourly_rate_cents > 0 ? `${formatCents(mentor.hourly_rate_cents, mentor.currency)}/hr` : "Free";
}
