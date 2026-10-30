import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const base = (process.argv[2] || "http://127.0.0.1:5181/Portfolio/").replace(
  /\/?$/,
  "/",
);
const output = process.env.SCREENSHOT_DIR || "tmp/continuous-qa";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  ...(process.env.BROWSER_CHANNEL
    ? { channel: process.env.BROWSER_CHANNEL }
    : {}),
});
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(base, { waitUntil: "domcontentloaded" });
  await page.locator("#animation-gate").waitFor({ state: "visible" });
  assert.equal(
    await page.locator("canvas,img").count(),
    0,
    "Landing loads no project images or GPU work before choice",
  );
  await page.screenshot({ path: `${output}/animation-choice.png` });
  await page.locator('[data-motion="full"]').click();
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1200);
  await page
    .locator(".story-atmosphere .has-webgl")
    .waitFor({ state: "visible", timeout: 10000 });
  await page.screenshot({ path: `${output}/horizontal-home.png` });
  const count = await page.locator(".horizontal-panel").count();
  assert.equal(count, 14, "Footer is the final scene");
  assert.equal(
    await page.locator(".story-thread path").count(),
    2,
    "One shared curve rendered as base and travelling highlight",
  );
  assert.equal(
    (await page.locator(".story-thread path").first().getAttribute("d")).match(
      /M/g,
    )?.length,
    1,
    "The pen never lifts between shapes",
  );
  assert.equal(
    await page.locator(".horizontal-panel .wire-motif").count(),
    0,
    "No disconnected scene drawings",
  );
  const strand = page.locator(".story-atmosphere .sculpture");
  assert.equal(
    await strand.getAttribute("data-mesh-count"),
    "1",
    "One opaque morphing mesh",
  );
  await page.evaluate(() => {
    window.originalStoryCanvas = document.querySelector(
      ".story-atmosphere canvas",
    );
  });
  for (const phase of [2, 2.35, 2.65, 3, 4, 8, 11]) {
    await page.evaluate(
      (value) => scrollTo({ top: value * innerWidth, behavior: "instant" }),
      phase,
    );
    await page.waitForFunction(
      (value) =>
        Math.abs(
          Number(
            document.querySelector(".story-atmosphere .sculpture").dataset
              .morphPhase,
          ) - value,
        ) < 0.01,
      phase,
    );
    assert(
      await page.evaluate(
        () =>
          window.originalStoryCanvas ===
          document.querySelector(".story-atmosphere canvas"),
      ),
      "Canvas is never reparented or replaced",
    );
    if (phase === 2.35 || phase === 2.65) {
      assert(
        await strand.getAttribute("data-wire-vertex"),
        "Actual deformed centerline is available",
      );
      await page.screenshot({ path: `${output}/morph-${phase}.png` });
    }
  }
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForTimeout(600);
  assert.equal(
    await page.locator("img").count(),
    0,
    "No project images on homepage",
  );
  const initial = await page
    .locator(".horizontal-track")
    .evaluate(
      (el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).m41,
    );
  await page.mouse.wheel(0, 400);
  await page.waitForFunction(
    (x) =>
      new DOMMatrixReadOnly(
        getComputedStyle(document.querySelector(".horizontal-track")).transform,
      ).m41 <
      x - 50,
    initial,
    { timeout: 1200 },
  );
  const samples = [];
  for (let i = 0; i < 6; i++) {
    samples.push(
      await page
        .locator(".horizontal-track")
        .evaluate(
          (el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).m41,
        ),
    );
    await page.waitForTimeout(35);
  }
  assert(
    samples.every((x, i) => !i || x <= samples[i - 1] + 0.1),
    "Story travels in negative X (right to left)",
  );
  assert(
    new Set(samples.map(Math.round)).size > 1,
    "Track eases through several intermediate frames",
  );
  await page.waitForTimeout(500);
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForFunction(
    () =>
      document.querySelector(".motion-toggle").getAttribute("aria-label") ===
      "Disable animations",
  );
  const start = Date.now();
  await page.mouse.wheel(0, 300);
  await page.waitForFunction(
    () =>
      scrollY > 50 &&
      new DOMMatrixReadOnly(
        getComputedStyle(document.querySelector(".horizontal-track")).transform,
      ).m41 < -35,
    null,
    { timeout: 1200 },
  );
  console.log(
    `Refresh first-wheel response: ${Date.now() - start}ms; right-to-left easing passed.`,
  );
  assert(!(await page.locator("#animation-gate").evaluate((el) => el.open)));
  assert.equal(
    await page.evaluate(
      () => document.documentElement.dataset.navigationTransition || "none",
    ),
    "none",
    "Refresh does not run a page handoff",
  );

  for (const width of process.env.QA_SHORT
    ? [320, 390]
    : process.env.QA_LANDSCAPE
      ? [768, 1024]
      : [320, 390, 768, 1024, 1440]) {
    const viewportHeight = process.env.QA_LANDSCAPE
      ? 600
      : process.env.QA_SHORT
        ? 568
        : width < 768
          ? 844
          : 1000;
    await page.setViewportSize({
      width,
      height: viewportHeight,
    });
    await page.goto(base, { waitUntil: "domcontentloaded" });
    await page.evaluate(() => document.fonts.ready);
    const horizontal = width >= 768;
    await page
      .locator(".story-atmosphere .has-webgl")
      .waitFor({ state: "visible", timeout: 10000 });
    assert.equal(
      await page.evaluate(() =>
        document.documentElement.classList.contains("story-horizontal"),
      ),
      horizontal,
    );
    assert.equal(
      await page
        .locator(".horizontal-track")
        .evaluate((el) => getComputedStyle(el).display),
      horizontal ? "flex" : "contents",
    );
    for (let index = 0; index < count; index++) {
      const panel = page.locator(".horizontal-panel").nth(index);
      if (horizontal) {
        await page.evaluate(
          (i) => scrollTo({ top: i * innerWidth, behavior: "instant" }),
          index,
        );
        await page.waitForFunction(
          (i) =>
            Math.abs(
              document
                .querySelector(`[data-panel-index="${i}"]`)
                .getBoundingClientRect().left,
            ) < 1,
          index,
        );
      } else await panel.scrollIntoViewIfNeeded();
      await page.waitForTimeout(250);
      assert(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
        `Overflow at ${width}px scene ${index}`,
      );
      if (horizontal) {
        const rects = await panel.evaluate((el) =>
          [
            ...el.querySelectorAll(
              "h1,h2,h3,.project-bottom,.principle-copy,.intro-bottom,.bridge-bottom,.hero-foot,.footer-intro,.footer-details,.footer-wordmark,.footer-bottom",
            ),
          ].map((item) => {
            const r = item.getBoundingClientRect();
            return {
              tag: item.className || item.tagName,
              left: r.left,
              right: r.right,
              top: r.top,
              bottom: r.bottom,
            };
          }),
        );
        for (const rect of rects)
          assert(
            rect.left >= -2 &&
              rect.right <= width + 2 &&
              rect.top >= -2 &&
              rect.bottom <= viewportHeight - 45,
            `Clipping ${width}px scene ${index}: ${JSON.stringify(rect)}`,
          );
      }
      if ([2, 6, 11, 13].includes(index))
        await page.screenshot({
          path: `${output}/scene-${index}-${width}.png`,
        });
    }
    assert.equal(
      await page.locator(".footer-wordmark").textContent(),
      "AREEB AZHAR",
    );
    if (horizontal)
      assert(
        Math.abs(
          await page
            .locator(".site-footer")
            .evaluate((el) => el.getBoundingClientRect().top),
        ) < 1,
        "Footer stays in horizontal viewport",
      );
    await page.locator(".menu-toggle").click();
    await page.keyboard.press("Escape");
    assert(!(await page.locator("#site-menu").evaluate((el) => el.open)));
    console.log(
      `${width}px: ${horizontal ? "14 horizontal scenes including footer" : "native vertical mobile flow"} passed.`,
    );
  }

  // Real cross-document clicks, not goto(), exercise shared title/geometry
  // snapshots. Back restores the original story scene rather than starting over.
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(base);
  await page.evaluate(() =>
    scrollTo({ top: 11 * innerWidth, behavior: "instant" }),
  );
  await page.waitForFunction(
    () =>
      Math.abs(
        document
          .querySelector('[data-project="bunetto"]')
          .getBoundingClientRect().left,
      ) < 1,
  );
  await page.locator('[data-project="bunetto"] .project-bottom a').click();
  await page.waitForURL("**/projects/bunetto/");
  await page.waitForFunction(
    () =>
      document.documentElement.dataset.navigationTransition === "active" ||
      document.documentElement.dataset.navigationTransition === "settled",
  );
  await page.waitForFunction(
    () => document.documentElement.dataset.navigationTransition === "settled",
  );
  assert((await page.locator("h1").textContent()).includes("Bunetto"));
  assert(
    (await page.locator(".case-gallery img").count()) > 0,
    "Screenshots remain inside project briefing",
  );
  await page.evaluate(() =>
    scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "instant",
    }),
  );
  await page.waitForFunction(
    () =>
      Math.abs(
        document
          .querySelector(".footer-reel .site-footer")
          .getBoundingClientRect().left,
      ) < 2,
  );
  assert(
    Math.abs(
      await page
        .locator(".footer-reel .site-footer")
        .evaluate((el) => el.getBoundingClientRect().top),
    ) < 2,
    "Supporting-page footer joins the lateral finale",
  );
  await page.screenshot({ path: `${output}/briefing-footer.png` });
  await page.goBack();
  await page.waitForFunction(
    () =>
      Math.abs(
        document
          .querySelector('[data-project="bunetto"]')
          .getBoundingClientRect().left,
      ) < 2,
  );
  await page.waitForTimeout(900);
  await page.locator(".motion-toggle").click();
  assert(
    await page.evaluate(() =>
      document.documentElement.classList.contains("motion-reduced"),
    ),
  );
  await page.reload();
  assert.equal(await page.locator("canvas").count(), 0);
  assert(!(await page.locator("#animation-gate").evaluate((el) => el.open)));
  assert.deepEqual(errors, [], "No browser runtime errors");
  await context.close();

  const touch = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const tp = await touch.newPage();
  await tp.goto(base);
  await tp.locator('[data-motion="full"]').tap();
  const heroTop = await tp
    .locator(".hero-story")
    .evaluate((el) => el.getBoundingClientRect().top);
  const client = await touch.newCDPSession(tp);
  await client.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: 195, y: 650 }],
  });
  for (let y = 620; y >= 200; y -= 30)
    await client.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: 195, y }],
    });
  await client.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await tp.waitForFunction(() => scrollY > 50);
  assert(
    (await tp
      .locator(".hero-story")
      .evaluate((el) => el.getBoundingClientRect().top)) <
      heroTop - 50,
    "Mobile moves bottom to top",
  );
  assert.equal(
    await tp
      .locator(".horizontal-track")
      .evaluate((el) => getComputedStyle(el).transform),
    "none",
  );
  await touch.close();
  console.log(
    "Project handoff, Back, mobile touch, motion persistence and runtime checks passed.",
  );
} finally {
  await browser.close();
}
