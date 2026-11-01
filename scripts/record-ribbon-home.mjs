import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
const { chromium } = createRequire(import.meta.url)(
  process.env.PLAYWRIGHT_MODULE || "playwright",
);
const out = process.env.HOME_OUTPUT || "tmp/ribbon-home-recording";
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true, channel: "msedge" });
try {
  for (const isolated of [false, true]) {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      recordVideo: { dir: `${out}/raw`, size: { width: 1440, height: 900 } },
    });
    await context.addInitScript(() =>
      sessionStorage.setItem("portfolio-session-motion", "full"),
    );
    const page = await context.newPage();
    await page.goto(process.env.HOME_URL || "http://127.0.0.1:5184/");
    await page.waitForFunction(() => window.__ribbonStory?.ready);
    await page.waitForTimeout(800);
    if (isolated)
      await page.addStyleTag({
        content:
          ".ribbon-panel,.site-header,.progress-rail{visibility:hidden!important}",
      });
    for (let section = 0; section < 13; section++) {
      for (let n = 0; n < 24; n++) {
        await page.mouse.wheel(0, 60);
        await page.waitForTimeout(isolated ? 22 : 35);
      }
      await page.waitForTimeout(isolated ? 120 : 450);
    }
    await page.waitForTimeout(700);
    // Real wheel reversals and a quick forward/backward scrub exercise the same
    // native input path as visitors, rather than setting the animation phase.
    for (let n = 0; n < 32; n++) {
      await page.mouse.wheel(0, -90);
      await page.waitForTimeout(25);
    }
    for (const delta of [700, -550, 900, -1050]) {
      await page.mouse.wheel(0, delta);
      await page.waitForTimeout(350);
    }
    await page.waitForTimeout(600);
    const video = page.video();
    await context.close();
    await video.saveAs(`${out}/${isolated ? "artwork" : "story"}.webm`);
  }
  console.log(`Saved real scrolling recordings to ${out}`);
} finally {
  await browser.close();
}
