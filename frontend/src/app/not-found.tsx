import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/brand/logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <span className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15">
        <LogoMark tone="signature" className="h-6 w-6" />
      </span>
      <h1 className="text-2xl font-semibold text-ink-100">Page not found</h1>
      <p className="mt-2 max-w-sm text-sm text-ink-500">
        The page you&apos;re looking for doesn&apos;t exist, or you don&apos;t have access to it yet.
      </p>
      <Link href="/" className="mt-6">
        <Button>Back to home</Button>
      </Link>
    </div>
  );
}
