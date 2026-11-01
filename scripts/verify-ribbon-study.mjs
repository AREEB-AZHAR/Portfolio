import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
const require = createRequire(import.meta.url),
  { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const url = process.argv[2] || "http://127.0.0.1:5184/motion-study/",
  out = process.env.STUDY_OUTPUT || "tmp/ribbon-study",
  quick = process.env.STUDY_QUICK === "1";
await mkdir(out, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  channel: process.env.BROWSER_CHANNEL || "msedge",
});
const results = [];
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    ...(!quick
      ? {
          recordVideo: {
            dir: `${out}/raw-video`,
            size: { width: 1440, height: 900 },
          },
        }
      : {}),
  });
  const page = await context.newPage(),
    errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(url);
  await page.waitForFunction(() => window.__motionStudy?.ready);
  await page.waitForTimeout(900);
  for (let i = 0; i < 4; i++) {
    if (i) {
      if (quick) await page.evaluate((n) => scrollTo(0, n * innerWidth), i);
      else
        for (let n = 0; n < 48; n++) {
          await page.mouse.wheel(0, 30);
          await page.waitForTimeout(38);
        }
    }
    await page.waitForTimeout(quick ? 250 : 1300);
    await page.screenshot({ path: `${out}/scene-${i}.png` });
    const report = await page.evaluate(async (index) => {
      const { sampleRibbon } = await import(
        "/src/motion-study/choreography.mjs"
      );
      const curve = sampleRibbon(index, {
        aspect: innerWidth / innerHeight,
        time: 0,
      });
      let minX = Infinity,
        maxX = -Infinity,
        minY = Infinity,
        maxY = -Infinity;
      for (let i = 0; i < curve.length; i += 3) {
        const x =
            (curve[i] / ((8 * innerWidth) / innerHeight) + 0.5) * innerWidth,
          y = (0.5 - curve[i + 1] / 8) * innerHeight;
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
      const panel = document.querySelectorAll(".chapter")[index];
      const texts = [
        ...panel.querySelectorAll(
          "h1,h2,.description,.skip,.scene-caption,.scene-note",
        ),
      ].map((el) => {
        const r = el.getBoundingClientRect();
        return {
          x: r.x,
          y: r.y,
          right: r.right,
          bottom: r.bottom,
          text: el.textContent,
        };
      });
      return {
        index,
        art: { minX, maxX, minY, maxY },
        texts,
        filamentWidth: getComputedStyle(
          document.querySelector(".filament path"),
        ).strokeWidth,
      };
    }, i);
    results.push(report);
    assert.equal(report.filamentWidth, "1px");
  }
  if (!quick) {
    for (let n = 0; n < 32; n++) {
      await page.mouse.wheel(0, -45);
      await page.waitForTimeout(45);
    }
    await page.waitForTimeout(1100);
  }
  const video = page.video();
  await context.close();
  if (video) await video.saveAs(`${out}/ribbon-study.webm`);
  assert.deepEqual(errors, []);
  if (!quick) {
    for (const [width, height] of [
      [320, 740],
      [390, 844],
      [768, 900],
      [1024, 768],
      [1920, 940],
    ]) {
      const ctx = await browser.newContext({ viewport: { width, height } }),
        p = await ctx.newPage();
      await p.goto(url);
      await p.waitForFunction(() => window.__motionStudy?.ready);
      await p.waitForTimeout(250);
      assert(
        await p.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      );
      await p.screenshot({ path: `${out}/responsive-${width}.png` });
      if (width < 768) {
        await p.locator(".chapter").nth(2).scrollIntoViewIfNeeded();
        await p.waitForTimeout(300);
        await p.screenshot({ path: `${out}/mobile-system-${width}.png` });
      }
      await ctx.close();
    }
    const ctx = await browser.newContext({
        viewport: { width: 1440, height: 900 },
      }),
      p = await ctx.newPage();
    await p.goto(url);
    await p.waitForFunction(() => window.__motionStudy?.ready);
    await p.locator(".skip").click();
    const positions = [];
    for (let n = 0; n < 8; n++) {
      positions.push(await p.evaluate(() => scrollY));
      await p.waitForTimeout(70);
    }
    assert(new Set(positions).size > 3);
    results.push({ smoothSkip: positions });
    await p.evaluate(() => scrollTo(0, 0));
    await p.reload({ waitUntil: "domcontentloaded" });
    const start = Date.now();
    await p.mouse.wheel(0, 150);
    await p.waitForFunction(() => scrollY > 20);
    results.push({ firstScrollMs: Date.now() - start });
    await p.locator(".motion-switch").click();
    assert(
      await p.evaluate(() =>
        document.documentElement.classList.contains("is-still"),
      ),
    );
    await ctx.close();
    const auditContext = await browser.newContext({
        viewport: { width: 1440, height: 900 },
      }),
      audit = await auditContext.newPage();
    await audit.goto(url);
    await audit.waitForFunction(() => window.__motionStudy?.ready);
    await audit.waitForTimeout(600);
    const collisions = [];
    for (let step = 0; step <= 60; step++) {
      await audit.evaluate(
        (x) => scrollTo({ top: x * innerWidth, behavior: "instant" }),
        step / 20,
      );
      await audit.waitForTimeout(120);
      const hit = await audit.evaluate(async () => {
        const phase = window.__motionStudy.phase,
          { sampleRibbon } = await import("/src/motion-study/choreography.mjs"),
          curve = sampleRibbon(phase, {
            aspect: innerWidth / innerHeight,
            time: performance.now() / 1000,
          });
        const boxes = [];
        document.querySelectorAll(".chapter").forEach((panel) => {
          if (Number(getComputedStyle(panel).opacity) < 0.25) return;
          panel
            .querySelectorAll(
              "h1,h2,.description,.scene-caption,.scene-note,.skip",
            )
            .forEach((el) => {
              const walker = document.createTreeWalker(
                el,
                NodeFilter.SHOW_TEXT,
              );
              while (walker.nextNode()) {
                const range = document.createRange();
                range.selectNodeContents(walker.currentNode);
                for (const r of range.getClientRects())
                  if (r.width && r.height)
                    boxes.push({
                      left: r.left,
                      right: r.right,
                      top: r.top,
                      bottom: r.bottom,
                    });
              }
            });
        });
        const inside = (x, y, pad) =>
          boxes.some(
            (r) =>
              x >= r.left - pad &&
              x <= r.right + pad &&
              y >= r.top - pad &&
              y <= r.bottom + pad,
          );
        let ribbonHits = 0,
          filamentHits = 0;
        for (let i = 0; i < curve.length; i += 3) {
          if (
            inside(
              (curve[i] / ((8 * innerWidth) / innerHeight) + 0.5) * innerWidth,
              (0.5 - curve[i + 1] / 8) * innerHeight,
              12,
            )
          )
            ribbonHits++;
        }
        const path = document.querySelector(".filament path"),
          length = path.getTotalLength();
        for (let i = 0; i <= 400; i++) {
          const p = path.getPointAtLength((length * i) / 400);
          if (inside(p.x, p.y, 3)) filamentHits++;
        }
        return { phase, ribbonHits, filamentHits };
      });
      if (hit.ribbonHits || hit.filamentHits) collisions.push(hit);
    }
    const performanceReport = await audit.evaluate(() => {
      const summary = (a) => {
        a = a.slice(30).sort((a, b) => a - b);
        return {
          median: a[Math.floor(a.length * 0.5)],
          p95: a[Math.floor(a.length * 0.95)],
          samples: a.length,
        };
      };
      return {
        rafMs: summary(window.__motionStudy.frames),
        cpuDrawMs: summary(window.__motionStudy.drawCosts),
      };
    });
    results.push({
      transitionCollisions: collisions,
      performance: performanceReport,
    });
    await auditContext.close();
    assert.deepEqual(collisions, [], "Visible text must clear the ribbon and filament during transitions");
    const isolated = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      recordVideo: {
        dir: `${out}/isolated-raw`,
        size: { width: 1440, height: 900 },
      },
    });
    const ip = await isolated.newPage();
    await ip.goto(url);
    await ip.waitForFunction(() => window.__motionStudy?.ready);
    await ip.evaluate(() => document.documentElement.classList.add("isolated"));
    await ip.waitForTimeout(600);
    for (let n = 0; n < 144; n++) {
      await ip.mouse.wheel(0, 30);
      await ip.waitForTimeout(30);
    }
    await ip.waitForTimeout(600);
    const iv = ip.video();
    await isolated.close();
    await iv.saveAs(`${out}/ribbon-isolated.webm`);
  }
  await writeFile(`${out}/results.json`, JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
} finally {
  await browser.close();
}
