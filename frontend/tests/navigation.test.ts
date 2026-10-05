import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  ACCOUNT_LINKS,
  GET_STARTED_HREF,
  MORE_LINKS,
  NAV_GROUPS,
  ROLE_LINKS,
  SIGNED_OUT_ACCOUNT_LINKS,
  groupIsActive,
  pathMatches,
} from "@/lib/navigation";

const APP_DIR = join(__dirname, "..", "src", "app");

/** A link is real if src/app has a page for it (route groups like (auth) are transparent). */
function routeExists(href: string): boolean {
  const path = href.split("#")[0]!.split("?")[0]!;
  const segments = path.split("/").filter(Boolean);
  const candidates = [segments.join("/"), ["(auth)", ...segments].join("/")];
  return candidates.some((c) => existsSync(join(APP_DIR, c, "page.tsx"))) || (segments.length === 0 && existsSync(join(APP_DIR, "page.tsx")));
}

describe("global navigation", () => {
  const allHrefs = [
    ...NAV_GROUPS.flatMap((g) => g.items.map((i) => i.href)),
    ...MORE_LINKS.map((l) => l.href),
    ...ACCOUNT_LINKS.map((l) => l.href),
    ...Object.values(ROLE_LINKS).flat().map((l) => l.href),
    ...SIGNED_OUT_ACCOUNT_LINKS.map((l) => l.href),
    GET_STARTED_HREF,
  ];

  it("every link points at a route that exists", () => {
    const missing = allHrefs.filter((h) => !routeExists(h));
    expect(missing).toEqual([]);
  });

  it("has the groups the brief calls for, with the expected destinations", () => {
    expect(NAV_GROUPS.map((g) => g.label)).toEqual(["Explore", "Build", "Prepare", "Guidance", "Jobs"]);
    const hrefs = (key: string) => NAV_GROUPS.find((g) => g.key === key)!.items.map((i) => i.href);
    expect(hrefs("explore")).toEqual(["/careers", "/onboarding", "/roadmap"]);
    expect(hrefs("build")).toEqual(["/projects", "/portfolio", "/mentor"]);
    expect(hrefs("prepare")).toEqual(["/readiness", "/skill-gap"])
    expect(hrefs("jobs")).toEqual(["/job-matcher"])
    expect(hrefs("guidance")).toEqual(expect.arrayContaining(["/mentors", "/consultation"]));
  });

  it("matches paths by segment, so /mentors never lights up AI Mentor", () => {
    expect(pathMatches("/mentors", ["/mentor"])).toBe(false);
    expect(pathMatches("/mentor", ["/mentor"])).toBe(true);
    expect(pathMatches("/careers/cloud-security", ["/careers"])).toBe(true);
    expect(pathMatches("/mentorship", ["/mentors"])).toBe(false);
  });

  it("marks the right group active, including the assessment results", () => {
    const explore = NAV_GROUPS[0]!;
    expect(groupIsActive("/assessment/results", explore)).toBe(true);
    expect(groupIsActive("/portfolio", explore)).toBe(false);
    expect(groupIsActive("/mentors/abc", NAV_GROUPS.find((g) => g.key === "guidance")!)).toBe(true);
  });

  it("no link, label or description uses a long dash", () => {
    const text = JSON.stringify(NAV_GROUPS.map((g) => [g.label, g.blurb, g.items.map((i) => [i.label, i.description])]));
    expect(/[–—]|--/.test(text)).toBe(false);
  });
});

describe("safeNextPath", () => {
  it("allows same-site paths only", async () => {
    const { safeNextPath } = await import("@/lib/navigation");
    expect(safeNextPath("/portfolio")).toBe("/portfolio");
    expect(safeNextPath("/projects/abc?x=1")).toBe("/projects/abc?x=1");
    expect(safeNextPath("https://evil.example")).toBeNull();
    expect(safeNextPath("//evil.example")).toBeNull();
    expect(safeNextPath("/\\evil")).toBeNull();
    expect(safeNextPath("/login")).toBeNull();
    expect(safeNextPath(null)).toBeNull();
  });
});
