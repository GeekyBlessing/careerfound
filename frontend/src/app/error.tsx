"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // In production this should report to an error-tracking service.
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <span className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-danger/15 text-danger">
        <AlertTriangle className="h-6 w-6" />
      </span>
      <h1 className="text-2xl font-semibold text-ink-100">Something went wrong</h1>
      <p className="mt-2 max-w-sm text-sm text-ink-500">
        An unexpected error occurred. You can try again, or come back in a moment.
      </p>
      <Button className="mt-6" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
