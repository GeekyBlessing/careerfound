import { describe, expect, it } from "vitest";
import { mentorTagLabel } from "@/lib/mentor-tags";

describe("mentorTagLabel", () => {
  it("spells acronyms and product names properly", () => {
    expect(mentorTagLabel("sql")).toBe("SQL");
    expect(mentorTagLabel("power-bi")).toBe("Power BI");
    expect(mentorTagLabel("rest-apis")).toBe("REST APIs");
    expect(mentorTagLabel("javascript")).toBe("JavaScript");
    expect(mentorTagLabel("ui-ux-design")).toBe("UI/UX Design");
    expect(mentorTagLabel("ux-research")).toBe("UX Research");
  });
  it("title-cases everything else", () => {
    expect(mentorTagLabel("data-analysis")).toBe("Data Analysis");
    expect(mentorTagLabel("business-intelligence-engineering")).toBe("Business Intelligence Engineering");
    expect(mentorTagLabel("data-visualization")).toBe("Data Visualization");
  });
});
