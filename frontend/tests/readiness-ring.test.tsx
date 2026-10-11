import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ReadinessRing } from "@/components/career/readiness-ring";

describe("ReadinessRing", () => {
  it("shows a real score as a number with its scale", () => {
    render(<ReadinessRing score={53} active />);
    expect(screen.getByText("53")).toBeInTheDocument();
    expect(screen.getByText("out of 100")).toBeInTheDocument();
    expect(screen.getByRole("img")).toHaveAttribute("aria-label", "Career readiness: 53 out of 100");
  });

  it("never shows a zero when nothing has been measured yet", () => {
    render(<ReadinessRing score={0} active={false} />);
    expect(screen.queryByText("0")).not.toBeInTheDocument();
    expect(screen.getByText("Not scored yet")).toBeInTheDocument();
    expect(screen.getByRole("img")).toHaveAttribute("aria-label", "Career readiness: no score yet");
  });

  it("keeps the empty label inside the ring at small sizes", () => {
    render(<ReadinessRing score={0} active={false} size={136} />);
    const label = screen.getByText("Not scored yet");
    expect(parseFloat(label.style.maxWidth)).toBeLessThan(136 * 0.6);
  });
});
