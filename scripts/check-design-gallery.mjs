import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFile(resolve(root, path), "utf8");
const gallery = await read("index.html");
const currentHome = await read("portfolio/index.html");
const manifest = await read("src/templates/design-gallery.mjs");
const archiveBuilder = await read("scripts/archive-designs.mjs");
const entries = [
  ["living-ribbon", "portfolio/index.html", "./portfolio/"],
  [
    "cinematic-sculpture",
    "public/designs/cinematic-sculpture/index.html",
    "./designs/cinematic-sculpture/",
  ],
  [
    "project-showcase",
    "public/designs/project-showcase/index.html",
    "./designs/project-showcase/",
  ],
  [
    "glass-systems",
    "public/designs/glass-systems/index.html",
    "./designs/glass-systems/",
  ],
  [
    "original-neon",
    "public/designs/original-neon/index.html",
    "./designs/original-neon/",
  ],
];

assert.equal((gallery.match(/class="edition(?: edition-current)?"/g) || []).length, 5);
assert.equal((gallery.match(/class="edition-action"/g) || []).length, 5);
assert.match(gallery, /These are the actual designs from that journey—not motion presets/);
assert.match(currentHome, /id="animation-gate"/);
assert.match(await read("main.js"), /embeddedPreview/);
assert.match(archiveBuilder, /16fbb13/);
assert.match(archiveBuilder, /425829f/);
assert.match(archiveBuilder, /a9d3640/);
assert.match(archiveBuilder, /f81b386/);

for (const [slug, file, href] of entries) {
  await access(resolve(root, file));
  assert(manifest.includes(slug), `Gallery metadata is missing ${slug}`);
  assert(gallery.includes(`href="${href}"`), `Gallery has no action for ${slug}`);
  assert(gallery.includes(`src="${slug === "living-ribbon" ? "./portfolio/?preview=1" : href}"`), `Gallery preview missing for ${slug}`);
  if (slug === "living-ribbon") continue;
  const page = await read(file);
  const base = resolve(root, `public/designs/${slug}`);
  const backLink = page.match(/class="portfolio-archive-return" href="([^"]+)"/);
  assert(backLink, `${slug} is missing its return-to-gallery action`);
  assert.equal(backLink[1], "../../");
  await access(resolve(base, "style.css"));
  if (slug !== "cinematic-sculpture") await access(resolve(base, "main.js"));
  assert(!/<script\s+type="module"\s+src="\/main\.js"/.test(page), `${slug} has a broken root module path`);

  for (const [, _quote, raw] of page.matchAll(/\b(?:href|src)=(['"])(.*?)\1/gi)) {
    if (!raw || raw.startsWith("#") || raw.startsWith("//") || /^[a-z][a-z\d+.-]*:/i.test(raw)) continue;
    const pathname = raw.split(/[?#]/, 1)[0];
    if (!pathname) continue;
    const target = resolve(base, pathname);
    if (pathname.startsWith("../../")) {
      const relativeRoute = pathname.slice(6);
      const canonical = relativeRoute
        ? resolve(root, relativeRoute, "index.html")
        : resolve(root, "index.html");
      assert(canonical.startsWith(root), `${slug} escapes the portfolio root: ${raw}`);
      if (await access(canonical).then(() => true, () => false)) continue;
      if (relativeRoute)
        assert.fail(`${slug} has a missing canonical route: ${raw}`);
      continue;
    }
    if (pathname.startsWith("./") || !pathname.startsWith("/")) {
      try {
        await access(target);
      } catch {
        assert.match(pathname, /^\.\/?(?:#|$)/, `${slug} has a missing local resource: ${raw}`);
      }
    }
  }
}

const snapshotBytes = await Promise.all(
  entries.slice(1).map(async ([, file]) => (await stat(resolve(root, file))).size),
);
assert(snapshotBytes.every((bytes) => bytes > 5000), "Expected real historical HTML snapshots");
console.log("Design gallery checks passed: five distinct choices, four history-backed pages, previews, back-links, and local assets.");
