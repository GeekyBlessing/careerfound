"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

const links = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#careers", label: "Careers" },
  { href: "#mentor", label: "AI Mentor" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

export function MarketingNav() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-base-950/80 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold text-ink-100">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent">
            <Compass className="h-4 w-4 text-white" />
          </span>
          CareerFound
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-ink-300 transition-colors hover:text-ink-100">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <Button size="sm" onClick={() => (window.location.href = "/dashboard")}>
              Go to dashboard
            </Button>
          ) : (
            <>
              <Link href="/login" className="text-sm text-ink-300 hover:text-ink-100">
                Log in
              </Link>
              <Link href="/onboarding">
                <Button size="sm">Find My Tech Path</Button>
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden text-ink-300" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/[0.06] px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            {links.map((l) => (
              <a key={l.href} href={l.href} className="text-sm text-ink-300" onClick={() => setOpen(false)}>
                {l.label}
              </a>
            ))}
            <div className="mt-2 flex flex-col gap-2">
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
