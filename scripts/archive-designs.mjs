import { execFileSync } from "node:child_process";
import {
  cp,
  mkdir,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const publicRoot = resolve(root, "public");
const archiveRoot = resolve(publicRoot, "designs");
const stagingRoot = resolve(root, "tmp", "design-archives");
const editions = [
  { slug: "original-neon", commit: "16fbb13", staticOnly: false },
  { slug: "glass-systems", commit: "425829f", staticOnly: false },
  { slug: "project-showcase", commit: "a9d3640", staticOnly: false },
  { slug: "cinematic-sculpture", commit: "f81b386", staticOnly: true },
];

function safeChild(parent, child) {
  const candidate = resolve(parent, child);
  const rel = relative(parent, candidate);
  if (!rel || rel === ".." || rel.startsWith(`..${sep}`) || resolve(candidate) !== candidate)
    throw new Error(`Refusing to write outside the expected folder: ${candidate}`);
  return candidate;
}

function rewriteLocalUrl(url, slug) {
  if (!url || url.startsWith("//") || /^[a-z][a-z\d+.-]*:/i.test(url))
    return url;
  if (url.startsWith("/") && /\.[a-z\d]{2,5}(?:[?#]|$)/i.test(url))
    return `./${url.slice(1)}`;
  if (url.startsWith("/#")) return `./${url.slice(2)}`;
  if (url === "/") return "../../";
  if (/^\/(?:about|projects|capabilities|contact)(?:\/|$)/.test(url))
    return `../../${url.slice(1)}`;
  if (url.startsWith("/")) return `./${url.slice(1)}`;
  if (/^(?:about|projects|capabilities|contact)\//.test(url))
    return `../../${url}`;
  if (url.startsWith("./") || url.startsWith("../") || url.startsWith("#"))
    return url;
  if (/^(?:style\.css|main\.js|images\/|projects\/|fonts\/|certificates\/)/.test(url))
    return `./${url}`;
  return url;
}

const cleanText = (value) =>
  value
    .replace(/\r\n?/g, "\n")
    .replace(/[\t ]+$/gm, "")
    .replace(/\n*$/, "\n");

function historicalRuntime() {
  return `(() => {
  document.documentElement.classList.add("archive-static");
  document.querySelectorAll(".reveal, .reveal-title").forEach((element) => {
    element.classList.add("is-revealed");
  });
  const menuButton = document.querySelector("#menu-toggle, .menu-button");
  const menu = document.querySelector("#mobile-nav, #mobile-menu");
  if (menuButton && menu) {
    menuButton.addEventListener("click", () => {
      const open = menu.hidden || getComputedStyle(menu).display === "none";
      menu.hidden = !open;
      menu.classList.toggle("open", open);
      menuButton.setAttribute("aria-expanded", String(open));
    });
    menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
      menu.hidden = true;
      menuButton.setAttribute("aria-expanded", "false");
    }));
  }
})();`;
}

for (const edition of editions) {
  const stage = safeChild(stagingRoot, edition.slug);
  const destination = safeChild(archiveRoot, edition.slug);
  const tar = safeChild(stagingRoot, `${edition.slug}.tar`);
  await rm(stage, { recursive: true, force: true });
  await mkdir(stage, { recursive: true });
  await mkdir(dirname(destination), { recursive: true });
  const archiveArgs = [
    "archive",
    "--format=tar",
    `--output=${tar}`,
    edition.commit,
    "index.html",
    "main.js",
    "style.css",
    "images",
    "public",
  ];
  execFileSync("git", archiveArgs, { cwd: root, stdio: "inherit" });
  execFileSync("tar", ["-xf", tar, "-C", stage], { cwd: root, stdio: "inherit" });

  await rm(destination, { recursive: true, force: true });
  await mkdir(destination, { recursive: true });
  for (const file of ["index.html", "main.js", "style.css", "images", "public"]) {
    const source = join(stage, file);
    if (file === "public") {
      const publicFiles = await import("node:fs/promises").then(({ readdir }) =>
        readdir(source, { withFileTypes: true }).catch(() => []),
      );
      for (const item of publicFiles)
        await cp(join(source, item.name), join(destination, item.name), {
          recursive: true,
        });
    } else {
      await cp(source, join(destination, file), { recursive: true }).catch(
        (error) => {
          if (error.code !== "ENOENT") throw error;
        },
      );
    }
  }

  const indexPath = join(destination, "index.html");
  let html = await readFile(indexPath, "utf8");
  html = html.replace(
    /\b(href|src)=(['"])\s*([^'"]*)\2/gi,
    (_match, attribute, quote, url) => {
      let rewritten = url.startsWith("/")
        ? rewriteLocalUrl(url, edition.slug)
        : url;
      if (
        attribute.toLowerCase() === "href" &&
        /^\.\/(?:about|projects|capabilities|contact)\//.test(rewritten)
      )
        rewritten = `../../${rewritten.slice(2)}`;
      return `${attribute}=${quote}${rewritten}${quote}`;
    },
  );
  html = html.replace(
    /(<script\s+type="module"\s+src=")\.\/main\.js("\s*><\/script>)/i,
    '<script defer src="./main.js"></script>',
  );
  if (edition.staticOnly) {
    html = html.replace(
      /<script\s+defer\s+src="\.\/main\.js"><\/script>/i,
      `<script>${historicalRuntime()}</script>`,
    );
    html = html.replace(/\breveal-title\b|\breveal\b/g, "");
    html = html.replace(
      /<style>/i,
      '<style>html.archive-static .reveal,html.archive-static .reveal-title{opacity:1!important;transform:none!important;clip-path:none!important}',
    );
  }
  html = html.replace(
    /<\/body>/i,
    `  <a class="portfolio-archive-return" href="../../" aria-label="Return to all portfolio designs">← All portfolio designs</a>
  <style>
    .portfolio-archive-return{position:fixed;z-index:2147483000;right:18px;bottom:18px;display:inline-flex;align-items:center;min-height:42px;padding:0 14px;border:1px solid #8b897d;background:#11120ff2;color:#f0eee7;font:500 11px/1.2 system-ui,sans-serif;letter-spacing:.04em;text-decoration:none;box-shadow:0 5px 24px #0007;backdrop-filter:blur(8px);transition:transform .2s,background .2s,border-color .2s}.portfolio-archive-return:hover,.portfolio-archive-return:focus-visible{transform:translateY(-2px);background:#27271f;border-color:#d0bc8a;outline:2px solid #d0bc8a;outline-offset:3px}@media(max-width:600px){.portfolio-archive-return{right:12px;bottom:12px;min-height:44px}}
  </style>
</body>`,
  );
  await writeFile(indexPath, cleanText(html));

  const cssPath = join(destination, "style.css");
  try {
    let css = await readFile(cssPath, "utf8");
    css = css.replace(/url\((['"]?)\/(?!\/)/g, "url($1./");
    await writeFile(cssPath, cleanText(css));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  const jsPath = join(destination, "main.js");
  try {
    let js = await readFile(jsPath, "utf8");
    if (!edition.staticOnly)
      js = js.replace(
        /(['"])\/(images\/|projects\/|ai-graph\.png|headshot\.png|ui-dashboard\.png|unity-scene\.png)/g,
        "$1./$2",
      );
    else js = historicalRuntime();
    await writeFile(jsPath, cleanText(js));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  console.log(`Archived ${edition.slug} from ${edition.commit}`);
}
