import assert from "node:assert/strict";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const browser = await chromium.launch({ headless: true, channel: "msedge" });
const url = process.argv[2] || "http://127.0.0.1:5184/motion-study/";
try {
  const p = await browser.newPage();
  await p.goto(url, { waitUntil: "domcontentloaded" });
  await p.waitForFunction(() => window.__motionStudy);
  await p.keyboard.press("ArrowLeft");
  await p.waitForFunction(() => window.__motionStudy.phase > 0.95);
  await p.locator(".motion-switch").click();
  assert(
    await p.locator("html").evaluate((el) => el.classList.contains("is-still")),
  );
  await p.locator(".motion-switch").click();
  await p.waitForFunction(
    () =>
      window.__motionStudy.phase > 0.95 && window.__motionStudy.phase < 1.05,
  );
  await p.close();
  const reduced = await browser.newContext({ reducedMotion: "reduce" });
  const r = await reduced.newPage();
  await r.goto(url, { waitUntil: "domcontentloaded" });
  await r.waitForFunction(() => window.__motionStudy);
  assert(
    await r.locator("html").evaluate((el) => el.classList.contains("is-still")),
  );
  assert.equal(await r.locator(".chapter[inert]").count(), 0);
  await reduced.close();
  const fallback = await browser.newContext();
  await fallback.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return type.startsWith("webgl")
        ? null
        : original.call(this, type, ...args);
    };
  });
  const f = await fallback.newPage();
  await f.goto(url, { waitUntil: "domcontentloaded" });
  await f.waitForTimeout(1500);
  assert((await f.locator(".filament path").getAttribute("d")).length > 100);
  await f.mouse.wheel(0, 400);
  await f.waitForFunction(() => scrollY > 100);
  assert.equal(await f.locator(".ribbon-stage canvas").count(), 0);
  await fallback.close();
  console.log(
    "Keyboard navigation, toggle restoration, OS reduced motion, and forced WebGL fallback passed.",
  );
} finally {
  await browser.close();
}
