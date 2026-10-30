import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { projects } from "../src/content/projects.mjs";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const base = (process.argv[2] || "http://127.0.0.1:5175/").replace(/\/?$/, "/");
const output = process.env.SCREENSHOT_DIR || "tmp/qa";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  ...(process.env.BROWSER_CHANNEL
    ? { channel: process.env.BROWSER_CHANNEL }
    : {}),
});
const errors = [];
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(base, { waitUntil: "networkidle" });
  await page.locator('[data-motion="full"]').click();
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${output}/home-desktop.png` });
  await page.mouse.wheel(0, 1200);
  await page.waitForTimeout(1300);
  assert(
    await page.evaluate(() => scrollY > 300),
    "Wheel scrolling must remain usable",
  );
  assert.notEqual(await page.locator(".hero-phase").textContent(), "01 / 04");
  console.log(
    "Sculpture:",
    await page
      .locator(".sculpture")
      .first()
      .evaluate((el) =>
        el.classList.contains("has-webgl") ? "WebGL" : "SVG fallback",
      ),
  );
  for (const [selector, name] of [
    [".introduction", "introduction"],
    [".principle-scene", "approach"],
    [".project-scene", "selected-work"],
    [".capability-bridge", "capabilities-bridge"],
  ]) {
    await page
      .locator(selector)
      .first()
      .evaluate((el) =>
        scrollTo({
          top: Number(el.dataset.panelIndex) * innerWidth,
          behavior: "instant",
        }),
      );
    await page.waitForTimeout(500);
    if (selector === ".project-scene")
      await page
        .locator(".project-scene img")
        .first()
        .evaluate((img) => img.decode());
    await page.screenshot({ path: `${output}/${name}.png` });
  }
  const resources = new Set();
  for (const path of [
    "",
    "about/",
    "projects/",
    "capabilities/",
    "contact/",
    ...projects.map((p) => `projects/${p.slug}/`),
  ]) {
    const response = await page.request.get(`${base}${path}`);
    assert.equal(response.status(), 200, `Missing route ${path}`);
    const html = await response.text();
    assert(html.includes("<h1"), `No page content ${path}`);
    for (const [, href] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      const url = new URL(href, `${base}${path}`);
      if (url.origin !== new URL(base).origin) continue;
      assert(
        url.pathname.startsWith(new URL(base).pathname),
        `Link escapes deployment base: ${url.href}`,
      );
      url.hash = "";
      resources.add(url.href);
    }
  }
  console.log("24 direct page routes passed.");
  for (const url of resources)
    assert.equal(
      (await page.request.get(url)).status(),
      200,
      `Missing internal resource: ${url}`,
    );
  console.log(
    `${resources.size} internal navigation/media/resource URLs passed.`,
  );
  for (const width of process.env.QA_LIGHT
    ? [390, 1440]
    : [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const path of [
      "",
      "about/",
      "projects/",
      "capabilities/",
      "contact/",
      "projects/rustbot/",
      "projects/degree-verification/",
      "projects/bunetto/",
      "projects/web-experiments/",
    ]) {
      await page.goto(`${base}${path}`, { waitUntil: "networkidle" });
      assert.equal(
        await page.locator("h1").count(),
        1,
        `Heading structure ${path}`,
      );
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - innerWidth,
      );
      assert(
        overflow <= 1,
        `Horizontal overflow ${overflow}px at ${width}: ${path}`,
      );
      await page.locator(".menu-toggle").click();
      assert(await page.locator("#site-menu").evaluate((el) => el.open));
      assert(
        await page.evaluate(() =>
          document.body.classList.contains("menu-open"),
        ),
      );
      await page.keyboard.press("Escape");
      assert(!(await page.locator("#site-menu").evaluate((el) => el.open)));
      assert(
        !(await page.evaluate(() =>
          document.body.classList.contains("menu-open"),
        )),
      );
      assert(
        await page
          .locator(".menu-toggle")
          .evaluate((el) => el === document.activeElement),
      );
    }
    await page.goto(base, { waitUntil: "networkidle" });
    await page.screenshot({ path: `${output}/home-${width}.png` });
    console.log(`Layout & keyboard menu passed: ${width}px`);
  }
  await page.goto(`${base}projects/`, { waitUntil: "networkidle" });
  await page.screenshot({ path: `${output}/projects-page.png` });
  await page.locator("#project-search").fill("no-such-project");
  assert(await page.locator(".archive-empty").isVisible());
  await page.locator("#project-search").fill("unity");
  assert.equal(await page.locator(".archive-row:visible").count(), 1);
  await page.locator("#project-search").fill("");
  assert.equal(
    await page.locator(".archive-row:visible").count(),
    projects.length - 6,
  );
  await page.goto(`${base}projects/bunetto/`, { waitUntil: "networkidle" });
  await page.screenshot({ path: `${output}/project-hero.png` });
  await page.locator(".case-gallery").scrollIntoViewIfNeeded();
  await page.locator(".case-gallery img").evaluate((img) => img.decode());
  await page.screenshot({ path: `${output}/bunetto-briefing.png` });
  await page.reload({ waitUntil: "networkidle" });
  assert((await page.locator("h1").textContent()).includes("Bunetto"));
  await page.locator(".next-project>a").click();
  await page.waitForURL("**/projects/chainshield/");
  await page.goBack({ waitUntil: "networkidle" });
  assert((await page.locator("h1").textContent()).includes("Bunetto"));
  await page.goto(`${base}about/`, { waitUntil: "networkidle" });
  const pdf = await page.request.get(
    await page
      .locator(".certificate-preview")
      .getAttribute("href")
      .then((href) => new URL(href, page.url()).href),
  );
  assert.equal(pdf.status(), 200);
  await page.locator(".certificate-section").scrollIntoViewIfNeeded();
  await page
    .locator(".certificate-preview img")
    .evaluate((img) => img.decode());
  await page.screenshot({ path: `${output}/certificate.png` });
  await page.goto(base, { waitUntil: "networkidle" });
  await page.locator(".motion-toggle").click();
  assert(
    await page.evaluate(() =>
      document.documentElement.classList.contains("motion-reduced"),
    ),
  );
  await page.reload({ waitUntil: "networkidle" });
  assert(
    await page.evaluate(() =>
      document.documentElement.classList.contains("motion-reduced"),
    ),
  );
  await page.screenshot({ path: `${output}/reduced-motion.png` });
  const fallback = await browser.newContext({ reducedMotion: "reduce" });
  const fallbackPage = await fallback.newPage();
  await fallbackPage.goto(base, { waitUntil: "networkidle" });
  await fallbackPage.locator('[data-motion="reduced"]').click();
  assert(await fallbackPage.locator(".sculpture-fallback").isVisible());
  await fallback.close();
  const unavailable = await browser.newContext();
  await unavailable.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return String(type).includes("webgl")
        ? null
        : getContext.call(this, type, ...args);
    };
  });
  const unavailablePage = await unavailable.newPage();
  await unavailablePage.goto(base, { waitUntil: "networkidle" });
  await unavailablePage.locator('[data-motion="full"]').click();
  await unavailablePage.waitForTimeout(1000);
  assert(
    await unavailablePage
      .locator(".hero-stage .sculpture-fallback")
      .isVisible(),
  );
  assert.equal(await unavailablePage.locator(".has-webgl").count(), 0);
  await unavailable.close();
  assert.deepEqual(errors, [], "Browser runtime errors");
  console.log(
    "Search, project refresh/back/next, certificate, motion preference, and fallback passed. No browser runtime errors.",
  );
} finally {
  await browser.close();
}
