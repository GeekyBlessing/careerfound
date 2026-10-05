import { describe, expect, it } from "vitest";
import { buildReadme, readmeCompleteness, renderSection } from "@/lib/readme";

const SECTIONS = [
  { key: "overview", title: "Overview" },
  { key: "problem", title: "Problem" },
  { key: "installation", title: "Installation" },
  { key: "usage", title: "Usage" },
  { key: "challenges", title: "Challenges" },
];

describe("README builder", () => {
  it("starts with the title and puts the overview directly under it", () => {
    const md = buildReadme("Network Reconnaissance Tool", SECTIONS, { overview: "A scanner." });
    expect(md.startsWith("# Network Reconnaissance Tool\n\nA scanner.")).toBe(true);
    expect(md).not.toContain("## Overview");
  });

  it("leaves empty sections out instead of padding them", () => {
    const md = buildReadme("T", SECTIONS, { overview: "x", problem: "Real problem." });
    expect(md).toContain("## Problem\n\nReal problem.");
    expect(md).not.toContain("## Challenges");
  });

  it("fences command sections and leaves prose alone", () => {
    expect(renderSection("installation", "git clone URL\ncd project\npython -m pytest")).toBe("```bash\ngit clone URL\ncd project\npython -m pytest\n```");
    expect(renderSection("problem", "git is a tool")).toBe("git is a tool");
    expect(renderSection("usage", "```bash\nls\n```")).toBe("```bash\nls\n```");
  });

  it("reports what is missing and flags leftover placeholders", () => {
    const result = readmeCompleteness(SECTIONS, { overview: "x", installation: "git clone YOUR_REPOSITORY_URL" });
    expect(result.filled).toBe(2);
    expect(result.missing).toEqual(["Problem", "Usage", "Challenges"]);
    expect(result.placeholdersLeft).toBe(true);
    expect(readmeCompleteness(SECTIONS, { overview: "a", problem: "b", installation: "c", usage: "d", challenges: "e" }).placeholdersLeft).toBe(false);
  });

  it("never emits a long dash", () => {
    const md = buildReadme("T", SECTIONS, { overview: "x", problem: "y" });
    expect(/[–—]/.test(md)).toBe(false);
  });
});
