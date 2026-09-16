/**
 * Minimal, privacy-conscious analytics stub.
 *
 * No analytics provider is connected yet, this file exists so product
 * events are called from one place with a stable, documented event list,
 * instead of the app needing to be re-instrumented later. Today, `track()`
 * only logs to the browser console in development, it sends nothing over
 * the network and stores nothing.
 *
 * To go live with a real provider (e.g. PostHog, Plausible, Amplitude):
 * 1. Add that provider's script/SDK (this is the "external account setup"
 *    step someone has to do outside this codebase).
 * 2. Replace the body of `track()` below to also forward to that SDK.
 * No call site anywhere in the app needs to change.
 *
 * Only pass property values that are safe to send to a third party once a
 * real provider is connected, never emails, names, free-text message
 * content, or anything else personally identifying.
 */

export type AnalyticsEvent =
  | "signup_completed"
  | "assessment_completed"
  | "roadmap_started"
  | "project_completed"
  | "portfolio_item_generated"
  | "ai_mentor_message_sent"
  | "service_request_submitted";

export function track(event: AnalyticsEvent, properties: Record<string, string | number | boolean> = {}): void {
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.debug("[analytics]", event, properties);
  }
  // Intentionally a no-op beyond the console log above until a real
  // provider is wired in, see the module docstring.
}
