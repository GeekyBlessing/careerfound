"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronDown, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggleButton } from "@/components/ui/theme-toggle";
import { BrandTile } from "@/components/brand/logo";
import { useAuth } from "@/lib/auth";
import { CAREER_CATEGORIES } from "@/lib/career-categories";
import {
  ACCOUNT_LINKS,
  GET_STARTED_HREF,
  MORE_LINKS,
  NAV_GROUPS,
  ROLE_LINKS,
  SIGNED_OUT_ACCOUNT_LINKS,
  groupIsActive,
  pathMatches,
  type NavGroup,
} from "@/lib/navigation";
import { cn, initials } from "@/lib/utils";

/**
 * CareerFound's one global navigation, on every page (public, signed in,
 * onboarding and auth). Everything renders from lib/navigation.ts.
 *
 * Desktop: a sticky header that is quiet at the top of the page and gains a
 * surface, hairline and a tighter height once you scroll. Three editorial
 * menus (Explore, Build, Guidance) open one shared panel; the current page
 * is marked with a short green rule under its menu and a dot beside its
 * item, not a filled pill. Mobile: logo, theme toggle, menu; the menu is a
 * full-height overlay in the same three sections plus Account.
 */
export function GlobalNav() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState<NavGroup["key"] | "account" | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOpenMenu(null);
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) setOpenMenu(null);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpenMenu(null);
        setMobileOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // React 18 cannot pass the boolean `inert` attribute, so it is set here:
  // while the overlay is closed nothing inside it is focusable or readable.
  useEffect(() => {
    const el = overlayRef.current;
    if (!el) return;
    if (mobileOpen) el.removeAttribute("inert");
    else el.setAttribute("inert", "");
  }, [mobileOpen]);

  // Lock page scroll behind the mobile overlay and hand focus to its close
  // button; give it back to the menu button on close.
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const button = menuButtonRef.current;
    return () => {
      document.body.style.overflow = prev;
      button?.focus();
    };
  }, [mobileOpen]);

  const toggle = useCallback((key: NavGroup["key"] | "account") => setOpenMenu((cur) => (cur === key ? null : key)), []);
  const switchIfOpen = (key: NavGroup["key"]) => setOpenMenu((cur) => (cur ? key : cur));

  const activeGroup = NAV_GROUPS.find((g) => g.key === openMenu);
  const accountActive = pathMatches(pathname, ["/dashboard", "/settings", "/mentor-dashboard", "/admin", "/reviews"]);
  const roleLinks = user ? ROLE_LINKS[user.role] ?? [] : [];

  return (
    <>
      <header
        ref={headerRef}
        className={cn(
          "sticky top-0 z-40 border-b transition-[background-color,border-color,backdrop-filter] duration-200",
          scrolled || openMenu
            ? "border-[rgb(var(--fg-tint)/0.1)] bg-base-950/90 backdrop-blur-md"
            : "border-transparent bg-transparent"
        )}
      >
        <div className={cn("container-page flex items-center justify-between transition-[height] duration-200", scrolled ? "h-14" : "h-16")}>
          <div className="flex items-center gap-10">
            <Link
              href="/"
              aria-label="CareerFound home"
              className="focus-ring flex items-center gap-2 rounded-md font-display text-lg font-semibold tracking-tight text-ink-100"
            >
              <BrandTile className="h-7 w-7" />
              CareerFound
            </Link>

            <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
              {NAV_GROUPS.map((group) => {
                const active = groupIsActive(pathname, group);
                const open = openMenu === group.key;
                return (
                  <button
                    key={group.key}
                    type="button"
                    onClick={() => toggle(group.key)}
                    onMouseEnter={() => switchIfOpen(group.key)}
                    aria-expanded={open}
                    aria-controls="global-nav-panel"
                    aria-current={active ? "true" : undefined}
                    className={cn(
                      "focus-ring group relative flex h-9 items-center gap-1 rounded-md px-3 text-sm transition-colors",
                      open || active ? "text-ink-100" : "text-ink-300 hover:text-ink-100"
                    )}
                  >
                    {group.label}
                    <ChevronDown className={cn("h-3.5 w-3.5 text-ink-500 transition-transform duration-150", open && "rotate-180")} />
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute inset-x-3 -bottom-[7px] h-0.5 origin-left rounded-full bg-accent-light transition-transform duration-200",
                        active ? "scale-x-100" : "scale-x-0"
                      )}
                    />
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="hidden items-center gap-1.5 md:flex">
            <ThemeToggleButton />
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => toggle("account")}
                  aria-expanded={openMenu === "account"}
                  aria-haspopup="menu"
                  className={cn(
                    "focus-ring group relative flex h-9 items-center gap-2 rounded-md pl-1.5 pr-2.5 text-sm transition-colors",
                    openMenu === "account" || accountActive ? "text-ink-100" : "text-ink-300 hover:text-ink-100"
                  )}
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/20 text-[10px] font-semibold text-accent-light">
                    {initials(user.full_name)}
                  </span>
                  Account
                  <ChevronDown className={cn("h-3.5 w-3.5 text-ink-500 transition-transform duration-150", openMenu === "account" && "rotate-180")} />
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute inset-x-2 -bottom-[7px] h-0.5 origin-left rounded-full bg-accent-light transition-transform duration-200",
                      accountActive ? "scale-x-100" : "scale-x-0"
                    )}
                  />
                </button>
                {openMenu === "account" && (
                  <div
                    role="menu"
                    className="absolute right-0 top-[calc(100%+0.65rem)] w-64 animate-fade-in rounded-lg border border-[rgb(var(--fg-tint)/0.12)] bg-base-950 p-2 shadow-raised"
                  >
                    <div className="px-3 pb-2 pt-2">
                      <p className="truncate text-sm font-medium text-ink-100">{user.full_name}</p>
                      <p className="truncate text-xs text-ink-500">{user.email}</p>
                    </div>
                    <ul className="border-t border-[rgb(var(--fg-tint)/0.08)] pt-1">
                      {[...ACCOUNT_LINKS, ...roleLinks].map((l) => (
                        <li key={l.href}>
                          <Link
                            href={l.href}
                            role="menuitem"
                            className={cn(
                              "focus-ring flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors hover:bg-[rgb(var(--fg-tint)/0.05)]",
                              pathMatches(pathname, l.match) ? "text-accent-light" : "text-ink-300 hover:text-ink-100"
                            )}
                          >
                            <l.icon className="h-4 w-4 text-ink-500" aria-hidden="true" />
                            {l.label}
                          </Link>
                        </li>
                      ))}
                      <li>
                        <button
                          type="button"
                          role="menuitem"
                          onClick={logout}
                          className="focus-ring flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm text-ink-300 transition-colors hover:bg-[rgb(var(--fg-tint)/0.05)] hover:text-ink-100"
                        >
                          <LogOut className="h-4 w-4 text-ink-500" aria-hidden="true" />
                          Log out
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  aria-current={pathMatches(pathname, ["/login"]) ? "page" : undefined}
                  className="focus-ring rounded-md px-3 py-1.5 text-sm text-ink-300 transition-colors hover:text-ink-100"
                >
                  Sign in
                </Link>
                <Link href={GET_STARTED_HREF}>
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-1 md:hidden">
            <ThemeToggleButton />
            <button
              ref={menuButtonRef}
              type="button"
              className="focus-ring flex h-10 w-10 items-center justify-center rounded-md text-ink-200"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* One shared desktop panel, its contents swapped by the open menu:
            an editorial line on the left, the destinations on the right,
            and a footer row so the secondary pages are one click away from
            wherever you are. */}
        {activeGroup && (
          <div id="global-nav-panel" className="absolute inset-x-0 top-full hidden animate-fade-in border-b border-[rgb(var(--fg-tint)/0.1)] bg-base-950 shadow-raised md:block">
            <div className="container-page grid grid-cols-[17rem_1fr] gap-12 py-9">
              <div>
                <p className="font-display text-2xl font-semibold tracking-tight text-ink-100">{activeGroup.label}</p>
                <p className="mt-3 text-sm leading-relaxed text-ink-500">{activeGroup.blurb}</p>
              </div>
              <ul className="grid grid-cols-2 gap-x-10 gap-y-6">
                {activeGroup.items.map((item) => {
                  const active = pathMatches(pathname, item.match);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className="focus-ring group flex gap-3.5 rounded-md"
                      >
                        <item.icon
                          className={cn("mt-0.5 h-4 w-4 flex-shrink-0 transition-colors", active ? "text-accent-light" : "text-ink-500 group-hover:text-accent-light")}
                          aria-hidden="true"
                        />
                        <span>
                          <span
                            className={cn(
                              "flex items-center gap-2 text-sm font-medium transition-colors",
                              active ? "text-accent-light" : "text-ink-100 group-hover:text-accent-light"
                            )}
                          >
                            {item.label}
                            {active && <span className="h-1.5 w-1.5 rounded-full bg-accent-light" aria-label="You are here" />}
                          </span>
                          <span className="mt-1 block text-xs leading-relaxed text-ink-500">{item.description}</span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="border-t border-[rgb(var(--fg-tint)/0.08)]">
              <div className="container-page flex flex-wrap items-center justify-between gap-x-8 gap-y-2 py-3.5 text-xs">
                {activeGroup.key === "explore" ? (
                  <p className="flex flex-wrap items-center gap-x-5 gap-y-1 text-ink-500">
                    <span className="font-mono uppercase tracking-wide">Browse by field</span>
                    {CAREER_CATEGORIES.map((c) => (
                      <Link key={c.slug} href={`/careers?category=${c.slug}`} className="focus-ring rounded-sm text-ink-400 transition-colors hover:text-accent-light">
                        {c.name}
                      </Link>
                    ))}
                  </p>
                ) : (
                  <span />
                )}
                <p className="flex flex-wrap items-center gap-x-5 gap-y-1 text-ink-500">
                  {MORE_LINKS.map((l) => (
                    <Link key={l.href} href={l.href} className="focus-ring rounded-sm transition-colors hover:text-ink-200">
                      {l.label}
                    </Link>
                  ))}
                </p>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Mobile overlay. Rendered outside <header> on purpose: a
          backdrop-filter on an ancestor becomes the containing block for
          fixed descendants and would shrink this to the header's height.
          Always mounted so it can animate; inert and hidden while closed. */}
      <div
        id="mobile-nav"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        aria-hidden={!mobileOpen}
        ref={overlayRef}
        className={cn(
          "fixed inset-0 z-50 flex h-[100dvh] flex-col bg-base-950 transition-[opacity,transform] duration-200 ease-smooth md:hidden",
          mobileOpen ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"
        )}
      >
        <div className="container-page flex h-16 flex-shrink-0 items-center justify-between border-b border-[rgb(var(--fg-tint)/0.08)]">
          <Link href="/" className="focus-ring flex items-center gap-2 rounded-md font-display text-lg font-semibold tracking-tight text-ink-100">
            <BrandTile className="h-7 w-7" />
            CareerFound
          </Link>
          <div className="flex items-center gap-1">
            <ThemeToggleButton />
            <button
              ref={closeRef}
              type="button"
              className="focus-ring flex h-10 w-10 items-center justify-center rounded-md text-ink-200"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto overscroll-contain px-5 pb-8 pt-4" aria-label="Mobile">
          {NAV_GROUPS.map((group) => (
            <section key={group.key} className="border-b border-[rgb(var(--fg-tint)/0.08)] py-5">
              <h2 className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-accent-light">{group.label}</h2>
              <ul className="mt-2">
                {group.items.map((item) => {
                  const active = pathMatches(pathname, item.match);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className="focus-ring flex min-h-[3.25rem] items-center justify-between gap-3 rounded-md py-1.5"
                      >
                        <span className="min-w-0">
                          <span className={cn("flex items-center gap-2.5 font-display text-2xl font-semibold tracking-tight", active ? "text-accent-light" : "text-ink-100")}>
                            {active && <span className="h-2 w-2 flex-shrink-0 rounded-full bg-accent-light" aria-label="You are here" />}
                            {item.label}
                          </span>
                        </span>
                        <ArrowRight className="h-4 w-4 flex-shrink-0 text-ink-500" aria-hidden="true" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}

          <section className="border-b border-[rgb(var(--fg-tint)/0.08)] py-5">
            <h2 className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-accent-light">Account</h2>
            <ul className="mt-2">
              {user ? (
                <>
                  {[...ACCOUNT_LINKS, ...roleLinks].map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className={cn(
                          "focus-ring flex min-h-[3rem] items-center gap-3 rounded-md py-1.5 font-display text-xl font-semibold tracking-tight",
                          pathMatches(pathname, l.match) ? "text-accent-light" : "text-ink-100"
                        )}
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <button
                      type="button"
                      onClick={logout}
                      className="focus-ring flex min-h-[3rem] w-full items-center gap-3 rounded-md py-1.5 text-left text-base text-ink-400"
                    >
                      <LogOut className="h-4 w-4" aria-hidden="true" /> Log out
                    </button>
                  </li>
                </>
              ) : (
                SIGNED_OUT_ACCOUNT_LINKS.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="focus-ring flex min-h-[3rem] items-center rounded-md py-1.5 font-display text-xl font-semibold tracking-tight text-ink-100">
                      {l.label}
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </section>

          <section className="py-5">
            <h2 className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-ink-500">More</h2>
            <ul className="mt-2 grid grid-cols-2 gap-x-4">
              {MORE_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="focus-ring flex min-h-[2.75rem] items-center rounded-md text-sm text-ink-300">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </nav>

        {!user && (
          <div className="flex-shrink-0 border-t border-[rgb(var(--fg-tint)/0.08)] bg-base-950 px-5 py-4" style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}>
            <Link href={GET_STARTED_HREF}>
              <Button size="lg" className="w-full gap-2">
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
