import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const browser = await chromium.launch({
  headless: true,
  ...(process.env.BROWSER_CHANNEL
    ? { channel: process.env.BROWSER_CHANNEL }
    : {}),
});
try {
  const page = await browser.newPage();
  await page.goto(
    process.argv[2] || "http://localhost:5173/scripts/studio-bake.html",
  );
  await page.waitForFunction(() => typeof window.bakeStudio === "function");
  const result = await page.evaluate(() => window.bakeStudio());
  const header = Buffer.alloc(8);
  header.writeUInt32LE(result.width, 0);
  header.writeUInt32LE(result.height, 4);
  const data = gzipSync(
    Buffer.concat([header, Buffer.from(result.data, "base64")]),
    { level: 9 },
  );
  const directory = new URL("../public/lighting/", import.meta.url);
  await mkdir(directory, { recursive: true });
  await writeFile(new URL("studio.cubeuv.bin.gz", directory), data);
  console.log(
    `Baked original RoomEnvironment: ${result.width}×${result.height}, ${data.length} bytes. Runtime PMREM generation is no longer needed.`,
  );
} finally {
  await browser.close();
}
