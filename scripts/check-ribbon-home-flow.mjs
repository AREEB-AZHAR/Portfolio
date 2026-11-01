import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
const { chromium } = createRequire(import.meta.url)(
  process.env.PLAYWRIGHT_MODULE || "playwright",
);
const browser = await chromium.launch({ headless: true, channel: "msedge" }),
  url = process.env.HOME_URL || "http://127.0.0.1:5184/",
  out = process.env.HOME_OUTPUT || "tmp/ribbon-home-flow",
  report = {};
await mkdir(out, { recursive: true });
try {
  const c = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    }),
    p = await c.newPage();
  await p.goto(url);
  await p.locator("#animation-gate").waitFor({ state: "visible" });
  await p.locator('[data-motion="full"]').click();
  await p.waitForFunction(() => window.__ribbonStory?.ready);
  await p.locator('a[href="#introduction"]').click();
  report.skip = [];
  for (let i = 0; i < 8; i++) {
    report.skip.push(await p.evaluate(() => scrollY));
    await p.waitForTimeout(70);
  }
  assert(new Set(report.skip).size > 3);
  await p.waitForTimeout(500);
  await p.locator(".menu-toggle").click();
  assert.match(
    await p
      .locator("#site-menu")
      .evaluate((e) => getComputedStyle(e).backgroundColor),
    /^rgb\(/,
  );
  await p.keyboard.press("Escape");
  assert(!(await p.locator("#site-menu").evaluate((e) => e.open)));
  await p.locator(".motion-toggle").click();
  assert(
    await p
      .locator("html")
      .evaluate((e) => e.classList.contains("motion-reduced")),
  );
  await p.locator(".motion-toggle").click();
  await p.waitForTimeout(200);
  assert(
    Math.abs((await p.evaluate(() => window.__ribbonStory.phase)) - 1) < 0.1,
  );
  await p.evaluate(() =>
    scrollTo({ top: 6 * innerWidth, behavior: "instant" }),
  );
  await p.waitForTimeout(500);
  await p.locator('[data-project="rustbot"] .ribbon-link').click();
  await p.waitForURL("**/projects/rustbot/");
  assert(await p.locator("h1").count());
  await p.reload();
  assert(await p.locator("h1").count());
  await p.goBack();
  await p.waitForFunction(() => window.__ribbonStory);
  report.projectNavigation = "passed";
  await p.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await p.reload({ waitUntil: "domcontentloaded" });
  const before = Date.now();
  await p.mouse.wheel(0, 180);
  await p.waitForFunction(() => scrollY > 30);
  report.refreshFirstScrollMs = Date.now() - before;
  await p.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await p.waitForTimeout(300);
  await p.keyboard.press("ArrowLeft");
  await p.waitForTimeout(300);
  assert(await p.evaluate(() => scrollY > innerWidth * 0.9));
  report.projectLinks = await p
    .locator(".ribbon-project .ribbon-link")
    .evaluateAll((links) => links.map((a) => a.href));
  assert.equal(report.projectLinks.length, 6);
  await c.close();
  for (const width of [320, 390]) {
    const ctx = await browser.newContext({
      viewport: { width, height: 844 },
      isMobile: true,
      hasTouch: true,
    });
    await ctx.addInitScript(() =>
      sessionStorage.setItem("portfolio-session-motion", "full"),
    );
    const m = await ctx.newPage();
    await m.goto(url);
    await m.waitForFunction(() => window.__ribbonStory?.ready);
    assert(
      !(await m
        .locator("html")
        .evaluate((e) => e.classList.contains("story-horizontal"))),
    );
    for (let i = 0; i < 14; i++) {
      await m.locator(".ribbon-panel").nth(i).scrollIntoViewIfNeeded();
      await m.waitForTimeout(180);
      assert(
        await m.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      );
      if ([0, 4, 8, 13].includes(i))
        await m.screenshot({ path: `${out}/mobile-${width}-${i}.png` });
    }
    await m.locator(".menu-toggle").click();
    await m.locator("#site-menu nav a").first().click();
    await m.waitForURL("**/about/");
    assert(
      !(await m
        .locator("body")
        .evaluate((e) => e.classList.contains("menu-open"))),
    );
    await ctx.close();
  }
  const reduced = await browser.newContext({ reducedMotion: "reduce" }),
    r = await reduced.newPage();
  await r.goto(url);
  await r.locator('[data-motion="reduced"]').click();
  assert(
    !(await r
      .locator("html")
      .evaluate((e) => e.classList.contains("story-horizontal"))),
  );
  assert.equal(await r.locator(".ribbon-stage canvas").count(), 0);
  await reduced.close();
  const fallback = await browser.newContext();
  await fallback.addInitScript(() => {
    sessionStorage.setItem("portfolio-session-motion", "full");
    const get = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (t, ...args) {
      return t.startsWith("webgl") ? null : get.call(this, t, ...args);
    };
  });
  const f = await fallback.newPage();
  await f.goto(url);
  await f.waitForTimeout(1200);
  assert(
    (await f.locator(".ribbon-filament path").getAttribute("d")).length > 100,
  );
  await f.mouse.wheel(0, 400);
  await f.waitForFunction(() => scrollY > 100);
  await fallback.close();
  report.mobile =
    "320 and 390: all fourteen sections, no horizontal overflow; menu navigation passed";
  report.accessibility =
    "motion choice, reduced motion, keyboard, menu Escape, toggle restoration and WebGL fallback passed";
  await writeFile(`${out}/results.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}
