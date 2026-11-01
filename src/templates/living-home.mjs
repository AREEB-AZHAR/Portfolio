const esc = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const action = (href, text) =>
  `<a class="ribbon-link" href="${href}">${text}<span aria-hidden="true">↗</span></a>`;
export function livingHome(projects) {
  const scene = (id, name, layout, title, copy, links = "", meta = "") =>
    `<section id="${id}" class="horizontal-panel ribbon-panel ${layout}" data-section="${name}"><p class="ribbon-caption">${name}</p><div class="ribbon-copy"><h2>${title}</h2><p class="ribbon-description">${copy}</p><div class="ribbon-actions">${links}</div></div><div class="ribbon-mobile-space" aria-hidden="true"></div>${meta ? `<p class="ribbon-note">${meta}</p>` : ""}</section>`;
  const opening = `<section class="horizontal-panel ribbon-panel ribbon-opening" data-section="From idea"><p class="ribbon-caption">01 / Engineering, with intention</p><div class="ribbon-copy"><h1>From idea.<br><span>To system.</span><br>To experience.</h1><p class="ribbon-description">Areeb Azhar / Software engineering student.<br>Building the interface—and what’s behind it.</p></div><div class="ribbon-mobile-space" aria-hidden="true"></div><div class="ribbon-opening-actions">${action("#introduction", "Skip to introduction")}${action("@ROOT@projects/", "Explore the work")}</div><p class="ribbon-note">Karachi, PK<br>Available for opportunities</p></section>`;
  const introduction = scene(
    "introduction",
    "02 / Beyond the interface",
    "ribbon-right",
    "Logic underneath.<br><span>Purpose in every</span><br>interaction.",
    "I build across web, mobile, Rust, blockchain, and games. Different technologies. The same intention: make the whole product work, and make it make sense.",
    action("@ROOT@about/", "A way of working"),
  );
  const approach = [
    scene(
      "understand",
      "03 / Understand the system",
      "ribbon-lower-left",
      "Understand<br><span>the system.</span>",
      "Start with the problem, its dependencies, and the people it needs to serve. A clear model makes the next decision easier.",
    ),
    scene(
      "clarify",
      "04 / Clarify the interaction",
      "ribbon-right",
      "Clarify the<br><span>interaction.</span>",
      "Layout, feedback, state, and timing shape how a product is understood. The interface should make the system easier to use.",
    ),
    scene(
      "deliver",
      "05 / Deliver the whole loop",
      "ribbon-upper",
      "Deliver the<br><span>whole loop.</span>",
      "Connect the interface, the data, and the logic. Then check that the complete experience holds together.",
    ),
  ].join("");
  const work = scene(
    "work",
    "06 / Selected work",
    "ribbon-right",
    "Ideas,<br><span>put into practice.</span>",
    "Different problems. Different tools. A few of the things that took shape.",
    action("@ROOT@projects/", "All projects"),
    "06 selected projects / 2026",
  );
  const layouts = [
    "ribbon-left",
    "ribbon-right",
    "ribbon-lower-left",
    "ribbon-left",
    "ribbon-right",
    "ribbon-lower-left",
  ];
  const selected = projects
    .map(
      (p, i) =>
        `<article class="horizontal-panel ribbon-panel ribbon-project ${layouts[i]}" data-section="${esc(p.title)}" data-project="${p.slug}"><p class="ribbon-caption">${String(i + 7).padStart(2, "0")} / ${esc(p.category)}</p><div class="ribbon-copy"><h2 data-project-title="${p.slug}"><a href="@ROOT@projects/${p.slug}/">${esc(p.title)}<span>.</span></a></h2><p class="ribbon-tools">${esc(p.stack.slice(0, 4).join(" / "))}</p><p class="ribbon-description">${esc(p.line)}</p><div class="ribbon-actions">${action(`@ROOT@projects/${p.slug}/`, "Explore project")}</div></div><div class="ribbon-mobile-space" aria-hidden="true"></div></article>`,
    )
    .join("");
  const capabilities = scene(
    "skills",
    "13 / Capabilities",
    "ribbon-right",
    "Many tools.<br><span>One connected</span><br>experience.",
    "From a data model to an interface. From an algorithm to the product around it.",
    action("@ROOT@capabilities/", "Explore capabilities") +
      action("@ROOT@projects/#archive", "The complete archive"),
  );
  return `<section class="horizontal-story ribbon-story" style="--panel-count:14" aria-label="Portfolio story"><div class="horizontal-viewport"><div class="ribbon-atmosphere" aria-hidden="true"><svg class="ribbon-filament"><path/></svg><div class="ribbon-stage"></div></div><div class="horizontal-track">${opening}${introduction}${approach}${work}${selected}${capabilities}<!--STORY_FOOTER--></div></div></section>`;
}
