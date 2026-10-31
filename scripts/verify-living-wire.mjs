import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
const require = createRequire(import.meta.url),
  { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const sharp = require(process.env.SHARP_MODULE || "sharp");
const base = process.argv[2] || "http://127.0.0.1:5181/Portfolio/",
  output = process.env.SCREENSHOT_DIR || "tmp/living-wire-qa";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  ...(process.env.BROWSER_CHANNEL
    ? { channel: process.env.BROWSER_CHANNEL }
    : {}),
});
const results = [];
async function pixels(page) {
  return page.locator(".story-atmosphere").screenshot();
}
async function difference(a, b) {
  const A = await sharp(a).removeAlpha().raw().toBuffer(),
    B = await sharp(b).removeAlpha().raw().toBuffer();
  let changed = 0,
    total = 0;
  for (let i = 0; i < A.length; i += 3) {
    const d =
      Math.abs(A[i] - B[i]) +
      Math.abs(A[i + 1] - B[i + 1]) +
      Math.abs(A[i + 2] - B[i + 2]);
    if (d > 35) changed++;
    total += d;
  }
  return { changedPixels: changed, meanDifference: total / A.length };
}
try {
  const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
    }),
    page = await context.newPage(),
    errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(base);
  await page.locator('[data-motion="full"]').click();
  await page.locator(".has-webgl").waitFor();
  await page.waitForTimeout(700);
  await page.evaluate(() => document.activeElement.blur());
  await page.screenshot({ path: `${output}/hero-button.png` });
  const button = page.locator(".intro-skip");
  assert(
    await button.evaluate((el) => {
      const s = getComputedStyle(el);
      return (
        s.backgroundColor !== "rgba(0, 0, 0, 0)" &&
        parseFloat(s.minHeight) >= 48 &&
        s.boxShadow !== "none"
      );
    }),
    "Skip is visually a raised button",
  );
  await button.click();
  const samples = [];
  for (let i = 0; i < 9; i++) {
    samples.push(await page.evaluate(() => scrollY));
    await page.waitForTimeout(65);
  }
  assert(
    new Set(samples.map((v) => Math.round(v / 5))).size >= 4,
    "Skip must glide through multiple positions",
  );
  assert(
    samples.some((v) => v > 20 && v < 1400),
    "Skip must not jump immediately to the destination",
  );
  await page.waitForFunction(
    () =>
      Math.abs(
        document.querySelector("#introduction").getBoundingClientRect().left,
      ) < 2,
  );
  results.push({ check: "Raised skip button + smooth glide", samples });
  // Hold the same camera and viewport. Changes below must be the actual wire,
  // not page text moving, and must respond to small real wheel inputs.
  await page.addStyleTag({
    content:
      ".horizontal-track{visibility:hidden!important}.site-header,.progress-rail{visibility:hidden!important}",
  });
  await page.evaluate(() =>
    scrollTo({ top: 2 * innerWidth, behavior: "instant" }),
  );
  await page.waitForTimeout(600);
  const frames = [],
    d = [];
  for (let i = 0; i < 12; i++) {
    if (i) {
      await page.mouse.wheel(0, 135);
      await page.waitForTimeout(230);
    }
    const shot = await pixels(page);
    frames.push(shot);
    await writeFile(`${output}/wire-${i}.png`, shot);
    d.push(await page.locator(".wire-base").getAttribute("d"));
  }
  assert.equal(
    new Set(d).size,
    12,
    "The SVG curve itself must deform on each small scroll, not just translate",
  );
  const changes = [];
  for (let i = 1; i < frames.length; i++) {
    const change = await difference(frames[i - 1], frames[i]);
    changes.push(change);
    assert(
      change.changedPixels > 500,
      "Visible rendered wire must change, not just data attributes",
    );
  }
  const width = 1440,
    height = 1000;
  const composed = await sharp({
    create: {
      width: width * 4,
      height: height * 3,
      channels: 3,
      background: "#090909",
    },
  })
    .composite(
      frames.map((input, i) => ({
        input,
        left: (i % 4) * width,
        top: Math.floor(i / 4) * height,
      })),
    )
    .png()
    .toBuffer();
  const montage = await sharp(composed).resize(2000).png().toBuffer();
  await writeFile(`${output}/wire-motion-contact-sheet.png`, montage);
  results.push({
    check: "Twelve visible 3D deformation frames from real small wheel inputs",
    changes,
  });
  // Confirm energy travels along a stationary string, rather than the entire
  // object drifting. The idle difference is smaller than scroll deformation.
  const idleA = await pixels(page);
  await page.waitForTimeout(650);
  const idleB = await pixels(page);
  const idle = await difference(idleA, idleB);
  assert(idle.changedPixels > 10, "Wire stays alive while at rest");
  assert(
    idle.changedPixels > 500,
    "Restored sculpture visibly responds to wind while idle",
  );
  results.push({ check: "Travelling energy / local breathing", ...idle });
  await page.evaluate(() => {
    history.replaceState(null, "", location.pathname);
    scrollTo({ top: 0, behavior: "instant" });
  });
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForFunction(
    () =>
      document.querySelector(".motion-toggle").getAttribute("aria-label") ===
      "Disable animations",
  );
  const firstScrollAt = Date.now();
  await page.mouse.wheel(0, 180);
  await page.waitForFunction(() => scrollY > 30);
  const responseMs = Date.now() - firstScrollAt;
  assert(responseMs < 700, "Refresh must not introduce a scroll gate");
  results.push({ check: "Immediate first scroll after refresh", responseMs });
  assert.deepEqual(errors, []);
  await context.close();
  // A true fallback run proves the thin string also draws and reforms without
  // WebGL; it must not stay as the same static background path.
  const fallback = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  await fallback.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return String(type).includes("webgl")
        ? null
        : original.call(this, type, ...args);
    };
  });
  const mobile = await fallback.newPage();
  await mobile.goto(base);
  await mobile.locator('[data-motion="full"]').tap();
  const pathA = await mobile.locator(".wire-base").getAttribute("d");
  await mobile.mouse.wheel(0, 350);
  await mobile.waitForTimeout(350);
  const pathB = await mobile.locator(".wire-base").getAttribute("d");
  assert.notEqual(pathA, pathB);
  assert(
    await mobile
      .locator(".story-thread")
      .evaluate((el) => getComputedStyle(el).opacity === "1"),
  );
  await mobile.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await mobile.waitForTimeout(100);
  const rect = await mobile.locator(".intro-skip").boundingBox();
  assert(rect.x >= 0 && rect.x + rect.width <= 390, "Mobile button fits");
  await mobile.locator(".intro-skip").tap();
  const start = await mobile.evaluate(() => scrollY);
  await mobile.waitForTimeout(100);
  const middle = await mobile.evaluate(() => scrollY);
  assert(middle > start && middle < 1500, "Mobile intro click also glides");
  await mobile.screenshot({ path: `${output}/mobile-wire-button.png` });
  await mobile.setViewportSize({ width: 320, height: 844 });
  await mobile.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await mobile.waitForTimeout(100);
  const narrow = await mobile.locator(".intro-skip").boundingBox();
  assert(
    narrow.x >= 0 && narrow.x + narrow.width <= 320,
    "Raised button fits at 320px too",
  );
  await mobile.locator(".motion-toggle").tap();
  const quietPath = await mobile.locator(".wire-base").getAttribute("d");
  await mobile.mouse.wheel(0, 250);
  await mobile.waitForTimeout(150);
  assert.equal(
    await mobile.locator(".wire-base").getAttribute("d"),
    quietPath,
    "Reduced motion keeps the wire static",
  );
  assert.equal(
    await mobile
      .locator(".wire-current")
      .evaluate((el) => getComputedStyle(el).opacity),
    "0",
  );
  await fallback.close();
  results.push({
    check: "Mobile SVG deformation, button fit and smooth skip",
    passed: true,
  });
  await writeFile(`${output}/results.json`, JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
} finally {
  await browser.close();
}
