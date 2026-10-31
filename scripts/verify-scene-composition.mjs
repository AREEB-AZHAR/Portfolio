import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const base = process.argv[2] || "http://127.0.0.1:5183/";
const output = process.env.SCREENSHOT_DIR || "tmp/scene-composition-qa";
const sizes = process.env.SCENE_SIZES
  ? JSON.parse(process.env.SCENE_SIZES)
  : [
      [1920, 940],
      [1440, 900],
      [1024, 768],
    ];
const indexes = process.env.SCENE_INDEXES
  ? JSON.parse(process.env.SCENE_INDEXES)
  : [0, 1, 2, 3, 4, 5, 6, 7, 9, 11, 13];
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  ...(process.env.BROWSER_CHANNEL
    ? { channel: process.env.BROWSER_CHANNEL }
    : {}),
});
const report = [];
async function snapshot(page, label) {
  await page.screenshot({ path: `${output}/${label}.png` });
}
function overlap(a, b, pad = 0) {
  if (!a || !b) return false;
  return (
    a.x < b.x + b.width + pad &&
    a.x + a.width + pad > b.x &&
    a.y < b.y + b.height + pad &&
    a.y + a.height + pad > b.y
  );
}
try {
  for (const [width, height] of sizes) {
    const context = await browser.newContext({ viewport: { width, height } });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(base);
    await page.locator('[data-motion="reduced"]').click();
    await snapshot(page, `hero-still-${width}`);
    assert(
      await page
        .locator(".story-thread")
        .evaluate((el) => getComputedStyle(el).display === "none"),
      "Still mode must not draw an unrelated cable through the headline",
    );
    await page.locator(".motion-toggle").click();
    await page.locator(".has-webgl").waitFor();
    await page.evaluate(() => document.activeElement.blur());
    await page.mouse.move(width - 16, height - 16);
    for (const index of indexes) {
      await page.evaluate(
        (i) => scrollTo({ top: i * innerWidth, behavior: "instant" }),
        index,
      );
      await page.waitForTimeout(450);
      await snapshot(page, `scene-${width}-${index}`);
      const measurements = await page.evaluate(async (i) => {
        const { getStrandLayout, sampleLivingStrand } = await import(
          "/src/living-strand.mjs"
        );
        const panel = [...document.querySelectorAll(".horizontal-panel")][i];
        const target = panel.querySelector(
          ".hero-type,.display,.principle-stage h2,.project-title,.footer-intro h2",
        );
        const foot = panel.querySelectorAll(
          ".hero-foot > div:first-child,.hero-shortcuts > a,.hero-phase,.principle-copy,.project-bottom,.footer-details",
        );
        const box = (el) => {
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return { x: r.x, y: r.y, width: r.width, height: r.height };
        };
        const textRects = [];
        const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) {
          const range = document.createRange();
          range.selectNodeContents(walker.currentNode);
          textRects.push(
            ...[...range.getClientRects()].filter((r) => r.width && r.height),
          );
        }
        const title = {
          x: Math.min(...textRects.map((r) => r.x)),
          y: Math.min(...textRects.map((r) => r.y)),
          width:
            Math.max(...textRects.map((r) => r.right)) -
            Math.min(...textRects.map((r) => r.x)),
          height:
            Math.max(...textRects.map((r) => r.bottom)) -
            Math.min(...textRects.map((r) => r.y)),
        };
        const layout = getStrandLayout(i, innerWidth / innerHeight);
        const scale = Math.min(0.9, 0.52 + (innerWidth / innerHeight) * 0.16);
        const object = {
          x: layout.objectX * innerWidth - (3.3 * scale * innerHeight) / 16,
          y: layout.objectY * innerHeight - (3.2 * scale * innerHeight) / 16,
          width: (3.3 * scale * innerHeight) / 8,
          height: (3.2 * scale * innerHeight) / 8,
        };
        const curve = sampleLivingStrand(i, {
          aspect: innerWidth / innerHeight,
          time: 0,
        });
        const pointHits = (rects) => {
          let hits = 0;
          for (let n = 0; n < curve.length; n += 3) {
            const x =
              (curve[n] / ((innerWidth / innerHeight) * 8) + 0.5) * innerWidth;
            const y = (0.5 - curve[n + 1] / 8) * innerHeight;
            if (
              rects.some(
                (r) =>
                  x >= r.x - 6 &&
                  x <= r.right + 6 &&
                  y >= r.y - 6 &&
                  y <= r.bottom + 6,
              )
            )
              hits++;
          }
          return hits;
        };
        return {
          title,
          foot: [...foot].map(box),
          object,
          layout,
          phase: document.querySelector(".story-atmosphere .sculpture").dataset
            .morphPhase,
          meshCount: document.querySelector(".story-atmosphere .sculpture")
            .dataset.meshCount,
          wireTitleHits: pointHits(textRects),
          wireActionHits: pointHits(
            [
              ...panel.querySelectorAll(
                ".intro-skip,.project-bottom .line-link,.footer-intro .line-link",
              ),
            ].map((el) => el.getBoundingClientRect()),
          ),
        };
      }, index);
      const { title, foot, object } = measurements;
      if (index === 0) {
        assert(
          foot.every((item) => !overlap(title, item, 12)),
          `Hero text and controls overlap at ${width}px`,
        );
      }
      assert.equal(
        measurements.meshCount,
        "3",
        "The cable and both chrome letters must render together",
      );
      assert(
        !overlap(object, title, 8),
        `Chrome AA overlaps the ${index} heading at ${width}px`,
      );
      if (index !== 13) {
        assert.equal(
          measurements.wireTitleHits,
          0,
          `Cable crosses the ${index} headline at ${width}px`,
        );
        assert.equal(
          measurements.wireActionHits,
          0,
          `Cable crosses a ${index} action at ${width}px`,
        );
      }
      report.push({ width, index, ...measurements });
    }
    assert.deepEqual(errors, []);
    await context.close();
  }
  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await mobile.newPage();
  await page.goto(base);
  await page.locator('[data-motion="reduced"]').tap();
  await snapshot(page, "hero-still-mobile");
  await page.locator(".motion-toggle").tap();
  await page.locator(".has-webgl").waitFor();
  await page.evaluate(() => document.activeElement.blur());
  await page.mouse.move(12, 800);
  await snapshot(page, "hero-mobile");
  await page.locator(".principle-scene").last().scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await snapshot(page, "approach-mobile");
  await mobile.close();
  await writeFile(`${output}/results.json`, JSON.stringify(report, null, 2));
  console.log(
    `Composition passed: ${report.length} desktop scenes, still hero, and mobile captures.`,
  );
} finally {
  await browser.close();
}
