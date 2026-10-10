import { describe, expect, it } from "vitest";
import { ApiError } from "@/lib/api";
import { describeResendError, maskEmail } from "@/lib/verification";

describe("maskEmail", () => {
  it("keeps the first letter and the domain, matching the API", () => {
    expect(maskEmail("john.doe@gmail.com")).toBe("j******@gmail.com");
    expect(maskEmail("ab@x.co")).toBe("a**@x.co");
  });
  it("never echoes something that is not an address", () => {
    expect(maskEmail("nonsense")).toBe("***");
    expect(maskEmail("@x.co")).toBe("***");
  });
});

describe("describeResendError", () => {
  it("turns a cooldown into a countdown, not an error", () => {
    const err = new ApiError("Please wait 42 seconds", 429, "resend_cooldown", { retry_after: 42 });
    const { notice, cooldown } = describeResendError(err);
    expect(cooldown).toBe(42);
    expect(notice.tone).toBe("info");
    expect(notice.text).toContain("42");
  });
  it("keeps the server's honest wording for delivery failures and leaves retry open", () => {
    const err = new ApiError("Our email service is temporarily unavailable.", 503, "email_temporarily_unavailable", {});
    const { notice, cooldown } = describeResendError(err);
    expect(notice.tone).toBe("error");
    expect(notice.text).toBe("Our email service is temporarily unavailable.");
    expect(cooldown).toBe(0);
  });
  it("flags setup problems so the page can stop implying the address is wrong", () => {
    const err = new ApiError("Not working on our side.", 503, "email_not_configured", { setup_problem: true });
    expect(describeResendError(err).notice.setupProblem).toBe(true);
  });
  it("treats already verified as a success", () => {
    const err = new ApiError("already", 409, "already_verified");
    expect(describeResendError(err).notice.tone).toBe("success");
  });
  it("does not blame email for a network failure", () => {
    const { notice } = describeResendError(new TypeError("Failed to fetch"));
    expect(notice.text.toLowerCase()).toContain("connection");
  });
});
