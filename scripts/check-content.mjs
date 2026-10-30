import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import { projects, capabilities } from "../src/content/projects.mjs";

const slugs = new Set();
for (const project of projects) {
  assert.match(project.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  assert(!slugs.has(project.slug), `Duplicate route: ${project.slug}`);
  slugs.add(project.slug);
  for (const key of [
    "title",
    "summary",
    "challenge",
    "built",
    "decisions",
    "outcome",
    "role",
    "type",
    "category",
  ])
    assert(project[key]?.trim(), `${project.slug} is missing ${key}`);
  assert(project.flow.length >= 2, `Missing product flow: ${project.slug}`);
  assert(project.stack.length, `Missing stack: ${project.slug}`);
  for (const url of [
    project.repo,
    project.live,
    ...(project.sections || []).map((s) => s.repo),
  ].filter(Boolean))
    assert.equal(new URL(url).protocol, "https:");
  if (project.image)
    await access(
      new URL(
        `../${project.image.startsWith("images/") ? "" : "public/"}${project.image}`,
        import.meta.url,
      ),
    );
  await access(
    new URL(`../projects/${project.slug}/index.html`, import.meta.url),
  );
  const ids = (project.sections || []).map((s) => s.id);
  assert.equal(
    ids.length,
    new Set(ids).size,
    `Duplicate section anchors: ${project.slug}`,
  );
}
for (const capability of capabilities)
  for (const slug of capability[3])
    assert(slugs.has(slug), `Unknown related project ${slug}`);
for (const asset of [
  "certificates/rust-internship-areeb-azhar.pdf",
  "certificates/rust-internship-preview.png",
  "fonts/manrope-light.ttf",
  "fonts/manrope-regular.ttf",
  "fonts/manrope-medium.ttf",
  "lighting/studio.cubeuv.bin.gz",
])
  await access(new URL(`../public/${asset}`, import.meta.url));
assert.equal(projects.filter((p) => p.featured).length, 6);
console.log(
  `Content checks passed: ${projects.length} canonical project routes, 6 featured projects, all local media and related links.`,
);
