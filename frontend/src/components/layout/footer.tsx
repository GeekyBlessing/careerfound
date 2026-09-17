import Link from "next/link";
import { BrandTile } from "@/components/brand/logo";

export function Footer() {
  return (
    <footer className="border-t border-[rgb(var(--fg-tint)/0.06)] py-12">
      <div className="container-page flex flex-col items-start justify-between gap-8 md:flex-row">
        <div>
          <Link href="/" className="focus-ring flex items-center gap-2 rounded-lg font-display font-semibold text-ink-100">
            <BrandTile className="h-6 w-6 rounded-md" />
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
              <li><Link href="/how-it-works" className="focus-ring rounded-sm transition-colors hover:text-ink-300">How it works</Link></li>
              <li><Link href="/careers" className="focus-ring rounded-sm transition-colors hover:text-ink-300">Career paths</Link></li>
              <li><Link href="/pricing" className="focus-ring rounded-sm transition-colors hover:text-ink-300">Pricing</Link></li>
              <li><Link href="/mentors" className="focus-ring rounded-sm transition-colors hover:text-ink-300">Mentors</Link></li>
            </ul>
          </div>
          <div>
            <p className="mb-3 font-medium text-ink-100">Company</p>
            <ul className="space-y-2 text-ink-500">
              <li><Link href="/about" className="focus-ring rounded-sm transition-colors hover:text-ink-300">About</Link></li>
              <li><Link href="/faq" className="focus-ring rounded-sm transition-colors hover:text-ink-300">FAQ</Link></li>
              <li><Link href="/contact" className="focus-ring rounded-sm transition-colors hover:text-ink-300">Contact</Link></li>
              <li><span className="cursor-default text-ink-500/60">Careers at CareerFound (coming soon)</span></li>
            </ul>
          </div>
          <div>
            <p className="mb-3 font-medium text-ink-100">Legal</p>
            <ul className="space-y-2 text-ink-500">
              <li><Link href="/privacy" className="focus-ring rounded-sm transition-colors hover:text-ink-300">Privacy</Link></li>
              <li><Link href="/terms" className="focus-ring rounded-sm transition-colors hover:text-ink-300">Terms</Link></li>
              <li><Link href="/refund-policy" className="focus-ring rounded-sm transition-colors hover:text-ink-300">Refunds</Link></li>
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
