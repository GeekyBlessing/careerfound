import { chromium } from "playwright";

const BASE = process.env.SMOKE_BASE_URL || "http://localhost:3000";
const executablePath = process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined;

async function main() {
  const browser = await chromium.launch({
    executablePath,
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.screenshot({ path: "/tmp/screenshots/landing.png", fullPage: true });

  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await page.fill("#email", "demo@pathfound.dev");
  await page.fill("#password", "DemoPass123!");
  await page.click('button[type="submit"]');
  await page.waitForURL(/dashboard/, { timeout: 10000 });
  await page.waitForSelector("text=Today's mission");
  await page.screenshot({ path: "/tmp/screenshots/dashboard.png", fullPage: true });

  await page.goto(`${BASE}/roadmap`, { waitUntil: "networkidle" });
  await page.waitForSelector("text=Phase 1");
  await page.screenshot({ path: "/tmp/screenshots/roadmap.png", fullPage: true });

  await page.goto(`${BASE}/onboarding`, { waitUntil: "networkidle" });
  await page.screenshot({ path: "/tmp/screenshots/onboarding.png", fullPage: false });

  await page.goto(`${BASE}/mentor`, { waitUntil: "networkidle" });
  await page.screenshot({ path: "/tmp/screenshots/mentor.png", fullPage: false });

  await browser.close();
  console.log("Screenshots saved to /tmp/screenshots/");
}

main();
