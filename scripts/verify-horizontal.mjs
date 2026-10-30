import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const base = (process.argv[2] || "http://127.0.0.1:5181/Portfolio/").replace(
  /\/?$/,
  "/",
);
const output = process.env.SCREENSHOT_DIR || "tmp/horizontal-qa";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  ...(process.env.BROWSER_CHANNEL
    ? { channel: process.env.BROWSER_CHANNEL }
    : {}),
});
const errors = [];
try {
  const context = await browser.newContext();
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(base, { waitUntil: "domcontentloaded" });
  await page.locator("#animation-gate").waitFor({ state: "visible" });
  assert.equal(
    await page.locator("canvas").count(),
    0,
    "No GPU setup before consent",
  );
  await page.screenshot({ path: `${output}/animation-choice.png` });
  await page.locator('[data-motion="full"]').click();
  await page.waitForFunction(() =>
    document.documentElement.classList.contains("motion-full"),
  );
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${output}/horizontal-home.png` });
  const before = await page
    .locator(".horizontal-track")
    .evaluate(
      (el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).m41,
    );
  await page.mouse.wheel(0, 400);
  await page.waitForFunction(
    (x) =>
      new DOMMatrixReadOnly(
        getComputedStyle(document.querySelector(".horizontal-track")).transform,
      ).m41 >
      x + 100,
    before,
  );
  assert(
    Math.abs(
      await page
        .locator(".horizontal-viewport")
        .evaluate((el) => el.getBoundingClientRect().top),
    ) < 1,
    "Viewport stays fixed while story moves right",
  );
  console.log("Real wheel input moves story left-to-right.");

  // A refresh must retain layout before the first paint, without a consent
  // replay, smooth-wheel ramp, or GPU work blocking the first wheel event.
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForFunction(
    () =>
      document.querySelector(".motion-toggle").getAttribute("aria-label") ===
      "Disable animations",
  );
  assert(!(await page.locator("#animation-gate").evaluate((el) => el.open)));
  const start = Date.now();
  await page.mouse.wheel(0, 300);
  await page.waitForFunction(
    () =>
      scrollY > 50 &&
      new DOMMatrixReadOnly(
        getComputedStyle(document.querySelector(".horizontal-track")).transform,
      ).m41 >
        -12 * innerWidth + 50,
    null,
    { timeout: 2000 },
  );
  console.log(
    `Refresh → first wheel visible response: ${Date.now() - start} ms`,
  );
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await page.locator('a[href="#introduction"]').click();
  await page.waitForFunction(
    () =>
      Math.abs(
        document.querySelector("#introduction").getBoundingClientRect().left,
      ) < 2,
  );
  await page.keyboard.press("ArrowRight");
  await page.waitForFunction(
    () => document.querySelector(".is-current")?.dataset.panelIndex === "2",
  );

  for (const width of process.env.QA_SHORT
    ? [320, 390]
    : [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({
      width,
      height: process.env.QA_SHORT ? 568 : width < 768 ? 844 : 1000,
    });
    await page.goto(base, { waitUntil: "domcontentloaded" });
    await page.evaluate(() => document.fonts.ready);
    const panels = page.locator(".horizontal-panel");
    assert.equal(await panels.count(), 13);
    for (let index = 0; index < 13; index++) {
      await page.evaluate(
        (i) => scrollTo({ top: i * innerWidth, behavior: "instant" }),
        index,
      );
      await page.waitForFunction(
        (i) =>
          document
            .querySelector(`.horizontal-panel[data-panel-index="${i}"]`)
            ?.classList.contains("is-current"),
        index,
      );
      await page.waitForTimeout(850);
      const rects = await panels.nth(index).evaluate((el) => {
        const panel = el.getBoundingClientRect();
        return [
          ...el.querySelectorAll(
            "h1,h2,h3,.project-bottom,.principle-copy,.intro-bottom,.bridge-bottom,.hero-foot,.scene-kicker",
          ),
        ].map((item) => {
          const rect = item.getBoundingClientRect();
          return {
            tag: item.className || item.tagName,
            top: rect.top - panel.top,
            bottom: rect.bottom - panel.top,
            left: rect.left - panel.left,
            right: rect.right - panel.left,
            height: panel.height,
          };
        });
      });
      for (const rect of rects) {
        assert(
          rect.left >= -2 && rect.right <= width + 2,
          `Clipped horizontally ${width}px panel ${index}: ${JSON.stringify(rect)}`,
        );
        assert(
          rect.top >= -1 && rect.bottom <= rect.height - 45,
          `Clipped vertically ${width}px panel ${index}: ${JSON.stringify(rect)}`,
        );
      }
      if ([0, 2, 6, 8, 11, 12].includes(index)) {
        if (index >= 6 && index <= 11)
          await panels
            .nth(index)
            .locator("img")
            .evaluate((img) => img.decode());
        await page.screenshot({
          path: `${output}/panel-${index}-${width}.png`,
        });
      }
    }
    assert(await page.locator(".motion-label").isVisible());
    await page.locator(".motion-toggle").focus();
    assert(await page.locator("#motion-help").isVisible());
    await page.locator(".menu-toggle").click();
    await page.keyboard.press("Escape");
    assert(!(await page.locator("#site-menu").evaluate((el) => el.open)));
    await page.evaluate(() =>
      scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "instant",
      }),
    );
    const wordmark = page.locator(".footer-wordmark");
    assert.equal(await wordmark.textContent(), "AREEB AZHAR");
    assert(
      await wordmark.evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
    );
    console.log(
      `All 13 panels, menu, control label, and footer passed: ${width}px`,
    );
  }
  await page.evaluate(() =>
    scrollTo({ top: 6 * innerWidth, behavior: "instant" }),
  );
  await page.waitForTimeout(100);
  await page.locator(".motion-toggle").click();
  assert(
    await page.evaluate(() =>
      document.documentElement.classList.contains("motion-reduced"),
    ),
  );
  await page.reload({ waitUntil: "domcontentloaded" });
  assert(!(await page.locator("#animation-gate").evaluate((el) => el.open)));
  assert.equal(await page.locator("canvas").count(), 0);
  await page.locator(".motion-toggle").click();
  await page.waitForTimeout(100);
  assert(
    await page.evaluate(() =>
      document.documentElement.classList.contains("motion-full"),
    ),
  );
  await page.locator(".project-image-link").last().focus();
  await page.waitForFunction(
    () => document.querySelector(".is-current")?.dataset.panelIndex === "11",
  );
  await page.evaluate(() =>
    scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "instant",
    }),
  );
  const footerTop = await page
    .locator(".footer-wordmark")
    .evaluate((el) => el.getBoundingClientRect().top);
  await page.locator(".motion-toggle").click();
  assert(
    Math.abs(
      (await page
        .locator(".footer-wordmark")
        .evaluate((el) => el.getBoundingClientRect().top)) - footerTop,
    ) < 3,
    "Mode change preserves footer position",
  );
  assert.deepEqual(errors, []);
  await context.close();
  const quiet = await browser.newContext({ reducedMotion: "reduce" });
  const quietPage = await quiet.newPage();
  await quietPage.goto(base);
  assert(
    await quietPage
      .locator('[data-motion="reduced"] small')
      .textContent()
      .then((text) => text.includes("Recommended")),
  );
  await quietPage.keyboard.press("Escape");
  assert(
    await quietPage.evaluate(() =>
      document.documentElement.classList.contains("motion-reduced"),
    ),
  );
  assert.equal(await quietPage.locator("canvas").count(), 0);
  await quiet.close();
  const touch = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const touchPage = await touch.newPage();
  await touchPage.goto(base);
  await touchPage.locator('[data-motion="full"]').tap();
  const client = await touch.newCDPSession(touchPage);
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
  await touchPage.waitForFunction(() => scrollY > 50);
  assert(
    await touchPage
      .locator(".horizontal-track")
      .evaluate(
        (el) =>
          new DOMMatrixReadOnly(getComputedStyle(el).transform).m41 >
          -12 * innerWidth + 50,
      ),
  );
  await touch.close();
  console.log(
    "Consent, anchor/keyboard navigation, refresh, toggling, reduced motion, and runtime checks passed.",
  );
} finally {
  await browser.close();
}
