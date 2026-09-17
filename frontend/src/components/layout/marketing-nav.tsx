"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggleButton } from "@/components/ui/theme-toggle";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/careers", label: "Career paths" },
  { href: "/projects", label: "Projects" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/mentorship", label: "Mentorship" },
  { href: "/consultation", label: "Consultation" },
  { href: "/pricing", label: "Pricing" },
  { href: "/faq", label: "FAQ" },
];

export function MarketingNav() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-[rgb(var(--fg-tint)/0.07)] bg-base-950/85 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="focus-ring flex items-center gap-2 rounded-lg font-semibold tracking-tight text-ink-100">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent shadow-xs">
            <Compass className="h-4 w-4 text-white" />
          </span>
          CareerFound
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "focus-ring relative whitespace-nowrap rounded-lg px-2.5 py-2 text-sm transition-colors hover:text-ink-100",
                pathname === l.href ? "font-medium text-ink-100" : "text-ink-300"
              )}
            >
              {l.label}
              {pathname === l.href && (
                <span className="absolute inset-x-3 -bottom-[1px] h-0.5 rounded-full bg-accent-light" />
              )}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggleButton />
          {user ? (
            <Button size="sm" onClick={() => (window.location.href = "/dashboard")}>
              Go to dashboard
            </Button>
          ) : (
            <>
              <Link href="/login" className="focus-ring rounded-lg px-2 py-1 text-sm text-ink-300 hover:text-ink-100">
                Log in
              </Link>
              <Link href="/onboarding">
                <Button size="sm">Find My Tech Path</Button>
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggleButton />
          <button
            className="focus-ring rounded-lg p-1.5 text-ink-300"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="animate-fade-in border-t border-[rgb(var(--fg-tint)/0.07)] px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "focus-ring rounded-lg px-2.5 py-2 text-sm",
                  pathname === l.href ? "bg-accent/10 font-medium text-accent-light" : "text-ink-300"
                )}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2">
              {user ? (
                <Link href="/dashboard">
                  <Button className="w-full">Go to dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="secondary" className="w-full">
                      Log in
                    </Button>
                  </Link>
                  <Link href="/onboarding">
                    <Button className="w-full">Find My Tech Path</Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
