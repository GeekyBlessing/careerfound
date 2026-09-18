"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Bot,
  Briefcase,
  ChevronDown,
  FolderGit2,
  HelpCircle,
  Info,
  Map,
  Menu,
  Mail,
  Search,
  Sparkles,
  Tag,
  UserCog,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggleButton } from "@/components/ui/theme-toggle";
import { BrandTile } from "@/components/brand/logo";
import { useAuth } from "@/lib/auth";
import { CAREER_CATEGORIES, CAREER_PATH_COUNT } from "@/lib/career-categories";
import { cn } from "@/lib/utils";

type MenuKey = "explore" | "platform" | "mentorship" | "resources";

const PLATFORM_ITEMS = [
  { href: "/onboarding", label: "Career Assessment", description: "The honest questionnaire that recommends your path.", icon: Sparkles },
  { href: "/roadmap", label: "Roadmaps", description: "A staged plan for your path, beginner through advanced.", icon: Map },
  { href: "/projects", label: "Projects", description: "Real, structured builds that prove you can do the work.", icon: FolderGit2 },
  { href: "/portfolio", label: "Portfolio", description: "Turn finished projects into a portfolio you can show.", icon: Briefcase },
];

const MENTORSHIP_ITEMS = [
  { href: "/mentor", label: "AI Mentor", description: "Software, not a person: hints, code review, mock interviews, on call.", icon: Bot },
  { href: "/mentorship", label: "1:1 Mentorship", description: "Direct, paid mentorship with CareerFound's founder.", icon: UserCog },
  { href: "/mentors", label: "Mentor Marketplace", description: "Book sessions with working professionals by career path.", icon: Users },
  { href: "/consultation", label: "Career Consultation", description: "One focused 30-minute paid conversation.", icon: Mail },
];

const RESOURCES_ITEMS = [
  { href: "/how-it-works", label: "How it works", icon: Info },
  { href: "/faq", label: "FAQ", icon: HelpCircle },
  { href: "/pricing", label: "Pricing", icon: Tag },
  { href: "/about", label: "About", icon: Info },
  { href: "/contact", label: "Contact", icon: Mail },
];

export function MarketingNav() {
  const [openMenu, setOpenMenu] = useState<MenuKey | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState<MenuKey | null>(null);
  const { user } = useAuth();
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);

  // Close whatever menu is open on route change, outside click, or Escape,
  // so a mega-menu can never get stuck open after a click navigates away.
  useEffect(() => {
    setOpenMenu(null);
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenMenu(null);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenMenu(null);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const toggle = (key: MenuKey) => setOpenMenu((cur) => (cur === key ? null : key));

  return (
    <>
    <header
      ref={navRef}
      className="sticky top-0 z-40 border-b border-[rgb(var(--fg-tint)/0.08)] bg-base-950/92 backdrop-blur-md relative"
    >
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="focus-ring flex items-center gap-2 rounded-md font-display font-semibold tracking-tight text-ink-100">
          <BrandTile className="h-7 w-7" />
          CareerFound
        </Link>

        <nav className="hidden items-center md:flex" aria-label="Primary">
          <NavMenuButton label="Explore Careers" active={openMenu === "explore"} onClick={() => toggle("explore")} />
          <NavMenuButton label="Platform" active={openMenu === "platform"} onClick={() => toggle("platform")} />
          <NavMenuButton label="Mentorship" active={openMenu === "mentorship"} onClick={() => toggle("mentorship")} />
          <NavMenuButton label="Resources" active={openMenu === "resources"} onClick={() => toggle("resources")} />
        </nav>

        <div className="hidden items-center gap-1 md:flex">
          <Link href="/careers" aria-label="Search career paths" className="focus-ring rounded-md p-2 text-ink-400 hover:text-ink-100">
            <Search className="h-4 w-4" />
          </Link>
          <ThemeToggleButton />
          {user ? (
            <Button size="sm" className="ml-2" onClick={() => (window.location.href = "/dashboard")}>
              Go to dashboard
            </Button>
          ) : (
            <>
              <Link href="/login" className="focus-ring rounded-md px-2 py-1 text-sm text-ink-300 hover:text-ink-100">
                Log in
              </Link>
              <Link href="/onboarding" className="ml-1">
                <Button size="sm">Find My Tech Path</Button>
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggleButton />
          <button
            className="focus-ring rounded-md p-1.5 text-ink-300"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            aria-expanded={mobileOpen}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Desktop mega-menu / dropdown panel. One full-width surface anchored
          to the nav, its contents swapped by which top-level item is open,
          rather than four separately-positioned dropdowns each getting their
          own clipping/z-index edge cases. */}
      {openMenu && (
        <div className="absolute inset-x-0 top-full hidden border-b border-[rgb(var(--fg-tint)/0.1)] bg-base-950 shadow-raised md:block">
          <div className="container-page py-8">
            {openMenu === "explore" && <ExploreMenu />}
            {openMenu === "platform" && <SimpleMenu items={PLATFORM_ITEMS} />}
            {openMenu === "mentorship" && <SimpleMenu items={MENTORSHIP_ITEMS} note="AI Mentor is software. Mentorship and Consultation are paid, human, and separate." />}
            {openMenu === "resources" && <ResourcesMenu />}
          </div>
        </div>
      )}

    </header>

      {/* Mobile: a full-screen takeover rather than a dropdown sheet, so
          long menus (21 careers grouped into 5 categories) have room to
          breathe instead of scrolling inside a small floating panel.
          Deliberately rendered OUTSIDE <header>: that element has
          backdrop-blur (a CSS filter), and a filter on an ancestor creates
          a new containing block for position:fixed descendants, which
          silently shrank this overlay to the header's own ~64px height
          instead of covering the viewport. */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-base-950 md:hidden">
          <div className="container-page flex h-16 flex-shrink-0 items-center justify-between border-b border-[rgb(var(--fg-tint)/0.08)]">
            <Link href="/" className="flex items-center gap-2 font-display font-semibold text-ink-100" onClick={() => setMobileOpen(false)}>
              <BrandTile className="h-7 w-7" />
              CareerFound
            </Link>
            <button
              className="focus-ring rounded-md p-1.5 text-ink-300"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-6">
            <MobileSection
              title="Explore Careers"
              open={mobileSection === "explore"}
              onToggle={() => setMobileSection((s) => (s === "explore" ? null : "explore"))}
            >
              <div className="space-y-5">
                {CAREER_CATEGORIES.map((cat) => (
                  <div key={cat.name}>
                    <p className="font-mono text-[10px] uppercase tracking-wide text-ink-500">{cat.name}</p>
                    <ul className="mt-2 space-y-1">
                      {cat.paths.map((p) => (
                        <li key={p.slug}>
                          <Link href={`/careers/${p.slug}`} className="focus-ring block rounded-md py-1.5 text-sm text-ink-300 hover:text-ink-100">
                            {p.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                <Link href="/careers" className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-light">
                  View all {CAREER_PATH_COUNT} careers <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </MobileSection>

            <MobileSection
              title="Platform"
              open={mobileSection === "platform"}
              onToggle={() => setMobileSection((s) => (s === "platform" ? null : "platform"))}
            >
              <MobileLinks items={PLATFORM_ITEMS} />
            </MobileSection>

            <MobileSection
              title="Mentorship"
              open={mobileSection === "mentorship"}
              onToggle={() => setMobileSection((s) => (s === "mentorship" ? null : "mentorship"))}
            >
              <MobileLinks items={MENTORSHIP_ITEMS} />
            </MobileSection>

            <MobileSection
              title="Resources"
              open={mobileSection === "resources"}
              onToggle={() => setMobileSection((s) => (s === "resources" ? null : "resources"))}
            >
              <MobileLinks items={RESOURCES_ITEMS} />
            </MobileSection>
          </div>

          <div className="flex-shrink-0 space-y-2.5 border-t border-[rgb(var(--fg-tint)/0.08)] px-4 py-5">
            {user ? (
              <Link href="/dashboard">
                <Button className="w-full">Go to dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/onboarding">
                  <Button className="w-full">Find My Tech Path</Button>
                </Link>
                <Link href="/login">
                  <Button variant="secondary" className="w-full">
                    Log in
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function NavMenuButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={active}
      className={cn(
        "focus-ring flex items-center gap-1 rounded-md px-3 py-2 text-sm transition-colors",
        active ? "text-ink-100" : "text-ink-300 hover:text-ink-100"
      )}
    >
      {label}
      <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-150", active && "rotate-180")} />
    </button>
  );
}

function ExploreMenu() {
  return (
    <div>
      <div className="grid grid-cols-2 gap-x-8 gap-y-6 lg:grid-cols-5">
        {CAREER_CATEGORIES.map((cat) => (
          <div key={cat.name}>
            <p className="font-mono text-[10px] uppercase tracking-wide text-ink-500">{cat.name}</p>
            <ul className="mt-3 space-y-2">
              {cat.paths.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/careers/${p.slug}`}
                    className="focus-ring flex items-center gap-2 rounded-md text-sm text-ink-300 transition-colors hover:text-accent-light"
                  >
                    <p.icon className="h-3.5 w-3.5 flex-shrink-0 text-ink-500" />
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-6 flex items-center justify-between border-t border-[rgb(var(--fg-tint)/0.08)] pt-5">
        <p className="text-xs text-ink-500">{CAREER_PATH_COUNT} tech careers, grouped by discipline.</p>
        <Link href="/careers" className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-light hover:underline">
          View the full directory <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

function SimpleMenu({
  items,
  note,
}: {
  items: { href: string; label: string; description: string; icon: React.ElementType }[];
  note?: string;
}) {
  return (
    <div>
      <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <Link key={item.href} href={item.href} className="focus-ring group block rounded-md">
            <item.icon className="h-4 w-4 text-ink-500 transition-colors group-hover:text-accent-light" />
            <p className="mt-2 text-sm font-medium text-ink-100 transition-colors group-hover:text-accent-light">{item.label}</p>
            <p className="mt-1 text-xs leading-relaxed text-ink-500">{item.description}</p>
          </Link>
        ))}
      </div>
      {note && <p className="mt-6 border-t border-[rgb(var(--fg-tint)/0.08)] pt-4 text-xs text-ink-500">{note}</p>}
    </div>
  );
}

function ResourcesMenu() {
  return (
    <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-5">
      {RESOURCES_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="focus-ring flex items-center gap-2 rounded-md text-sm text-ink-300 transition-colors hover:text-accent-light"
        >
          <item.icon className="h-3.5 w-3.5 flex-shrink-0 text-ink-500" />
          {item.label}
        </Link>
      ))}
    </div>
  );
}

function MobileSection({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-[rgb(var(--fg-tint)/0.08)] py-1">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="focus-ring flex w-full items-center justify-between rounded-md py-3 text-left font-display text-lg font-semibold text-ink-100"
      >
        {title}
        <ChevronDown className={cn("h-4 w-4 text-ink-500 transition-transform duration-200", open && "rotate-180")} />
      </button>
      {open && <div className="pb-4">{children}</div>}
    </div>
  );
}

function MobileLinks({ items }: { items: { href: string; label: string; description?: string; icon: React.ElementType }[] }) {
  return (
    <ul className="space-y-4">
      {items.map((item) => (
        <li key={item.href}>
          <Link href={item.href} className="focus-ring flex items-start gap-3 rounded-md">
            <item.icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-ink-500" />
            <span>
              <span className="block text-sm font-medium text-ink-100">{item.label}</span>
              {item.description && <span className="mt-0.5 block text-xs text-ink-500">{item.description}</span>}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
