import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProgressBar, RadialProgress } from "@/components/ui/progress";

describe("ProgressBar", () => {
  it("clamps values above 100 to 100% width", () => {
    render(<ProgressBar value={150} />);
    expect(screen.getByTestId("progress-fill")).toHaveStyle({ width: "100%" });
  });

  it("clamps negative values to 0% width", () => {
    render(<ProgressBar value={-20} />);
    expect(screen.getByTestId("progress-fill")).toHaveStyle({ width: "0%" });
  });

  it("renders the exact percentage within range", () => {
    render(<ProgressBar value={42} />);
    expect(screen.getByTestId("progress-fill")).toHaveStyle({ width: "42%" });
  });
});

describe("RadialProgress", () => {
  it("displays the clamped numeric value", () => {
    const { getByText } = render(<RadialProgress value={72} />);
    expect(getByText("72")).toBeInTheDocument();
  });

  it("clamps display value above 100", () => {
    const { getByText } = render(<RadialProgress value={140} />);
    expect(getByText("100")).toBeInTheDocument();
  });
});
