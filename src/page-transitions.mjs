// Serialized into the document head at build time: listeners exist before the
// first reveal, with no render-blocking script request or client-side router.
export function pageTransitions() {
  let active;
  const enabled = () =>
    document.documentElement.classList.contains("motion-full") &&
    !matchMedia("(prefers-reduced-motion:reduce)").matches;
  const slugFor = (url) =>
    new URL(url, location.href).pathname.match(/\/projects\/([^/]+)\/?$/)?.[1];
  function prepare(slug) {
    const title = slug
      ? document.querySelector(`[data-project-title="${CSS.escape(slug)}"]`)
      : null;
    const geometry = title
      ?.closest(".project-scene,.case-hero")
      ?.querySelector(".wire-motif");
    if (title) title.style.viewTransitionName = "story-title";
    if (geometry) geometry.style.viewTransitionName = "story-geometry";
    return () => {
      title?.style.removeProperty("view-transition-name");
      geometry?.style.removeProperty("view-transition-name");
    };
  }
  window.addEventListener("pageswap", (event) => {
    if (!event.viewTransition) return;
    event.viewTransition.ready.catch(() => {});
    if (!enabled()) {
      event.viewTransition.skipTransition();
      return;
    }
    const slug =
      slugFor(event.activation?.entry?.url || location.href) ||
      slugFor(location.href);
    try {
      sessionStorage.setItem("portfolio-transition-slug", slug || "");
    } catch {
      /* Optional. */
    }
    const clean = prepare(slug);
    event.viewTransition.finished.then(clean, clean);
  });
  window.addEventListener("pagereveal", (event) => {
    if (!event.viewTransition) return;
    active = event.viewTransition;
    active.ready.catch(() => {});
    if (!enabled()) {
      active.skipTransition();
      return;
    }
    let slug = slugFor(location.href);
    try {
      slug ||= sessionStorage.getItem("portfolio-transition-slug");
    } catch {
      /* Optional. */
    }
    const clean = prepare(slug);
    document.documentElement.dataset.navigationTransition = "active";
    const finish = () => {
      clean();
      active = null;
      document.documentElement.dataset.navigationTransition = "settled";
    };
    event.viewTransition.finished.then(finish, finish);
  });
  // Visitors can interrupt the cinematic handoff immediately. Refresh itself
  // is not a cross-document View Transition and never gets an entrance gate.
  for (const type of ["wheel", "touchstart", "keydown"])
    window.addEventListener(type, () => active?.skipTransition(), {
      passive: true,
    });
  const warmed = new Set();
  function warm(event) {
    const anchor = event.target.closest?.("a[href]");
    if (!anchor || anchor.target || anchor.download || warmed.size >= 4) return;
    const url = new URL(anchor.href, location.href);
    if (
      url.origin !== location.origin ||
      url.pathname === location.pathname ||
      !url.pathname.endsWith("/") ||
      warmed.has(url.href)
    )
      return;
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = url.href;
    link.as = "document";
    document.head.append(link);
    warmed.add(url.href);
  }
  document.addEventListener("pointerover", warm, { passive: true });
  document.addEventListener("focusin", warm);
}
