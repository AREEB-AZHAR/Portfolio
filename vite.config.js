import { defineConfig } from "vite";
import { projects } from "./src/content/projects.mjs";
import { resolve } from "node:path";

export default defineConfig({
  base: "/",
  build: {
    outDir: "dist",
    rolldownOptions: {
      input: [
        "index.html",
        "about/index.html",
        "projects/index.html",
        "capabilities/index.html",
        "contact/index.html",
        ...projects.map((p) => `projects/${p.slug}/index.html`),
      ].map((p) => resolve(import.meta.dirname, p)),
      output: {
        codeSplitting: { groups: [{ name: "sculpture", test: /three/ }] },
      },
    },
  },
});
