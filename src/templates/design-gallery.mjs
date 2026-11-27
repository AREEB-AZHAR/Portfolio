const editions = [
  {
    number: "05",
    era: "CURRENT DESIGN / NOVEMBER 2026",
    source: "28fb767",
    title: "A living ribbon",
    description:
      "The latest cinematic portfolio: one continuous filament and sculptural forms carry the story from idea to work.",
    preview: "../portfolio/?preview=1",
    alt: "Current portfolio with a warm metallic filament crossing a dark editorial layout",
    href: "../portfolio/",
    action: "Enter the current design",
    accent: "#f59e0b",
    current: true,
  },
  {
    number: "04",
    era: "CINEMATIC EDITION / OCTOBER 2026",
    source: "f81b386",
    title: "Sculpture in the story",
    description:
      "A spacious, top-to-bottom portfolio built around a metallic AA sculpture, project scenes, and quiet editorial typography.",
    preview: "../designs/cinematic-sculpture/",
    alt: "Earlier cinematic portfolio with a metallic monogram and spacious dark layout",
    href: "../designs/cinematic-sculpture/",
    action: "Open this design",
    accent: "#c084fc",
  },
  {
    number: "03",
    era: "PROJECT SHOWCASE / JULY–OCTOBER 2026",
    source: "a9d3640",
    title: "Ideas, put into practice",
    description:
      "The warm, light project showcase: an animated editorial introduction, featured work, capabilities, and a searchable archive.",
    preview: "../designs/project-showcase/",
    alt: "Warm ivory portfolio with a large editorial headline and project showcase",
    href: "../designs/project-showcase/",
    action: "Open this design",
    accent: "#fb7185",
  },
  {
    number: "02",
    era: "VERSION 2.0 / APRIL 2026",
    source: "425829f",
    title: "Glass, code & systems",
    description:
      "A dark glass-panel interface with floating code windows, ambient neural linework, and a compact engineering dashboard feel.",
    preview: "../designs/glass-systems/",
    alt: "Dark glass-panel portfolio with code windows and neon accents",
    href: "../designs/glass-systems/",
    action: "Open this design",
    accent: "#38bdf8",
  },
  {
    number: "01",
    era: "ORIGINAL EDITION / MARCH 2026",
    source: "16fbb13",
    title: "The first portfolio",
    description:
      "The original neon-accented AI and software portfolio: a custom cursor, technical canvas, and early project stories.",
    preview: "../designs/original-neon/",
    alt: "Original dark portfolio with neon mint accents, a custom cursor, and technical motifs",
    href: "../designs/original-neon/",
    action: "Open this design",
    accent: "#34d399",
  },
];

const cards = editions
  .map(
    (edition) => `<article class="edition${edition.current ? " edition-current" : ""}" style="--ed-accent:${edition.accent}">
      <div class="edition-image">
        <iframe src="${edition.preview}" title="${edition.alt}" aria-hidden="true" tabindex="-1" loading="${edition.current ? "eager" : "lazy"}" width="1440" height="900"></iframe>
        <a class="edition-image-link" href="${edition.href}" aria-label="${edition.action}: ${edition.title}"></a>
        <span class="edition-image-label">${edition.current ? "LATEST" : `EDITION ${edition.number}`}</span>
        <span class="edition-image-arrow" aria-hidden="true">↗</span>
      </div>
      <div class="edition-copy">
        <div class="edition-meta"><span>${edition.number} / 05 · ${edition.source}</span><span>${edition.era}</span></div>
        <h2>${edition.title}</h2>
        <p>${edition.description}</p>
        <a class="edition-action" href="${edition.href}"><span>${edition.action}</span><span aria-hidden="true">↗</span></a>
      </div>
    </article>`,
  )
  .join("\n");

export const designGallery = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#0d0b18">
  <meta name="description" content="Explore five real visual generations of Areeb Azhar’s portfolio, from the original neon engineering site to the living-ribbon redesign.">
  <title>Portfolio editions — Areeb Azhar</title>
  <link rel="icon" href="../mark.svg" type="image/svg+xml">
  <style>
    @font-face{font-family:Manrope;src:url('../fonts/manrope-light.ttf') format('truetype');font-weight:300;font-display:swap}
    @font-face{font-family:Manrope;src:url('../fonts/manrope-regular.ttf') format('truetype');font-weight:400;font-display:swap}
    :root{color-scheme:dark;--bg:#0b0718;--panel:#150f2b;--ink:#faf8ff;--muted:#c7c1de;--quiet:#8d86ad;--rule:rgba(255,255,255,.15);--accent:#ff2e93;--prism:linear-gradient(95deg,#00f5a0 0%,#00e5ff 25%,#a855f7 50%,#ff2e93 75%,#ffd166 100%);font-family:Manrope,Arial,sans-serif;background:var(--bg);color:var(--ink);font-synthesis:none;text-rendering:optimizeLegibility;-webkit-font-smoothing:antialiased}
    *{box-sizing:border-box}html{min-width:320px;background:var(--bg)}body{margin:0;min-height:100vh;background:radial-gradient(ellipse at 10% 6%,rgba(0,229,255,.32) 0,transparent 42rem),radial-gradient(ellipse at 88% 4%,rgba(255,46,147,.34) 0,transparent 44rem),radial-gradient(ellipse at 50% 52%,rgba(139,92,246,.24) 0,transparent 48rem),radial-gradient(ellipse at 18% 92%,rgba(255,183,3,.22) 0,transparent 42rem),var(--bg)}body::before{content:"";display:block;height:4px;width:100%;background:var(--prism)}a{color:inherit;text-decoration:none}.gallery{width:min(1360px,calc(100% - 80px));margin:auto}.masthead{height:82px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--rule);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}.mast-brand{display:flex;align-items:center;gap:15px}.mast-mark{font-size:26px;font-weight:500;letter-spacing:-.12em;background:var(--prism);-webkit-background-clip:text;background-clip:text;color:transparent}.mast-brand small{font-size:10px;line-height:1.6;letter-spacing:.1em}.mast-index{color:#fff;padding:9px 16px;border-radius:999px;border:1px solid rgba(0,229,255,.65);background:linear-gradient(100deg,rgba(0,229,255,.22),rgba(168,85,247,.22),rgba(255,46,147,.22));box-shadow:0 0 24px rgba(255,46,147,.25);transition:border-color .25s,transform .25s,box-shadow .25s}.mast-index:hover{border-color:#ffd166;transform:translateY(-1px);box-shadow:0 0 32px rgba(0,229,255,.38)}.intro{display:grid;grid-template-columns:1fr minmax(260px,430px);gap:32px;align-items:end;padding:90px 0 52px}.kicker,.edition-meta,.edition-image-label,.gallery-foot{font-size:10px;letter-spacing:.11em;text-transform:uppercase;color:var(--muted)}.kicker{background:var(--prism);-webkit-background-clip:text;background-clip:text;color:transparent;font-weight:500}h1{margin:18px 0 0;font-size:clamp(52px,8vw,112px);line-height:.9;letter-spacing:-.075em;font-weight:300}h1 span{background:var(--prism);-webkit-background-clip:text;background-clip:text;color:transparent}.intro-copy{margin:0 0 4px;max-width:390px;color:var(--muted);font-size:14px;line-height:1.8}.intro-copy strong{display:block;margin-top:15px;color:#00f5ff;font-size:11px;font-weight:400;letter-spacing:.04em}.editions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:48px 24px;padding-bottom:86px}.edition{min-width:0}.edition-current{grid-column:1/-1;display:grid;grid-template-columns:minmax(0,1.42fr) minmax(300px,.8fr);gap:30px;align-items:end}.edition-image{position:relative;display:block;aspect-ratio:1.65;background:#140e28;overflow:hidden;border:2px solid color-mix(in srgb,var(--ed-accent,#ff2e93) 65%,rgba(255,255,255,.18));box-shadow:0 16px 42px color-mix(in srgb,var(--ed-accent,#a855f7) 22%,rgba(0,0,0,.5));transition:border-color .3s,transform .45s cubic-bezier(.2,.7,.2,1),box-shadow .3s}.edition-image iframe{position:absolute;left:0;top:0;width:240%;height:240%;border:0;pointer-events:none;transform:scale(.4166667);transform-origin:top left}.edition-image-link{position:absolute;inset:0;z-index:2}.edition-image::after{content:"";position:absolute;inset:42% 0 0;background:linear-gradient(transparent,rgba(11,7,24,.72));pointer-events:none}.edition-image-label{position:absolute;left:16px;top:16px;z-index:3;padding:8px 11px;background:rgba(11,7,24,.90);border:1.5px solid var(--ed-accent,#00f5ff);color:var(--ed-accent,#faf8ff);font-size:9px;box-shadow:0 0 18px color-mix(in srgb,var(--ed-accent,#00f5ff) 40%,transparent)}.edition-image-arrow{position:absolute;z-index:3;right:16px;bottom:14px;font-size:23px;color:var(--ed-accent,#faf8ff);transition:transform .25s}.edition-image:hover,.edition-image:focus-within{border-color:var(--ed-accent,#ff2e93);transform:translateY(-4px);box-shadow:0 22px 56px color-mix(in srgb,var(--ed-accent,#ff2e93) 42%,#0009)}.edition-image:hover iframe,.edition-image:focus-within iframe{filter:saturate(1.12)}.edition-image:hover .edition-image-arrow{transform:translate(3px,-3px)}.edition-copy{padding:15px 2px 0}.edition-current .edition-copy{padding:0 0 3px}.edition-meta{display:flex;justify-content:space-between;gap:16px;padding-bottom:14px;border-bottom:1px solid color-mix(in srgb,var(--ed-accent,#a855f7) 40%,rgba(255,255,255,.12));font-size:9px}.edition-meta span:first-child{color:var(--ed-accent,var(--accent));font-weight:500}.edition h2{margin:16px 0 8px;font-size:clamp(24px,3vw,38px);font-weight:300;letter-spacing:-.055em}.edition p{min-height:48px;margin:0;color:var(--muted);font-size:12px;line-height:1.7}.edition-current h2{font-size:clamp(38px,5.3vw,68px);line-height:.98}.edition-current p{max-width:440px;font-size:14px}.edition-action{display:flex;align-items:center;justify-content:space-between;min-height:50px;margin-top:21px;padding:0 15px;border:1.5px solid color-mix(in srgb,var(--ed-accent,#ff2e93) 65%,rgba(255,255,255,.15));background:linear-gradient(100deg,color-mix(in srgb,var(--ed-accent,#ff2e93) 20%,#150f2b),rgba(21,15,43,.92));color:var(--ink);font-size:11px;letter-spacing:.035em;transition:background .2s,border-color .2s,transform .2s,box-shadow .2s}.edition-action span:last-child{font-size:17px;color:var(--ed-accent,#faf8ff)}.edition-action:hover,.edition-action:focus-visible{background:color-mix(in srgb,var(--ed-accent,#ff2e93) 34%,#150f2b);border-color:var(--ed-accent,#00f5ff);box-shadow:0 10px 30px color-mix(in srgb,var(--ed-accent,#ff2e93) 35%,#0008);transform:translateY(-2px)}a:focus-visible{outline:2px solid var(--accent);outline-offset:4px}.gallery-foot{display:flex;justify-content:space-between;gap:20px;padding:20px 0 26px;border-top:1px solid var(--rule);font-size:9px;line-height:1.7;color:var(--quiet)}.gallery-foot strong{color:var(--muted);font-weight:400}.gallery-foot span:last-child{text-align:right}
    @media(max-width:760px){.gallery{width:calc(100% - 36px)}.masthead{height:68px}.mast-brand{gap:11px}.mast-index{font-size:9px;padding:6px 10px}.intro{grid-template-columns:1fr;gap:23px;padding:64px 0 34px}h1{font-size:clamp(54px,13vw,90px)}.intro-copy{max-width:560px;font-size:13px}.editions{grid-template-columns:1fr;gap:34px;padding-bottom:56px}.edition-current{grid-column:auto;grid-template-columns:1fr;gap:16px}.edition-current .edition-copy{padding:0 2px}.edition-image{aspect-ratio:1.45}.edition-current .edition-image{aspect-ratio:1.45}.edition-meta{font-size:8px}.edition h2{font-size:29px}.edition-current h2{font-size:42px}.edition p{min-height:0}.gallery-foot{flex-direction:column}.gallery-foot span:last-child{text-align:left}}
    @media(max-width:390px){.gallery{width:calc(100% - 28px)}.masthead{font-size:9px}.mast-index{max-width:130px;text-align:right;line-height:1.5}h1{font-size:54px}.edition-meta{align-items:flex-start}.edition-meta span:last-child{text-align:right}.edition-action{min-height:48px}}
    @media(prefers-reduced-motion:reduce){*,*::before,*::after{scroll-behavior:auto!important;transition-duration:.01ms!important;animation-duration:.01ms!important;animation-iteration-count:1!important}}
  </style>
</head>
<body>
  <div class="gallery">
    <header class="masthead"><a class="mast-brand" href="../" aria-label="Return to 3D portfolio gallery"><span class="mast-mark">AA</span><small>AREEB AZHAR<br>SOFTWARE ENGINEERING</small></a><a class="mast-index" href="../">3D Prism Gallery ↗</a></header>
    <main>
      <section class="intro" aria-labelledby="gallery-title"><div><p class="kicker">A visual history / 2026</p><h1 id="gallery-title">Five designs.<br><span>One journey.</span></h1></div><p class="intro-copy">This portfolio has taken a few different shapes as I learned what I wanted it to say. These are the actual designs from that journey—not motion presets. Choose one to open it.<strong>Each edition is a separate, working page.</strong></p></section>
      <section class="editions" aria-label="Portfolio design editions">${cards}</section>
    </main>
    <footer class="gallery-foot"><span><strong>AREEB AZHAR</strong> / SOFTWARE ENGINEERING & CREATIVE DEVELOPMENT</span><span>Historical designs are preserved from the project’s Git history.<br>Choose a version above to continue exploring.</span></footer>
  </div>
</body>
</html>`;
