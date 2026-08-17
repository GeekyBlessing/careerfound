// One-off E2E smoke test run during development to verify the critical user
// journey works end-to-end against a live backend + frontend. Not part of
// the CI test suite (see tests/ for that) — this is a manual verification
// script kept here for future re-runs after major changes.
//
// Usage: npx playwright install chromium   (first time only)
//        node scripts/smoke-test.mjs
//
// Requires the backend (port 8000) and `npm run build && npm run start`
// (port 3000) to already be running, seeded with `python -m app.seed.seed_data`.
import { chromium } from "playwright";

const BASE = process.env.SMOKE_BASE_URL || "http://localhost:3000";
// Set PLAYWRIGHT_EXECUTABLE_PATH if you need to point at a specific browser
// binary (e.g. in a sandboxed CI environment); otherwise Playwright uses its
// normal managed browser install.
const executablePath = process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined;

function log(step) {
  console.log(`\n=== ${step} ===`);
}

async function main() {
  const browser = await chromium.launch({
    executablePath,
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(`console.error: ${msg.text()}`);
  });

  log("Landing page loads");
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForSelector("text=Find My Tech Path");
  console.log("OK: hero CTA visible");

  log("Login as demo user");
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await page.fill("#email", "demo@pathfound.dev");
  await page.fill("#password", "DemoPass123!");
  await page.click('button[type="submit"]');
  await page.waitForURL(/dashboard/, { timeout: 10000 });
  console.log("OK: redirected to dashboard after login");

  log("Dashboard shows today's mission and readiness score");
  await page.waitForSelector("text=Today's mission", { timeout: 10000 });
  await page.waitForSelector("text=Tech Readiness Score");
  console.log("OK: dashboard core widgets rendered");

  log("Roadmap page shows phases");
  await page.goto(`${BASE}/roadmap`, { waitUntil: "networkidle" });
  await page.waitForSelector("text=Phase 1");
  console.log("OK: roadmap phases rendered");

  log("AI Mentor chat responds");
  await page.goto(`${BASE}/mentor`, { waitUntil: "networkidle" });
  await page.fill("textarea", "I don't understand DNS");
  await page.keyboard.press("Enter");
  await page.waitForSelector("text=phonebook of the internet", { timeout: 10000 });
  console.log("OK: mentor gave a real, on-topic reply");

  log("Portfolio page loads");
  await page.goto(`${BASE}/portfolio`, { waitUntil: "networkidle" });
  await page.waitForSelector("body");
  console.log("OK: portfolio page did not crash");

  log("Mentors marketplace loads");
  await page.goto(`${BASE}/mentors`, { waitUntil: "networkidle" });
  await page.waitForSelector("text=Book 30-min session");
  console.log("OK: mentor cards rendered");

  log("Community page loads");
  await page.goto(`${BASE}/community`, { waitUntil: "networkidle" });
  await page.waitForSelector("body");
  console.log("OK: community page did not crash");

  log("Admin login + metrics");
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await page.fill("#email", "admin@pathfound.dev");
  await page.fill("#password", "AdminPass123!");
  await page.click('button[type="submit"]');
  await page.waitForURL(/dashboard/, { timeout: 10000 });
  await page.goto(`${BASE}/admin`, { waitUntil: "networkidle" });
  await page.waitForSelector("text=Platform overview");
  console.log("OK: admin overview rendered");

  await browser.close();

  if (errors.length > 0) {
    console.error("\n--- Console/page errors detected ---");
    for (const e of errors) console.error(e);
    process.exit(1);
  }

  console.log("\nAll smoke tests passed with zero console/page errors.");
}

main().catch((err) => {
  console.error("Smoke test failed:", err);
  process.exit(1);
});
