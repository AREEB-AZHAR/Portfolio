import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
const { chromium } = createRequire(import.meta.url)(
  process.env.PLAYWRIGHT_MODULE || "playwright",
);
const url = process.env.HOME_URL || "http://127.0.0.1:5184/",
  out = process.env.HOME_OUTPUT || "tmp/ribbon-home",
  quick = process.env.HOME_QUICK === "1";
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true, channel: "msedge" }),
  errors = [],
  collisions = [];
async function audit(page) {
  return page.evaluate(() => {
    const boxes = [];
    const nodes = [...document.querySelectorAll(".ribbon-panel")].filter(
      (p) => Number(getComputedStyle(p).opacity) > 0.05,
    );
    nodes.push(
      document.querySelector(".site-header"),
      document.querySelector(".progress-rail"),
    );
    for (const panel of nodes) {
      const walker = document.createTreeWalker(panel, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const node = walker.currentNode;
        if (
          !node.textContent.trim() ||
          getComputedStyle(node.parentElement).visibility === "hidden" ||
          getComputedStyle(node.parentElement).opacity === "0"
        )
          continue;
        const range = document.createRange();
        range.selectNodeContents(node);
        for (const r of range.getClientRects())
          if (r.width && r.height)
            boxes.push({
              l: r.left,
              r: r.right,
              t: r.top,
              b: r.bottom,
              text: node.textContent.trim().slice(0, 35),
            });
      }
    }
    const hits = [],
      curve = window.__ribbonStory.curve;
    const test = (x, y, pad, kind) => {
      const box = boxes.find(
        (b) =>
          x >= b.l - pad && x <= b.r + pad && y >= b.t - pad && y <= b.b + pad,
      );
      if (box && !hits.some((h) => h.text === box.text && h.kind === kind))
        hits.push({ text: box.text, kind, x: Math.round(x), y: Math.round(y) });
    };
    for (let i = 0; i < curve.length; i += 3)
      test(
        (curve[i] / ((8 * innerWidth) / innerHeight) + 0.5) * innerWidth,
        (0.5 - curve[i + 1] / 8) * innerHeight,
        14,
        "ribbon",
      );
    const path = document.querySelector(".ribbon-filament path"),
      len = path.getTotalLength();
    for (let i = 0; i < 500; i++) {
      const p = path.getPointAtLength((len * i) / 499);
      test(p.x, p.y, 4, "filament");
    }
    return { phase: window.__ribbonStory.phase, hits };
  });
}
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  await context.addInitScript(() =>
    sessionStorage.setItem("portfolio-session-motion", "full"),
  );
  const p = await context.newPage();
  p.on("pageerror", (e) => errors.push(e.message));
  await p.goto(url, { waitUntil: "domcontentloaded" });
  await p.waitForFunction(() => window.__ribbonStory?.ready);
  await p.waitForTimeout(700);
  if (!process.env.HOME_TRANSITIONS_ONLY)
    for (let n = 0; n < 14; n++) {
      await p.evaluate(
        (n) => scrollTo({ top: n * innerWidth, behavior: "instant" }),
        n,
      );
      await p.waitForTimeout(500);
      await p.screenshot({ path: `${out}/scene-${n}.png` });
      const a = await audit(p);
      if (a.hits.length) collisions.push(a);
    }
  if (!quick) {
    if (!process.env.HOME_TRANSITIONS_ONLY)
      for (const [w, h] of [
        [768, 900],
        [1024, 768],
        [1920, 1080],
        [1440, 650],
      ]) {
        await p.setViewportSize({ width: w, height: h });
        for (let n = 0; n < 14; n++) {
          await p.evaluate(
            (n) => scrollTo({ top: n * innerWidth, behavior: "instant" }),
            n,
          );
          await p.waitForTimeout(400);
          const a = await audit(p);
          if (a.hits.length) collisions.push({ width: w, height: h, ...a });
          if (n === 0 || n === 13)
            await p.screenshot({ path: `${out}/${w}x${h}-${n}.png` });
        }
      }
    await p.setViewportSize({ width: 1440, height: 900 });
    for (let n = 0; n <= 130; n++) {
      await p.evaluate(
        (n) => scrollTo({ top: (n * innerWidth) / 10, behavior: "instant" }),
        n,
      );
      await p.waitForTimeout(180);
      const a = await audit(p);
      if (a.hits.length) collisions.push(a);
    }
  }
  const performanceReport = await p.evaluate(() => {
    const summary = (a) => {
      a = a.slice(30).sort((a, b) => a - b);
      return {
        median: a[Math.floor(a.length * 0.5)],
        p95: a[Math.floor(a.length * 0.95)],
      };
    };
    return {
      frameMs: summary(window.__ribbonStory.frames),
      cpuMs: summary(window.__ribbonStory.costs),
    };
  });
  assert.deepEqual(errors, []);
  await writeFile(
    `${out}/results.json`,
    JSON.stringify(
      { errors, collisions, performance: performanceReport },
      null,
      2,
    ),
  );
  console.log(
    JSON.stringify(
      { errors, collisions, performance: performanceReport },
      null,
      2,
    ),
  );
  await context.close();
  assert.deepEqual(
    collisions,
    [],
    "Ribbon and filament must clear visible text, including fixed navigation",
  );
} finally {
  await browser.close();
}
