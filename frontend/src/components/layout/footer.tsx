import Link from "next/link";
import { Compass } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-[rgb(var(--fg-tint)/0.06)] py-12">
      <div className="container-page flex flex-col items-start justify-between gap-8 md:flex-row">
        <div>
          <Link href="/" className="flex items-center gap-2 font-semibold text-ink-100">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-accent">
              <Compass className="h-3.5 w-3.5 text-white" />
            </span>
            CareerFound
          </Link>
          <p className="mt-3 max-w-xs text-sm text-ink-500">
            You don&apos;t need to figure out your entire future today. You just need to know your next step.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
          <div>
            <p className="mb-3 font-medium text-ink-100">Product</p>
            <ul className="space-y-2 text-ink-500">
              <li><a href="#how-it-works" className="hover:text-ink-300">How it works</a></li>
              <li><a href="#careers" className="hover:text-ink-300">Career paths</a></li>
              <li><a href="#pricing" className="hover:text-ink-300">Pricing</a></li>
            </ul>
          </div>
          <div>
            <p className="mb-3 font-medium text-ink-100">Company</p>
            <ul className="space-y-2 text-ink-500">
              <li><a href="#faq" className="hover:text-ink-300">FAQ</a></li>
              <li><a href="#" className="hover:text-ink-300">Careers at CareerFound</a></li>
            </ul>
          </div>
          <div>
            <p className="mb-3 font-medium text-ink-100">Legal</p>
            <ul className="space-y-2 text-ink-500">
              <li><a href="#" className="hover:text-ink-300">Privacy</a></li>
              <li><a href="#" className="hover:text-ink-300">Terms</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="container-page mt-10 border-t border-[rgb(var(--fg-tint)/0.06)] pt-6 text-xs text-ink-500">
        © {new Date().getFullYear()} CareerFound. Built for people just starting out.
      </div>
    </footer>
  );
}
