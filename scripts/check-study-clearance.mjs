import { createRequire } from "node:module";
import assert from "node:assert/strict";
const { chromium } = createRequire(import.meta.url)(
  process.env.PLAYWRIGHT_MODULE || "playwright",
);
const browser = await chromium.launch({ headless: true, channel: "msedge" });
try {
  const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto("http://127.0.0.1:5184/motion-study/", {
    waitUntil: "domcontentloaded",
  });
  await p.waitForFunction(() => window.__motionStudy?.ready);
  const hits = [];
  for (let step = 0; step <= 60; step++) {
    await p.evaluate(
      (n) => scrollTo({ top: n * innerWidth, behavior: "instant" }),
      step / 20,
    );
    await p.waitForTimeout(150);
    const collisions = await p.evaluate(() => {
      const path = document.querySelector(".filament path"),
        length = path.getTotalLength(),
        hits = [];
      document.querySelectorAll(".chapter").forEach((panel) => {
        if (Number(getComputedStyle(panel).opacity) < 0.25) return;
        panel
          .querySelectorAll(
            "h1,h2,.description,.scene-caption,.scene-note,.skip",
          )
          .forEach((el) => {
            const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
            while (walker.nextNode()) {
              const range = document.createRange();
              range.selectNodeContents(walker.currentNode);
              for (const r of range.getClientRects())
                for (let i = 0; i <= 400; i++) {
                  const q = path.getPointAtLength((length * i) / 400);
                  if (
                    q.x >= r.left - 3 &&
                    q.x <= r.right + 3 &&
                    q.y >= r.top - 3 &&
                    q.y <= r.bottom + 3
                  ) {
                    hits.push({
                      text: el.textContent.trim().slice(0, 40),
                      phase: window.__motionStudy.phase,
                      x: q.x,
                      y: q.y,
                    });
                    break;
                  }
                }
            }
          });
      });
      return hits;
    });
    hits.push(...collisions);
  }
  console.log(JSON.stringify(hits, null, 2));
  assert.equal(hits.length, 0);
} finally {
  await browser.close();
}
