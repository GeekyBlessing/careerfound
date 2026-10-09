import { describe, expect, it } from "vitest";
import catalogue from "./fixtures/catalogue.json";
import { searchCareers } from "@/lib/career-search";
import { CAREER_CATEGORIES, CAREER_ORDER, canonicalCareerSlug, categoryForCareer } from "@/lib/career-categories";

const slugs = (query: string) => searchCareers(catalogue, query).map((r) => r.career.slug);

describe("searchCareers", () => {
  it("returns the whole catalogue in order for an empty query", () => {
    expect(slugs("")).toEqual(catalogue.map((c) => c.slug));
  });

  it("finds careers by name, best match first", () => {
    expect(slugs("cloud").slice(0, 2).sort()).toEqual(["cloud-engineering", "cloud-security"]);
    expect(slugs("pen")[0]).toBe("penetration-testing");
  });

  it("surfaces the cloud and infrastructure careers for AWS", () => {
    const found = slugs("AWS");
    for (const slug of ["cloud-engineering", "cloud-security", "devops-engineering", "solutions-architecture"]) {
      expect(found).toContain(slug);
    }
  });

  it("surfaces every Python career for Python", () => {
    const found = slugs("Python");
    for (const slug of [
      "software-engineering",
      "backend-engineering",
      "data-engineering",
      "data-science",
      "ai-engineering",
      "cybersecurity",
    ]) {
      expect(found).toContain(slug);
    }
  });

  it("surfaces the design careers for Figma", () => {
    const found = slugs("Figma");
    for (const slug of ["ui-ux-design", "product-design", "graphic-design"]) {
      expect(found).toContain(slug);
    }
  });

  it("matches entry roles, skills and keywords", () => {
    expect(slugs("SOC Analyst")).toContain("security-operations");
    expect(slugs("hypothesis")).toContain("data-science");
    expect(slugs("zapier")).toContain("workflow-automation");
  });

  it("matches short terms as whole words only", () => {
    const found = slugs("ml");
    expect(found).toContain("machine-learning-engineering");
    expect(found).not.toContain("frontend-development");
  });

  it("sends the example tool searches to the right careers", () => {
    expect(slugs("Flutter")).toContain("mobile-development");
    expect(slugs("SIEM")).toEqual(expect.arrayContaining(["security-operations", "detection-engineering"]));
    expect(slugs("Terraform")).toEqual(expect.arrayContaining(["cloud-engineering", "devops-engineering"]));
    expect(slugs("IAM")).toEqual(expect.arrayContaining(["identity-access-management", "cloud-security"]));
    expect(slugs("dbt")).toEqual(expect.arrayContaining(["analytics-engineering", "data-engineering"]));
    expect(slugs("Kubernetes")).toEqual(expect.arrayContaining(["devops-engineering", "platform-engineering", "site-reliability-engineering"]));
  });

  it("finds careers by the job titles people actually apply for", () => {
    expect(slugs("Junior DevOps Engineer")).toContain("devops-engineering");
    expect(slugs("SOC Analyst")).toContain("security-operations");
    expect(slugs("sdet")).toContain("qa-engineering");
    expect(slugs("DBA")).toContain("database-administration");
    expect(slugs("sysadmin")).toContain("systems-administration");
    expect(slugs("business analyst")).toContain("business-analysis");
    expect(slugs("grc")).toContain("governance-risk-compliance");
  });

  it("never lists a career twice", () => {
    for (const query of ["", "cloud", "python", "security", "engineer", "design", "data", "ai", "ml", "iam", "siem"]) {
      const found = slugs(query);
      expect(new Set(found).size).toBe(found.length);
    }
  });

  it("returns nothing, not everything, for a term that matches no career", () => {
    expect(slugs("underwater basket weaving")).toEqual([]);
  });

  it("requires every word to match", () => {
    expect(slugs("python figma")).toEqual([]);
    expect(slugs("zzzz")).toEqual([]);
  });

  it("explains non-name matches", () => {
    const aws = searchCareers(catalogue, "AWS").find((r) => r.career.slug === "cloud-engineering");
    expect(aws?.matchedOn).toMatch(/AWS/);
    const name = searchCareers(catalogue, "cybersecurity")[0];
    expect(name?.matchedOn).toBeNull();
  });
});

describe("career categories", () => {
  it("lists every career once, in the same order as the catalogue snapshot", () => {
    expect(CAREER_ORDER).toEqual(catalogue.map((c) => c.slug));
    expect(new Set(CAREER_ORDER).size).toBe(CAREER_ORDER.length);
  });

  it("agrees with the backend on each career's category", () => {
    for (const career of catalogue) {
      expect(categoryForCareer(career.slug)?.slug).toBe(career.category);
    }
  });

  it("has six categories and 48 careers, each career in exactly one", () => {
    expect(CAREER_CATEGORIES).toHaveLength(6);
    expect(CAREER_ORDER).toHaveLength(48);
    const owners = new Map<string, string[]>();
    for (const category of CAREER_CATEGORIES) {
      for (const path of category.paths) owners.set(path.slug, [...(owners.get(path.slug) ?? []), category.slug]);
    }
    for (const [slug, categories] of owners) expect(categories, slug).toHaveLength(1);
  });

  it("never lets a category double as a career, apart from the two general fields, or repeat itself in a name", () => {
    const categoryNames = CAREER_CATEGORIES.map((c) => c.name.toLowerCase());
    for (const category of CAREER_CATEGORIES) {
      for (const path of category.paths) {
        if (categoryNames.includes(path.name.toLowerCase())) {
          expect(["cybersecurity", "software-engineering"]).toContain(path.slug);
        }
        const words = path.name.toLowerCase().split(/\s+/);
        // No immediate word repeats ("Security Security").
        words.forEach((word, i) => expect(word).not.toBe(words[i - 1]));
      }
    }
  });

  it("maps legacy slugs to current ones", () => {
    expect(canonicalCareerSlug("devops")).toBe("devops-engineering");
    expect(canonicalCareerSlug("soc-analysis")).toBe("security-operations");
    expect(canonicalCareerSlug("ai-ml-engineering")).toBe("ai-engineering");
    expect(canonicalCareerSlug("no-code-automation")).toBe("workflow-automation");
    expect(canonicalCareerSlug("machine-learning-engineering")).toBe("machine-learning-engineering");
    expect(canonicalCareerSlug("cybersecurity")).toBe("cybersecurity");
  });
});
