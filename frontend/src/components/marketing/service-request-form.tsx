"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { api, ApiError } from "@/lib/api";

type Service = "mentorship" | "consultation";

/**
 * Lead-capture form for CareerFound's two paid personal offerings. Not a
 * checkout: no card fields, no fake "processing payment" state. Submitting
 * stores the request and triggers a real confirmation email (see
 * backend/app/api/v1/service_requests.py), the team follows up by email to
 * arrange payment and scheduling.
 */
export function ServiceRequestForm({ service, serviceLabel }: { service: Service; serviceLabel: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.post("/service-requests", { name, email, service, message }, { auth: false });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't send that, please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <Card className="animate-fade-in-up p-8 text-center shadow-raised">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-success/15 text-success">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-ink-100">Request received</h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-500">
          We&apos;ve emailed you a confirmation. This isn&apos;t a payment, nothing has been charged. We&apos;ll
          reply personally by email to arrange payment and scheduling for your {serviceLabel.toLowerCase()}.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6 shadow-raised sm:p-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="service-request-name">Name</Label>
          <Input
            id="service-request-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
            placeholder="Your full name"
          />
        </div>
        <div>
          <Label htmlFor="service-request-email">Email</Label>
          <Input
            id="service-request-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <Label htmlFor="service-request-message">
            {service === "mentorship" ? "What do you want out of mentorship?" : "What would you like to talk through?"}
          </Label>
          <Textarea
            id="service-request-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder={
              service === "mentorship"
                ? "e.g. I'm switching from a non-tech background and need a real plan, not just a course list."
                : "e.g. I have two job offers and don't know which career path to commit to."
            }
          />
        </div>

        {error && <Alert>{error}</Alert>}

        <Button type="submit" loading={submitting} className="w-full">
          {service === "mentorship" ? "Request mentorship" : "Book consultation"}
        </Button>
        <p className="text-center text-xs text-ink-500">
          This sends a request, it does not charge a card. We&apos;ll follow up by email.
        </p>
      </form>
    </Card>
  );
}
