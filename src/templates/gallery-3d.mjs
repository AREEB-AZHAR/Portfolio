export const gallery3d = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>Areeb Azhar — 3D Portfolio Archive Gallery</title>
  <meta name="description" content="Walk through five real visual generations and canonical engineering projects inside Areeb Azhar's interactive 3D architectural portfolio archive gallery." />
  <meta name="theme-color" content="#07080c" />
  <link rel="icon" href="./mark.svg" type="image/svg+xml" />
  <script src="https://cdn.tailwindcss.com/3.4.17"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script src="https://unpkg.com/lucide@0.460.0/dist/umd/lucide.min.js"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
  <style>
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #07080c;
      color: #f3f1ec;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      user-select: none;
      -webkit-user-select: none;
      overscroll-behavior: none;
    }
    .font-serif-display { font-family: 'Cormorant Garamond', Georgia, serif; }
    .font-mono-tech { font-family: 'JetBrains Mono', monospace; }

    #canvas-container {
      position: fixed;
      inset: 0;
      width: 100%;
      height: 100%;
      z-index: 1;
      cursor: grab;
      touch-action: none;
    }
    #canvas-container.dragging { cursor: grabbing; }
    #canvas-container.hover-exhibit { cursor: pointer; }
    #canvas-container.locked-look { cursor: none; }

    /* Subtle cinematic vignette & film grain */
    .cinema-vignette {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 5;
      background: radial-gradient(circle at 50% 48%, transparent 48%, rgba(4, 5, 10, 0.72) 100%);
    }
    .cinema-grain {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 6;
      opacity: 0.035;
      background-image: radial-gradient(rgba(255,255,255,0.6) 1px, transparent 0);
      background-size: 3px 3px;
    }

    /* Cinema letterbox bars */
    .letterbox-bar {
      position: fixed;
      left: 0;
      right: 0;
      height: 0;
      background: #040508;
      z-index: 15;
      pointer-events: none;
      transition: height 0.55s cubic-bezier(0.22, 1, 0.36, 1);
    }
    .letterbox-top { top: 0; }
    .letterbox-bottom { bottom: 0; }
    body.cinema-bars .letterbox-bar { height: 40px; }
    @media (max-width: 640px) {
      body.cinema-bars .letterbox-bar { height: 22px; }
    }

    /* Glassmorphism panels */
    .glass-panel {
      background: rgba(11, 13, 20, 0.72);
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
      border: 1px solid rgba(255, 255, 255, 0.11);
    }
    .glass-pill {
      background: rgba(12, 14, 22, 0.65);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.12);
    }

    /* Crosshair reticle */
    #reticle {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 10px;
      height: 10px;
      border-radius: 9999px;
      border: 1.5px solid rgba(255, 255, 255, 0.45);
      pointer-events: none;
      z-index: 12;
      transition: transform 0.2s ease, border-color 0.2s ease, background-color 0.2s ease;
    }
    body.pointer-locked #reticle {
      border-color: rgba(240, 201, 125, 0.78);
    }
    #reticle.active {
      transform: translate(-50%, -50%) scale(1.85);
      border-color: #f0c97d;
      background-color: rgba(240, 201, 125, 0.22);
    }

    /* Scrollbar inside preview modal */
    .custom-scroll {
      -webkit-overflow-scrolling: touch;
    }
    .custom-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
    .custom-scroll::-webkit-scrollbar-track { background: rgba(255,255,255,0.03); }
    .custom-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.18); border-radius: 9999px; }

    /* Clickable preview cards inside modal (desktop + mobile touch friendly) */
    .preview-card-link {
      display: block;
      text-decoration: none;
      color: inherit;
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
      transition: transform 0.2s ease, border-color 0.2s ease, background-color 0.2s ease, filter 0.2s ease;
    }
    .preview-card-link:hover {
      transform: translateY(-2px);
      filter: brightness(1.08);
    }
    .preview-card-link:active {
      transform: scale(0.985);
    }

    /* Splash transition */
    #splash-overlay {
      will-change: opacity;
      transition: opacity 0.42s cubic-bezier(0.22, 1, 0.36, 1), visibility 0.42s ease;
    }
    #splash-overlay.hidden-splash {
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
    }

    /* Modal animation */
    #inspector-modal {
      will-change: opacity;
      transition: opacity 0.25s ease, visibility 0.25s ease;
    }
    #inspector-modal.modal-closed {
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
    }
    #inspector-card {
      will-change: transform;
      background: rgba(11, 13, 20, 0.94);
      border: 1px solid rgba(255, 255, 255, 0.13);
      transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);
    }
    #inspector-modal.modal-closed #inspector-card {
      transform: translateY(20px) scale(0.97);
    }

    /* Touch D-pad buttons */
    .dpad-btn {
      touch-action: none;
      -webkit-tap-highlight-color: transparent;
    }
    .dpad-btn:active, .dpad-btn.pressed {
      background: rgba(240, 201, 125, 0.28);
      border-color: rgba(240, 201, 125, 0.7);
      color: #f0c97d;
    }

    @keyframes pulseSoft {
      0%, 100% { opacity: 0.55; }
      50% { opacity: 1; }
    }
    .animate-pulse-soft { animation: pulseSoft 2.4s ease-in-out infinite; }
  </style>
</head>
<body class="cinema-bars">
  <!-- 3D WebGL Canvas -->
  <div id="canvas-container" aria-label="Interactive 3D Portfolio Gallery"></div>

  <!-- Cinematic overlays -->
  <div class="cinema-vignette"></div>
  <div class="cinema-grain"></div>
  <div class="letterbox-bar letterbox-top"></div>
  <div class="letterbox-bar letterbox-bottom"></div>

  <!-- Center Reticle (hidden during splash & modal) -->
  <div id="reticle" class="hidden"></div>

  <!-- =========================================================
       SPLASH OVERLAY (Cinematic Movie Opening over Live 3D Scene)
       ========================================================= -->
  <div id="splash-overlay" class="fixed inset-0 z-40 flex flex-col items-center justify-center px-6 text-center bg-gradient-to-b from-black/55 via-black/25 to-black/75 overflow-y-auto custom-scroll">
    <div class="max-w-2xl mx-auto flex flex-col items-center py-8">
      <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-pill text-[11px] font-mono-tech tracking-[0.22em] uppercase text-amber-200/90 mb-6">
        <span class="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse-soft"></span>
        Interactive 3D Exhibition · Five Designs + Archive
      </div>

      <h1 class="font-serif-display text-5xl sm:text-7xl font-medium tracking-tight text-white leading-[0.96] drop-shadow-2xl">
        Areeb Azhar
      </h1>
      <p class="mt-3 text-xs sm:text-sm font-mono-tech tracking-[0.28em] uppercase text-amber-200/80">
        The Portfolio Archive
      </p>

      <p class="mt-5 max-w-lg text-sm sm:text-base text-slate-200/85 leading-relaxed font-light">
        Walk through real generations of interface craft, engineering experiments, and visual identity inside a living architectural gallery. Move your mouse to look freely around the hall, or click any monolith to inspect and enter that edition.
      </p>

      <div class="mt-8 flex flex-wrap items-center justify-center gap-3.5">
        <button id="btn-enter-gallery" class="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-amber-200 text-slate-950 font-semibold text-sm tracking-wide hover:bg-amber-100 transition-all shadow-[0_0_35px_rgba(240,201,125,0.35)]">
          <span>Enter Gallery</span>
          <i data-lucide="arrow-right" class="w-4 h-4 transition-transform group-hover:translate-x-0.5"></i>
        </button>

        <button id="btn-start-tour" class="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full glass-panel text-slate-100 hover:text-amber-200 hover:border-amber-200/40 font-medium text-sm tracking-wide transition-all">
          <i data-lucide="film" class="w-4 h-4 text-amber-200"></i>
          <span>Cinematic Auto-Tour</span>
        </button>
      </div>

      <div class="mt-5 flex flex-wrap items-center justify-center gap-4">
        <a href="./portfolio/" class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-mono-tech tracking-wider uppercase text-amber-200/90 hover:text-amber-100 transition-colors">
          <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
          <span>Latest Portfolio</span>
          <i data-lucide="arrow-up-right" class="w-3.5 h-3.5"></i>
        </a>
        <a href="./editions/" class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-mono-tech tracking-wider uppercase text-slate-300/85 hover:text-amber-200 transition-colors">
          <i data-lucide="layout-grid" class="w-3.5 h-3.5"></i>
          <span>2D Editions Index</span>
          <i data-lucide="arrow-up-right" class="w-3.5 h-3.5"></i>
        </a>
      </div>

      <div class="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] font-mono-tech text-slate-300/75">
        <span class="inline-flex items-center gap-1.5"><kbd class="px-1.5 py-0.5 rounded bg-white/10 border border-white/15 text-white">WASD / D-Pad</kbd> Walk</span>
        <span class="inline-flex items-center gap-1.5"><kbd class="px-1.5 py-0.5 rounded bg-white/10 border border-white/15 text-white">Mouse / Drag</kbd> Look Around</span>
        <span class="inline-flex items-center gap-1.5"><kbd class="px-1.5 py-0.5 rounded bg-white/10 border border-white/15 text-white">Click / E</kbd> Select Edition</span>
        <span class="inline-flex items-center gap-1.5"><kbd class="px-1.5 py-0.5 rounded bg-white/10 border border-white/15 text-white">Esc</kbd> Free Cursor</span>
      </div>
    </div>
  </div>

  <!-- =========================================================
       TOP HUD BAR
       ========================================================= -->
  <header id="hud-top" class="fixed top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 z-20 flex items-center justify-between gap-2 pointer-events-none opacity-0 transition-opacity duration-500">
    <!-- Brand & Scene Info -->
    <div class="pointer-events-auto flex items-center gap-2.5 sm:gap-3 px-3 sm:px-3.5 py-2 rounded-full glass-pill shrink-0">
      <button id="btn-back-splash" class="flex items-center gap-2 text-left group" title="Return to Title Screen">
        <span class="w-2 h-2 rounded-full bg-amber-300 group-hover:scale-125 transition-transform"></span>
        <span class="font-serif-display text-base sm:text-lg leading-none text-white tracking-wide">Areeb Azhar</span>
        <span class="hidden sm:inline text-[10px] font-mono-tech uppercase tracking-[0.2em] text-slate-400 border-l border-white/15 pl-2.5">Archive Hall</span>
      </button>
    </div>

    <!-- Action Controls -->
    <div class="pointer-events-auto flex items-center gap-1 sm:gap-2">
      <button id="btn-mouse-lock" class="hidden sm:inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-full glass-pill text-xs font-medium text-slate-200 hover:text-amber-200 hover:border-amber-200/40 transition-colors" title="Bind mouse cursor to 3D camera (Esc to unlock)">
        <i data-lucide="crosshair" class="w-3.5 h-3.5"></i>
        <span class="hidden md:inline" id="label-mouse-lock">Lock Mouse</span>
      </button>

      <a href="./editions/" class="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-full glass-pill text-xs font-medium text-slate-200 hover:text-amber-200 hover:border-amber-200/40 transition-colors" title="Switch to 2D Five-Editions Index">
        <i data-lucide="layout-grid" class="w-3.5 h-3.5"></i>
        <span class="hidden sm:inline">2D Editions</span>
      </a>

      <button id="btn-toggle-tour" class="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-full glass-pill text-xs font-medium text-slate-200 hover:text-amber-200 hover:border-amber-200/40 transition-colors" title="Toggle Cinematic Auto-Tour">
        <span id="icon-tour" class="inline-flex"><span id="icon-tour-play" class="inline-flex"><i data-lucide="play" class="w-3.5 h-3.5"></i></span><span id="icon-tour-pause" class="hidden"><i data-lucide="pause" class="w-3.5 h-3.5"></i></span></span>
        <span class="hidden md:inline" id="label-tour">Auto-Tour</span>
      </button>

      <button id="btn-toggle-cinema" class="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-full glass-pill text-xs font-medium text-amber-200 border-amber-200/35 hover:border-amber-200/60 transition-colors" title="Toggle Cinema Letterbox">
        <i data-lucide="clapperboard" class="w-3.5 h-3.5"></i>
        <span class="hidden lg:inline">Cinema</span>
      </button>

      <button id="btn-toggle-audio" class="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-full glass-pill text-xs font-medium text-slate-300 hover:text-white transition-colors" title="Toggle Ambient Gallery Sound">
        <span id="icon-audio" class="inline-flex"><span id="icon-audio-off" class="inline-flex"><i data-lucide="volume-x" class="w-3.5 h-3.5"></i></span><span id="icon-audio-on" class="hidden"><i data-lucide="volume-2" class="w-3.5 h-3.5"></i></span></span>
        <span class="hidden lg:inline" id="label-audio">Sound Off</span>
      </button>

      <button id="btn-toggle-help" class="inline-flex items-center justify-center w-9 h-9 rounded-full glass-pill text-slate-300 hover:text-amber-200 transition-colors" title="Controls & Info" aria-label="Controls & Info">
        <i data-lucide="compass" class="w-4 h-4"></i>
      </button>
    </div>
  </header>

  <!-- =========================================================
       PROXIMITY / HOVER EXHIBIT PROMPT
       ========================================================= -->
  <div id="exhibit-prompt" class="fixed left-1/2 -translate-x-1/2 bottom-28 sm:bottom-24 z-20 pointer-events-auto opacity-0 translate-y-2 transition-all duration-300 hidden max-w-[92vw]">
    <button id="btn-prompt-inspect" class="flex items-center gap-2.5 sm:gap-3 px-4 py-2.5 rounded-full glass-panel border-amber-200/40 shadow-[0_12px_40px_rgba(0,0,0,0.65)] hover:bg-amber-200/15 transition-all">
      <span id="prompt-badge" class="px-2 py-0.5 rounded-full bg-amber-200/20 text-amber-200 font-mono-tech text-[10px] uppercase tracking-wider shrink-0">01</span>
      <span id="prompt-title" class="text-xs sm:text-sm font-medium text-white truncate">The First Portfolio (2026)</span>
      <span class="inline-flex items-center gap-1 text-[10px] font-mono-tech text-amber-200/90 border-l border-white/15 pl-2.5 shrink-0">
        <kbd class="hidden sm:inline px-1.5 py-0.5 rounded bg-white/10 text-white">Click / E</kbd> Inspect
      </span>
    </button>
  </div>

  <!-- =========================================================
       BOTTOM EXHIBITION NAVIGATION DOCK + MINIMAP
       ========================================================= -->
  <nav id="hud-bottom" class="fixed bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 z-20 flex items-end justify-between gap-2.5 sm:gap-3 pointer-events-none opacity-0 transition-opacity duration-500">
    <!-- Left: Touch / Mobile Movement D-Pad (also clickable on desktop) -->
    <div id="mobile-dpad" class="pointer-events-auto flex flex-col items-center gap-1 shrink-0">
      <button data-move="forward" class="dpad-btn w-10 h-10 sm:w-9 sm:h-9 rounded-lg glass-pill flex items-center justify-center text-slate-300" aria-label="Walk Forward">
        <i data-lucide="chevron-up" class="w-4 h-4"></i>
      </button>
      <div class="flex items-center gap-1">
        <button data-move="left" class="dpad-btn w-10 h-10 sm:w-9 sm:h-9 rounded-lg glass-pill flex items-center justify-center text-slate-300" aria-label="Strafe Left">
          <i data-lucide="chevron-left" class="w-4 h-4"></i>
        </button>
        <button data-move="backward" class="dpad-btn w-10 h-10 sm:w-9 sm:h-9 rounded-lg glass-pill flex items-center justify-center text-slate-300" aria-label="Walk Backward">
          <i data-lucide="chevron-down" class="w-4 h-4"></i>
        </button>
        <button data-move="right" class="dpad-btn w-10 h-10 sm:w-9 sm:h-9 rounded-lg glass-pill flex items-center justify-center text-slate-300" aria-label="Strafe Right">
          <i data-lucide="chevron-right" class="w-4 h-4"></i>
        </button>
      </div>
    </div>

    <!-- Center: Edition Quick-Jump Dock -->
    <div class="pointer-events-auto min-w-0 max-w-full overflow-x-auto custom-scroll">
      <div id="edition-dock" class="flex items-center gap-1 sm:gap-1.5 p-1.5 rounded-full glass-panel w-max">
        <!-- Populated dynamically -->
      </div>
    </div>

    <!-- Right: Live Top-Down Gallery Radar -->
    <div class="pointer-events-auto hidden sm:flex flex-col items-center p-2 rounded-2xl glass-panel shrink-0" title="Gallery Floorplan Radar">
      <canvas id="minimap-canvas" width="96" height="120" class="rounded-lg"></canvas>
      <span id="radar-coords" class="mt-1 text-[9px] font-mono-tech text-slate-400 tracking-wider">HALL · ENTRANCE</span>
    </div>
  </nav>

  <!-- =========================================================
       CONTROLS HELP POPOVER
       ========================================================= -->
  <div id="help-popover" class="fixed top-16 right-4 z-30 w-72 max-w-[calc(100vw-2rem)] p-4 rounded-2xl glass-panel shadow-2xl hidden">
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-xs font-mono-tech uppercase tracking-[0.18em] text-amber-200">Gallery Controls</h3>
      <button id="btn-close-help" class="text-slate-400 hover:text-white p-1" aria-label="Close help"><i data-lucide="x" class="w-4 h-4"></i></button>
    </div>
    <ul class="space-y-2 text-xs text-slate-300">
      <li class="flex justify-between"><span>Walk / Strafe</span><span class="font-mono-tech text-white">W A S D / D-Pad</span></li>
      <li class="flex justify-between"><span>Free Mouse Look</span><span class="font-mono-tech text-white">Click Scene</span></li>
      <li class="flex justify-between"><span>Release Cursor</span><span class="font-mono-tech text-white">Esc</span></li>
      <li class="flex justify-between"><span>Inspect Exhibit</span><span class="font-mono-tech text-white">Click / E</span></li>
      <li class="flex justify-between"><span>Jump to Edition</span><span class="font-mono-tech text-white">Keys 1 – 6</span></li>
    </ul>
    <p class="mt-3 pt-3 border-t border-white/10 text-[11px] text-slate-400 leading-relaxed">
      Tip: Aim the center crosshair at any monolith and click to inspect it. Press <strong class="text-amber-200 font-medium">Esc</strong> any time to unlock your cursor for the top HUD.
    </p>
  </div>

  <!-- =========================================================
       PORTFOLIO INSPECTOR & INTERACTIVE PREVIEW MODAL
       ========================================================= -->
  <div id="inspector-modal" class="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6 bg-black/80 modal-closed" role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <div id="inspector-card" class="relative w-full max-w-5xl max-h-[92vh] rounded-2xl sm:rounded-3xl shadow-[0_30px_100px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden">
      <!-- Top Bar -->
      <div class="flex items-center justify-between gap-2 sm:gap-3 px-4 sm:px-5 py-3 sm:py-3.5 border-b border-white/10 bg-black/30">
        <div class="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <span id="modal-edition-num" class="px-2.5 py-1 rounded-full text-[11px] font-mono-tech uppercase tracking-widest bg-amber-200/15 text-amber-200 border border-amber-200/30 shrink-0">ED. 01</span>
          <div class="min-w-0">
            <h2 id="modal-title" class="text-sm sm:text-lg font-semibold text-white truncate">The First Portfolio</h2>
            <p id="modal-subtitle" class="text-[11px] sm:text-xs text-slate-400 truncate">March 2026 · Original Neon Edition</p>
          </div>
        </div>

        <div class="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <button id="btn-modal-prev" class="w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-slate-200 transition-colors" title="Previous Portfolio Edition" aria-label="Previous Portfolio Edition">
            <i data-lucide="chevron-left" class="w-4 h-4"></i>
          </button>
          <button id="btn-modal-next" class="w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-slate-200 transition-colors" title="Next Portfolio Edition" aria-label="Next Portfolio Edition">
            <i data-lucide="chevron-right" class="w-4 h-4"></i>
          </button>
          <button id="btn-modal-edit-toggle" class="ml-0.5 sm:ml-1 inline-flex items-center justify-center gap-1.5 h-9 sm:h-8 px-2.5 sm:px-3 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-xs text-slate-200 transition-colors" aria-label="Customize Exhibit">
            <i data-lucide="sliders-horizontal" class="w-3.5 h-3.5"></i>
            <span class="hidden sm:inline">Customize</span>
          </button>
          <button id="btn-modal-close" class="ml-0.5 sm:ml-1 w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-white/10 hover:bg-rose-500/30 border border-white/15 flex items-center justify-center text-white transition-colors" title="Back to Gallery (Esc)" aria-label="Close modal">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>
        </div>
      </div>

      <!-- Body -->
      <div class="flex-1 overflow-y-auto custom-scroll grid grid-cols-1 lg:grid-cols-12">
        <!-- Left: Live Interactive Portfolio Mockup Viewport -->
        <div class="lg:col-span-8 p-3.5 sm:p-6 bg-black/40 border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col">
          <!-- Mock Browser Chrome -->
          <div class="rounded-2xl overflow-hidden border border-white/15 shadow-2xl flex flex-col flex-1 min-h-[320px] sm:min-h-[360px]">
            <div class="flex items-center justify-between px-3.5 py-2 bg-[#12151f] border-b border-white/10">
              <div class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full bg-rose-400/80"></span>
                <span class="w-2.5 h-2.5 rounded-full bg-amber-300/80"></span>
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-400/80"></span>
              </div>
              <div id="mock-url-bar" class="px-3 py-0.5 rounded-md bg-black/45 text-[11px] font-mono-tech text-slate-300 truncate max-w-[60%]">
                areebazhar.dev/designs/original-neon
              </div>
              <span class="text-[10px] font-mono-tech text-amber-200/80 uppercase">Interactive</span>
            </div>

            <!-- Dynamic Interactive Preview Container -->
            <div id="live-preview-stage" class="flex-1 overflow-y-auto custom-scroll">
              <!-- Rendered per edition -->
            </div>
          </div>
          <p class="mt-2.5 text-[11px] font-mono-tech text-slate-400/80 text-center">
            Click or tap any featured project card above to open its canonical case study briefing.
          </p>
        </div>

        <!-- Right: Curatorial Notes + Tech Stack + Customizer -->
        <div class="lg:col-span-4 p-4 sm:p-6 flex flex-col justify-between gap-5">
          <!-- View Mode -->
          <div id="modal-info-view" class="space-y-5">
            <div>
              <span class="text-[10px] font-mono-tech uppercase tracking-[0.2em] text-amber-200/80">Curatorial Note</span>
              <p id="modal-description" class="mt-2 text-sm text-slate-200/90 leading-relaxed"></p>
            </div>

            <div>
              <span class="text-[10px] font-mono-tech uppercase tracking-[0.2em] text-slate-400">Design Language</span>
              <p id="modal-aesthetic" class="mt-1.5 text-xs text-slate-300"></p>
            </div>

            <div>
              <span class="text-[10px] font-mono-tech uppercase tracking-[0.2em] text-slate-400">Architecture &amp; Stack</span>
              <div id="modal-stack" class="mt-2 flex flex-wrap gap-1.5"></div>
            </div>

            <div>
              <span class="text-[10px] font-mono-tech uppercase tracking-[0.2em] text-slate-400">Featured Works in Era</span>
              <ul id="modal-highlights" class="mt-2 space-y-1.5 text-xs text-slate-300"></ul>
            </div>
          </div>

          <!-- Edit Mode (Customizer) -->
          <form id="modal-edit-form" class="space-y-3.5 hidden">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-mono-tech uppercase tracking-[0.2em] text-amber-200">Customize Exhibit</span>
              <button type="button" id="btn-reset-exhibit" class="text-[11px] text-slate-400 hover:text-amber-200 underline">Reset Default</button>
            </div>
            <div>
              <label class="block text-[11px] text-slate-400 mb-1" for="edit-title">Edition Title</label>
              <input id="edit-title" type="text" class="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-sm text-white focus:outline-none focus:border-amber-200/60" />
            </div>
            <div class="grid grid-cols-2 gap-2.5">
              <div>
                <label class="block text-[11px] text-slate-400 mb-1" for="edit-year">Era / Year</label>
                <input id="edit-year" type="text" class="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-sm text-white focus:outline-none focus:border-amber-200/60" />
              </div>
              <div>
                <label class="block text-[11px] text-slate-400 mb-1" for="edit-accent">Accent Hex</label>
                <input id="edit-accent" type="color" class="w-full h-[38px] p-1 rounded-xl bg-black/50 border border-white/15 cursor-pointer" />
              </div>
            </div>
            <div>
              <label class="block text-[11px] text-slate-400 mb-1" for="edit-url">Live Portfolio URL or Path</label>
              <input id="edit-url" type="text" placeholder="./portfolio/ or https://..." class="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-xs font-mono-tech text-white focus:outline-none focus:border-amber-200/60" />
            </div>
            <div>
              <label class="block text-[11px] text-slate-400 mb-1" for="edit-desc">Curatorial Note</label>
              <textarea id="edit-desc" rows="3" class="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-xs text-white focus:outline-none focus:border-amber-200/60"></textarea>
            </div>
            <button type="submit" class="w-full py-2.5 rounded-xl bg-amber-200 text-slate-950 font-semibold text-xs uppercase tracking-wider hover:bg-amber-100 transition-colors">
              Save &amp; Update 3D Monolith
            </button>
          </form>

          <!-- Footer CTAs -->
          <div class="pt-4 border-t border-white/10 flex flex-col gap-2">
            <a id="btn-launch-live" href="./portfolio/" class="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber-200 text-slate-950 font-semibold text-sm hover:bg-amber-100 transition-colors">
              <span id="label-launch-live">Open Live Edition</span>
              <i data-lucide="external-link" class="w-4 h-4"></i>
            </a>
            <button id="btn-modal-walk" class="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-200 transition-colors">
              <i data-lucide="footprints" class="w-3.5 h-3.5"></i>
              <span>Return to 3D Gallery</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Toast Notification -->
  <div id="toast" role="status" aria-live="polite" class="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full glass-panel border-amber-200/40 text-xs font-medium text-amber-100 opacity-0 pointer-events-none transition-all duration-300 max-w-[90vw] text-center"></div>

  <script>
    (function () {
      'use strict';

      // ============================================================
      // 1. REAL LIVE PORTFOLIO EDITIONS DATA (Grounded to AREEB-AZHAR/Portfolio)
      // ============================================================
      const DEFAULT_EDITIONS = [
        {
          id: 'ed-01',
          num: '01',
          year: 'Mar 2026',
          title: 'The First Portfolio',
          subtitle: 'Original Neon Engineering Edition · 16fbb13',
          aesthetic: 'Phosphor mint neon accents, custom technical cursor, interactive neural canvas.',
          description: 'The original neon-accented AI and software portfolio preserved directly from commit 16fbb13. Features a custom cursor, technical particle canvas, and early project stories.',
          accent: '#34d399',
          bgHex: '#07120e',
          url: './designs/original-neon/',
          stack: ['HTML5', 'CSS3', 'Vanilla JS', 'Canvas FX'],
          highlights: ['Preserved historical snapshot (16fbb13)', 'Custom cursor & neural background canvas', 'Canonical links into live project briefings'],
          themeKey: 'terminal',
          wing: 'left',
          zPos: 12
        },
        {
          id: 'ed-02',
          num: '02',
          year: 'Apr 2026',
          title: 'Glass, Code & Systems',
          subtitle: 'Version 2.0 Dark Glass Dashboard · 425829f',
          aesthetic: 'Deep obsidian-indigo void, translucent glass panels, floating code windows.',
          description: 'Version 2.0 preserved from commit 425829f: a dark glass-panel interface with floating syntax windows, ambient neural linework, and a compact engineering dashboard feel.',
          accent: '#38bdf8',
          bgHex: '#0b1022',
          url: './designs/glass-systems/',
          stack: ['Glassmorphism', 'GSAP', 'Lenis', 'Responsive UI'],
          highlights: ['Preserved historical snapshot (425829f)', 'Floating code windows & glass elevation', 'Direct links to full technical case studies'],
          themeKey: 'glass',
          wing: 'right',
          zPos: 12
        },
        {
          id: 'ed-03',
          num: '03',
          year: 'Jul 2026',
          title: 'Ideas, Put Into Practice',
          subtitle: 'Warm Editorial Project Showcase · a9d3640',
          aesthetic: 'Warm archival ivory paper, vermilion & ink rules, structured editorial grid.',
          description: 'The warm, light project showcase preserved from commit a9d3640: an animated editorial introduction, featured work, capabilities, certificate view, and searchable project archive.',
          accent: '#ef4444',
          bgHex: '#f5f2eb',
          url: './designs/project-showcase/',
          stack: ['Editorial Grid', 'Vite', 'Certificates', 'Searchable Archive'],
          highlights: ['Preserved historical snapshot (a9d3640)', 'Rust Internship certificate & project media', 'High-contrast print-inspired rhythm'],
          themeKey: 'swiss',
          wing: 'left',
          zPos: -2
        },
        {
          id: 'ed-04',
          num: '04',
          year: '2026',
          title: 'Project Archive Lab',
          subtitle: '19 Canonical Engineering Case Studies',
          aesthetic: 'Electric saffron accents, bold architectural cards, searchable technical index.',
          description: 'The complete canonical archive uniting 19 software engineering projects — from RustBot, GraviPop, and Tally to Hyperledger Degree Verification, CryptoTrader, Bunetto, and Unity FYP.',
          accent: '#facc15',
          bgHex: '#18181b',
          url: './projects/',
          stack: ['Rust', 'React 19', 'Hyperledger', 'Flutter / Unity'],
          highlights: ['19 full project pages with architecture flows', 'Real screenshots, icons & repo links', 'Filterable by stack & capability pillar'],
          themeKey: 'brutalist',
          wing: 'right',
          zPos: -2
        },
        {
          id: 'ed-05',
          num: '05',
          year: 'Oct 2026',
          title: 'Sculpture in the Story',
          subtitle: 'Cinematic Metallic Monogram Edition · f81b386',
          aesthetic: 'Near-black obsidian canvas, champagne serif typography, metallic AA sculpture.',
          description: 'The first near-black editorial sculptural redesign preserved from commit f81b386: a spacious top-to-bottom portfolio built around a metallic AA sculpture and quiet editorial typography.',
          accent: '#e2c285',
          bgHex: '#09090b',
          url: './designs/cinematic-sculpture/',
          stack: ['Three.js', 'Manrope', 'Static MPA', 'Editorial Motion'],
          highlights: ['Preserved historical snapshot (f81b386)', 'Procedural metallic AA sculpture identity', 'Spacious monochrome editorial storytelling'],
          themeKey: 'noir',
          wing: 'left',
          zPos: -16
        },
        {
          id: 'ed-06',
          num: '06',
          year: 'Nov 2026',
          title: 'A Living Ribbon',
          subtitle: 'Current Flagship · 14-Scene Filament · 28fb767',
          aesthetic: 'Warm architectural gold, obsidian reflections, transforming beveled Three.js ribbon.',
          description: 'The latest flagship cinematic portfolio: one continuous living filament and transforming sculptural ribbon carry all 14 scenes from the opening AA signature through 6 featured projects and contact.',
          accent: '#f59e0b',
          bgHex: '#0c0a09',
          url: './portfolio/',
          stack: ['Three.js', 'Vite 8', 'Living Filament', 'View Transitions'],
          highlights: ['14-scene native-scroll horizontal story', 'Fixed-topology transforming metallic ribbon', 'First-visit animation consent & full briefings'],
          themeKey: 'spatial',
          wing: 'right',
          zPos: -16
        }
      ];

      const STORAGE_KEY = 'areeb_3d_portfolio_live_v1';
      const isCoarsePointer = Boolean(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);

      function loadEditions() {
        try {
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length === DEFAULT_EDITIONS.length) {
              return parsed;
            }
          }
        } catch (e) { /* sandbox storage fallback */ }
        return DEFAULT_EDITIONS.map(e => Object.assign({}, e));
      }

      function saveEditions(list) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        } catch (e) { /* ignore */ }
      }

      let editions = loadEditions();

      // ============================================================
      // 2. APP STATE
      // ============================================================
      const state = {
        mode: 'splash', // 'splash' | 'explore' | 'modal'
        autoTour: false,
        tourTime: 0,
        cinemaBars: true,
        audioEnabled: false,
        hoveredId: null,
        nearestId: null,
        activeModalId: null,
        editMode: false,
        isTabHidden: false,
        isPointerLocked: false,
        // Camera walkthrough state
        pos: new THREE.Vector3(0, 1.75, 23.5),
        vel: new THREE.Vector3(),
        yaw: 0,
        pitch: 0.02,
        targetYaw: 0,
        targetPitch: 0.02,
        bobPhase: 0,
        // Smooth camera glide state
        glide: null,
        // Inputs
        keys: {},
        touchMove: { forward: false, backward: false, left: false, right: false },
        isDragging: false,
        dragMoved: false,
        lastPointer: { x: 0, y: 0 }
      };

      // Reusable scratch vectors (hoisted outside animate loop to prevent per-frame GC allocations)
      const forwardVec = new THREE.Vector3();
      const rightVec = new THREE.Vector3();
      const wishDir = new THREE.Vector3();
      const centerNDC = new THREE.Vector2(0, 0);

      // ============================================================
      // 3. WEB AUDIO API AMBIENT CINEMA SOUNDSCAPE
      // ============================================================
      let audioCtx = null;
      let masterGain = null;
      let droneOscs = [];

      function initAudio() {
        if (audioCtx) return;
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;
        audioCtx = new AudioContextClass();
        masterGain = audioCtx.createGain();
        masterGain.gain.value = 0.0;
        masterGain.connect(audioCtx.destination);

        // Lush warm museum pad (D2, A2, F#3, C#4 subtle detuned)
        const freqs = [73.42, 110.0, 146.83, 220.0];
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 380;
        filter.connect(masterGain);

        freqs.forEach((f, idx) => {
          const osc = audioCtx.createOscillator();
          const g = audioCtx.createGain();
          osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
          osc.frequency.value = f;
          osc.detune.value = (idx - 1.5) * 4;
          g.gain.value = 0.045 / (idx + 1);
          osc.connect(g);
          g.connect(filter);
          osc.start();
          droneOscs.push(osc);
        });
      }

      function setAudioEnabled(enabled) {
        state.audioEnabled = enabled;
        if (enabled) {
          initAudio();
          if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
          if (masterGain && audioCtx) {
            masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
            masterGain.gain.linearRampToValueAtTime(0.32, audioCtx.currentTime + 0.8);
          }
        } else if (masterGain && audioCtx) {
          masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
          masterGain.gain.linearRampToValueAtTime(0.0, audioCtx.currentTime + 0.5);
        }
        updateAudioUI();
      }

      function playChime(freq = 523.25) {
        if (!state.audioEnabled || !audioCtx) return;
        try {
          const now = audioCtx.currentTime;
          const osc = audioCtx.createOscillator();
          const g = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);
          osc.frequency.exponentialRampToValueAtTime(freq * 1.02, now + 0.35);
          g.gain.setValueAtTime(0.001, now);
          g.gain.linearRampToValueAtTime(0.07, now + 0.02);
          g.gain.exponentialRampToValueAtTime(0.0008, now + 0.45);
          osc.connect(g);
          g.connect(audioCtx.destination);
          osc.start(now);
          osc.stop(now + 0.5);
        } catch (e) { /* ignore */ }
      }

      // ============================================================
      // 4. PROCEDURAL HIGH-RES PORTFOLIO ARTWORK TEXTURE GENERATOR
      // ============================================================
      function createPortfolioTexture(ed) {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 640;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = ed.bgHex || '#0b0d14';
        ctx.fillRect(0, 0, 1024, 640);

        const isLight = ed.themeKey === 'swiss';
        const fg = isLight ? '#111111' : '#f8fafc';
        const muted = isLight ? '#57534e' : '#94a3b8';

        if (ed.themeKey === 'terminal') {
          ctx.fillStyle = 'rgba(52, 211, 153, 0.04)';
          for (let y = 0; y < 640; y += 6) ctx.fillRect(0, y, 1024, 2);
          ctx.strokeStyle = ed.accent;
          ctx.lineWidth = 3;
          ctx.strokeRect(28, 28, 968, 584);
        } else if (ed.themeKey === 'swiss') {
          ctx.strokeStyle = 'rgba(0,0,0,0.08)';
          ctx.lineWidth = 1;
          for (let x = 64; x < 1024; x += 80) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 640); ctx.stroke();
          }
          ctx.fillStyle = ed.accent;
          ctx.fillRect(0, 0, 1024, 16);
          ctx.fillRect(64, 96, 180, 10);
        } else if (ed.themeKey === 'brutalist') {
          ctx.fillStyle = '#27272a';
          ctx.fillRect(36, 36, 952, 568);
          ctx.strokeStyle = ed.accent;
          ctx.lineWidth = 8;
          ctx.strokeRect(36, 36, 952, 568);
          ctx.fillStyle = ed.accent;
          ctx.fillRect(660, 74, 280, 56);
        } else if (ed.themeKey === 'glass') {
          const grad1 = ctx.createRadialGradient(260, 180, 20, 260, 180, 380);
          grad1.addColorStop(0, 'rgba(56, 189, 248, 0.42)');
          grad1.addColorStop(1, 'rgba(11, 16, 34, 0)');
          ctx.fillStyle = grad1;
          ctx.fillRect(0, 0, 1024, 640);

          const grad2 = ctx.createRadialGradient(780, 480, 20, 780, 480, 340);
          grad2.addColorStop(0, 'rgba(168, 85, 247, 0.35)');
          grad2.addColorStop(1, 'rgba(11, 16, 34, 0)');
          ctx.fillStyle = grad2;
          ctx.fillRect(0, 0, 1024, 640);
        } else if (ed.themeKey === 'noir') {
          const grad = ctx.createLinearGradient(0, 0, 1024, 640);
          grad.addColorStop(0, '#141418');
          grad.addColorStop(1, '#060608');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, 1024, 640);
          ctx.strokeStyle = 'rgba(226, 194, 133, 0.35)';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(42, 42, 940, 556);
        } else {
          const grad = ctx.createRadialGradient(512, 240, 30, 512, 320, 520);
          grad.addColorStop(0, 'rgba(245, 158, 11, 0.25)');
          grad.addColorStop(1, 'rgba(12, 10, 9, 0)');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, 1024, 640);
          ctx.strokeStyle = 'rgba(245, 158, 11, 0.22)';
          ctx.lineWidth = 1.5;
          for (let r = 90; r <= 270; r += 60) {
            ctx.beginPath(); ctx.arc(760, 310, r, 0, Math.PI * 2); ctx.stroke();
          }
        }

        ctx.fillStyle = muted;
        ctx.font = '600 18px "JetBrains Mono", monospace';
        ctx.fillText(\`AREEB AZHAR // EDITION \${ed.num}\`, 64, 78);
        ctx.fillStyle = ed.accent;
        ctx.fillText(\`\${ed.year}\`, 860, 78);

        ctx.strokeStyle = isLight ? 'rgba(0,0,0,0.16)' : 'rgba(255,255,255,0.14)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(64, 102); ctx.lineTo(960, 102); ctx.stroke();

        ctx.fillStyle = fg;
        if (ed.themeKey === 'noir' || ed.themeKey === 'spatial') {
          ctx.font = '600 66px Georgia, serif';
        } else if (ed.themeKey === 'terminal') {
          ctx.font = '700 54px "JetBrains Mono", monospace';
        } else {
          ctx.font = '800 58px Inter, sans-serif';
        }
        const prefix = ed.themeKey === 'terminal' ? '> ' : '';
        ctx.fillText(prefix + ed.title, 64, 205);

        ctx.fillStyle = ed.accent;
        ctx.font = '500 22px Inter, sans-serif';
        ctx.fillText(ed.subtitle, 64, 250);

        const projects = [
          { name: 'RustBot', tag: 'Rust · Local Store · APIs' },
          { name: 'CryptoTrader', tag: 'React 19 · TanStack · Zustand' },
          { name: 'DegreeChain', tag: 'Hyperledger · Docker · AWS' }
        ];
        projects.forEach((proj, idx) => {
          const cx = 64 + idx * 306;
          const cy = 310;
          const cw = 282;
          const ch = 195;

          ctx.fillStyle = isLight ? '#ffffff' : 'rgba(255,255,255,0.06)';
          ctx.fillRect(cx, cy, cw, ch);

          ctx.strokeStyle = ed.themeKey === 'brutalist' ? ed.accent : (isLight ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.15)');
          ctx.lineWidth = ed.themeKey === 'brutalist' ? 4 : 1.5;
          ctx.strokeRect(cx, cy, cw, ch);

          ctx.fillStyle = ed.accent;
          ctx.fillRect(cx + 18, cy + 20, 44, 6);

          ctx.fillStyle = fg;
          ctx.font = '600 22px Inter, sans-serif';
          ctx.fillText(proj.name, cx + 18, cy + 68);

          ctx.fillStyle = muted;
          ctx.font = '400 15px "JetBrains Mono", monospace';
          ctx.fillText(proj.tag, cx + 18, cy + 100);

          ctx.fillStyle = isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.12)';
          ctx.fillRect(cx + 18, cy + 132, cw - 36, 8);
          ctx.fillRect(cx + 18, cy + 152, cw - 92, 8);
        });

        ctx.fillStyle = muted;
        ctx.font = '500 16px "JetBrains Mono", monospace';
        ctx.fillText(ed.stack.join('  ·  '), 64, 568);

        ctx.fillStyle = ed.accent;
        ctx.fillText('CLICK TO ENTER EDITION →', 715, 568);

        const tex = new THREE.CanvasTexture(canvas);
        tex.anisotropy = 8;
        tex.needsUpdate = true;
        return tex;
      }

      function createPlaqueTexture(ed) {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#101218';
        ctx.fillRect(0, 0, 512, 256);
        ctx.strokeStyle = 'rgba(240, 201, 125, 0.45)';
        ctx.lineWidth = 4;
        ctx.strokeRect(8, 8, 496, 240);

        ctx.fillStyle = ed.accent;
        ctx.font = '600 24px "JetBrains Mono", monospace';
        ctx.fillText(\`EDITION \${ed.num}  //  \${ed.year}\`, 34, 62);

        ctx.fillStyle = '#f8fafc';
        ctx.font = '600 38px Georgia, serif';
        ctx.fillText(ed.title, 34, 128);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '400 20px Inter, sans-serif';
        ctx.fillText(ed.subtitle, 34, 176);

        ctx.fillStyle = '#f0c97d';
        ctx.font = '500 18px "JetBrains Mono", monospace';
        ctx.fillText('[ CLICK OR PRESS E TO INSPECT ]', 34, 224);

        const tex = new THREE.CanvasTexture(canvas);
        tex.needsUpdate = true;
        return tex;
      }

      function createFloorTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#0e1017';
        ctx.fillRect(0, 0, 512, 512);

        for (let i = 0; i < 600; i++) {
          const x = Math.random() * 512;
          const y = Math.random() * 512;
          const v = 18 + Math.floor(Math.random() * 24);
          ctx.fillStyle = \`rgb(\${v},\${v + 2},\${v + 6})\`;
          ctx.fillRect(x, y, 2, 2);
        }

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.045)';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, 256, 256);
        ctx.strokeRect(256, 0, 256, 256);
        ctx.strokeRect(0, 256, 256, 256);
        ctx.strokeRect(256, 256, 256, 256);

        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(8, 22);
        return tex;
      }

      function createMonumentTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#090b10';
        ctx.fillRect(0, 0, 1024, 512);

        const grad = ctx.createRadialGradient(512, 256, 20, 512, 256, 460);
        grad.addColorStop(0, 'rgba(240, 201, 125, 0.16)');
        grad.addColorStop(1, 'rgba(9, 11, 16, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1024, 512);

        ctx.strokeStyle = 'rgba(240, 201, 125, 0.25)';
        ctx.lineWidth = 2;
        ctx.strokeRect(36, 36, 952, 440);

        ctx.textAlign = 'center';
        ctx.fillStyle = '#f0c97d';
        ctx.font = '500 22px "JetBrains Mono", monospace';
        ctx.fillText('PERMANENT COLLECTION · KARACHI', 512, 160);

        ctx.fillStyle = '#ffffff';
        ctx.font = '500 84px Georgia, serif';
        ctx.fillText('AREEB AZHAR', 512, 265);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '400 22px Inter, sans-serif';
        ctx.fillText('SOFTWARE ENGINEERING · UI/UX · INTERACTIVE SYSTEMS', 512, 330);

        ctx.fillStyle = 'rgba(240, 201, 125, 0.75)';
        ctx.font = '400 18px "JetBrains Mono", monospace';
        ctx.fillText('github.com/AREEB-AZHAR', 512, 395);

        const tex = new THREE.CanvasTexture(canvas);
        tex.needsUpdate = true;
        return tex;
      }

      // ============================================================
      // 5. THREE.JS CINEMATIC GALLERY SCENE SETUP
      // ============================================================
      const container = document.getElementById('canvas-container');
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x07090f);
      scene.fog = new THREE.FogExp2(0x07090f, 0.024);

      const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 120);
      camera.rotation.order = 'YXZ';

      let renderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.15;
        container.appendChild(renderer.domElement);
      } catch (err) {
        container.innerHTML = \`
          <div class="flex flex-col items-center justify-center h-full text-slate-200 p-8 text-center gap-4">
            <p class="max-w-md text-sm text-slate-300">WebGL is unavailable on this browser or device. Explore all five real portfolio generations in the 2D Editions Index instead.</p>
            <div class="flex flex-wrap gap-3 justify-center">
              <a href="./portfolio/" class="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber-200 text-slate-950 font-semibold text-sm hover:bg-amber-100 transition-colors">Enter Latest Portfolio →</a>
              <a href="./editions/" class="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 text-white font-medium text-sm hover:bg-white/15 transition-colors">Open 2D Editions Index</a>
            </div>
          </div>
        \`;
        return;
      }

      // Lighting
      const hemiLight = new THREE.HemisphereLight(0x9fb8ff, 0x261d14, 0.85);
      scene.add(hemiLight);

      const dirLight = new THREE.DirectionalLight(0xfff1d6, 0.55);
      dirLight.position.set(4, 14, 10);
      scene.add(dirLight);

      const corridorLightZs = [20, 10, 0, -10, -20];
      corridorLightZs.forEach((z, i) => {
        const pl = new THREE.PointLight(i % 2 === 0 ? 0xffd79a : 0x8db9ff, 1.35, 22, 1.7);
        pl.position.set(0, 7.6, z);
        scene.add(pl);
      });

      const wallMat = new THREE.MeshStandardMaterial({ color: 0x141720, roughness: 0.82, metalness: 0.12 });
      const ribMat = new THREE.MeshStandardMaterial({ color: 0x1b202c, roughness: 0.65, metalness: 0.25 });
      const brassMat = new THREE.MeshStandardMaterial({ color: 0xd4af6a, roughness: 0.3, metalness: 0.85 });
      const floorMat = new THREE.MeshStandardMaterial({ map: createFloorTexture(), roughness: 0.22, metalness: 0.45 });

      const floor = new THREE.Mesh(new THREE.PlaneGeometry(18, 58), floorMat);
      floor.rotation.x = -Math.PI / 2;
      scene.add(floor);

      const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(18, 58), wallMat);
      ceiling.rotation.x = Math.PI / 2;
      ceiling.position.set(0, 9, 0);
      scene.add(ceiling);

      const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(58, 9), wallMat);
      leftWall.rotation.y = Math.PI / 2;
      leftWall.position.set(-9, 4.5, 0);
      scene.add(leftWall);

      const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(58, 9), wallMat);
      rightWall.rotation.y = -Math.PI / 2;
      rightWall.position.set(9, 4.5, 0);
      scene.add(rightWall);

      const backWall = new THREE.Mesh(new THREE.PlaneGeometry(18, 9), wallMat);
      backWall.position.set(0, 4.5, -28);
      scene.add(backWall);

      const entranceWall = new THREE.Mesh(new THREE.PlaneGeometry(18, 9), wallMat);
      entranceWall.rotation.y = Math.PI;
      entranceWall.position.set(0, 4.5, 28);
      scene.add(entranceWall);

      // Single reused CanvasTexture for Monument Wall
      const monumentTex = createMonumentTexture();
      const monumentMat = new THREE.MeshStandardMaterial({
        map: monumentTex,
        emissiveMap: monumentTex,
        emissive: new THREE.Color(0xffffff),
        emissiveIntensity: 0.55,
        roughness: 0.4
      });
      const monumentMesh = new THREE.Mesh(new THREE.PlaneGeometry(9.6, 4.8), monumentMat);
      monumentMesh.position.set(0, 4.1, -27.7);
      scene.add(monumentMesh);

      const stripMat = new THREE.MeshBasicMaterial({ color: 0xf0c97d, transparent: true, opacity: 0.5 });
      [-2.8, 2.8].forEach(x => {
        const strip = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 50), stripMat);
        strip.rotation.x = -Math.PI / 2;
        strip.position.set(x, 0.015, -1);
        scene.add(strip);
      });

      for (let z = 24; z >= -24; z -= 8) {
        [-8.6, 8.6].forEach(x => {
          const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.8, 9, 0.9), ribMat);
          pillar.position.set(x, 4.5, z);
          scene.add(pillar);
        });
        const beam = new THREE.Mesh(new THREE.BoxGeometry(18, 0.7, 0.9), ribMat);
        beam.position.set(0, 8.65, z);
        scene.add(beam);

        const skyMat = new THREE.MeshBasicMaterial({ color: 0xffe8c2, transparent: true, opacity: 0.32 });
        const skyStrip = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 0.25), skyMat);
        skyStrip.rotation.x = Math.PI / 2;
        skyStrip.position.set(0, 8.95, z - 4);
        scene.add(skyStrip);
      }

      const solidObstacles = [];

      function resolveObstacleCollisions(pos, radius) {
        for (let i = 0; i < solidObstacles.length; i++) {
          const box = solidObstacles[i];
          const closestX = Math.max(box.minX, Math.min(pos.x, box.maxX));
          const closestZ = Math.max(box.minZ, Math.min(pos.z, box.maxZ));
          const dx = pos.x - closestX;
          const dz = pos.z - closestZ;
          const distSq = dx * dx + dz * dz;
          if (distSq < radius * radius) {
            if (distSq > 1e-6) {
              const dist = Math.sqrt(distSq);
              const overlap = radius - dist;
              pos.x += (dx / dist) * overlap;
              pos.z += (dz / dist) * overlap;
            } else {
              const toLeft = Math.abs(pos.x - box.minX);
              const toRight = Math.abs(box.maxX - pos.x);
              const toFront = Math.abs(pos.z - box.minZ);
              const toBack = Math.abs(box.maxZ - pos.z);
              const minPen = Math.min(toLeft, toRight, toFront, toBack);
              if (minPen === toLeft) pos.x = box.minX - radius;
              else if (minPen === toRight) pos.x = box.maxX + radius;
              else if (minPen === toFront) pos.z = box.minZ - radius;
              else pos.z = box.maxZ + radius;
            }
          }
        }
      }

      const benchGroup = new THREE.Group();
      const benchTop = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.14, 4.2), ribMat);
      benchTop.position.set(0, 0.52, 5);
      benchGroup.add(benchTop);
      [-1.5, 1.5].forEach(dz => {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.45, 0.18), brassMat);
        leg.position.set(0, 0.225, 5 + dz);
        benchGroup.add(leg);
      });
      scene.add(benchGroup);
      solidObstacles.push({ type: 'bench', minX: -0.75, maxX: 0.75, minZ: 2.85, maxZ: 7.15 });

      const bench2 = benchGroup.clone();
      bench2.position.set(0, 0, -14);
      scene.add(bench2);
      solidObstacles.push({ type: 'bench', minX: -0.75, maxX: 0.75, minZ: -11.15, maxZ: -6.85 });

      const rayGeo = new THREE.CylinderGeometry(1.4, 3.8, 8.8, 16, 1, true);
      const rayMat = new THREE.MeshBasicMaterial({
        color: 0xffdfaa,
        transparent: true,
        opacity: 0.032,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });

      const pedestalBaseMat = new THREE.MeshStandardMaterial({ color: 0x0e1119, roughness: 0.45, metalness: 0.45 });
      const pedestalColMat = new THREE.MeshStandardMaterial({ color: 0x181c28, roughness: 0.5, metalness: 0.35 });
      const sculptureGoldMat = new THREE.MeshStandardMaterial({
        color: 0xe6c17a,
        roughness: 0.22,
        metalness: 0.88,
        emissive: new THREE.Color(0x4a3410),
        emissiveIntensity: 0.35
      });
      const sculptureWireMat = new THREE.MeshBasicMaterial({
        color: 0xf7dca3,
        wireframe: true,
        transparent: true,
        opacity: 0.38
      });

      const pedestalSculptures = [];
      const pedestalConfigs = [
        { z: 12, kind: 'icosahedron', accent: 0xf0c97d },
        { z: -2, kind: 'torusKnot', accent: 0x7dd3fc },
        { z: -16, kind: 'octahedron', accent: 0xfbbf24 }
      ];

      pedestalConfigs.forEach((cfg, idx) => {
        const ray = new THREE.Mesh(rayGeo, rayMat);
        ray.position.set(0, 4.5, cfg.z);
        scene.add(ray);

        const pedGroup = new THREE.Group();
        pedGroup.position.set(0, 0, cfg.z);

        const basePlinth = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.16, 1.45), pedestalBaseMat);
        basePlinth.position.y = 0.08;
        pedGroup.add(basePlinth);

        const column = new THREE.Mesh(new THREE.BoxGeometry(0.96, 1.06, 0.96), pedestalColMat);
        column.position.y = 0.69;
        pedGroup.add(column);

        const brassCap = new THREE.Mesh(new THREE.BoxGeometry(1.08, 0.07, 1.08), brassMat);
        brassCap.position.y = 1.255;
        pedGroup.add(brassCap);

        const glowRing = new THREE.Mesh(
          new THREE.RingGeometry(0.32, 0.42, 32),
          new THREE.MeshBasicMaterial({ color: cfg.accent, side: THREE.DoubleSide, transparent: true, opacity: 0.55 })
        );
        glowRing.rotation.x = -Math.PI / 2;
        glowRing.position.y = 1.295;
        pedGroup.add(glowRing);

        const artPivot = new THREE.Group();
        artPivot.position.y = 2.08;

        if (cfg.kind === 'icosahedron') {
          const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.46, 0), sculptureGoldMat);
          const ring = new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.022, 12, 48), brassMat);
          ring.rotation.x = Math.PI / 3;
          artPivot.add(core);
          artPivot.add(ring);
        } else if (cfg.kind === 'torusKnot') {
          const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(0.34, 0.11, 72, 12), sculptureGoldMat);
          const halo = new THREE.Mesh(new THREE.IcosahedronGeometry(0.66, 1), sculptureWireMat);
          artPivot.add(knot);
          artPivot.add(halo);
        } else {
          const inner = new THREE.Mesh(new THREE.OctahedronGeometry(0.42, 0), sculptureGoldMat);
          const outer = new THREE.Mesh(new THREE.DodecahedronGeometry(0.64, 0), sculptureWireMat);
          artPivot.add(inner);
          artPivot.add(outer);
        }

        pedGroup.add(artPivot);
        scene.add(pedGroup);

        pedestalSculptures.push({ pivot: artPivot, baseY: 2.08, phase: idx * 2.1 });
        solidObstacles.push({ type: 'pedestal', minX: -0.78, maxX: 0.78, minZ: cfg.z - 0.78, maxZ: cfg.z + 0.78 });
      });

      const particleCount = 320;
      const pGeo = new THREE.BufferGeometry();
      const pPos = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount; i++) {
        pPos[i * 3] = (Math.random() - 0.5) * 16;
        pPos[i * 3 + 1] = 0.4 + Math.random() * 8.0;
        pPos[i * 3 + 2] = (Math.random() - 0.5) * 52;
      }
      pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
      const pMat = new THREE.PointsMaterial({
        color: 0xf7dca3,
        size: 0.065,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const dustParticles = new THREE.Points(pGeo, pMat);
      scene.add(dustParticles);

      // ============================================================
      // 6. BUILD THE 6 PORTFOLIO MONOLITH EXHIBITS
      // ============================================================
      const exhibitObjects = [];
      const clickableMeshes = [];

      function buildExhibits() {
        editions.forEach((ed) => {
          const isLeft = ed.wing === 'left';
          const xWall = isLeft ? -8.35 : 8.35;
          const rotY = isLeft ? Math.PI / 2 : -Math.PI / 2;

          const group = new THREE.Group();
          group.position.set(xWall, 0, ed.zPos);
          group.rotation.y = rotY;

          const plinth = new THREE.Mesh(
            new THREE.BoxGeometry(5.6, 0.42, 0.85),
            new THREE.MeshStandardMaterial({ color: 0x0d1017, roughness: 0.4, metalness: 0.5 })
          );
          plinth.position.set(0, 0.21, 0.25);
          group.add(plinth);

          const frameMesh = new THREE.Mesh(
            new THREE.BoxGeometry(5.24, 3.34, 0.18),
            new THREE.MeshStandardMaterial({ color: 0x161924, roughness: 0.35, metalness: 0.75 })
          );
          frameMesh.position.set(0, 2.75, 0.08);
          group.add(frameMesh);

          const rimMat = new THREE.MeshBasicMaterial({
            color: new THREE.Color(ed.accent),
            transparent: true,
            opacity: 0.35
          });
          const rimMesh = new THREE.Mesh(new THREE.BoxGeometry(5.32, 3.42, 0.06), rimMat);
          rimMesh.position.set(0, 2.75, 0.02);
          group.add(rimMesh);

          const artTex = createPortfolioTexture(ed);
          const screenMat = new THREE.MeshStandardMaterial({
            map: artTex,
            emissiveMap: artTex,
            emissive: new THREE.Color(0xffffff),
            emissiveIntensity: 0.72,
            roughness: 0.25,
            metalness: 0.08
          });
          const screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(4.96, 3.1), screenMat);
          screenMesh.position.set(0, 2.75, 0.18);
          screenMesh.userData.editionId = ed.id;
          group.add(screenMesh);
          clickableMeshes.push(screenMesh);

          const plaqueTex = createPlaqueTexture(ed);
          const plaqueMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(1.15, 0.58),
            new THREE.MeshStandardMaterial({
              map: plaqueTex,
              emissiveMap: plaqueTex,
              emissive: new THREE.Color(0xffffff),
              emissiveIntensity: 0.45,
              roughness: 0.4
            })
          );
          plaqueMesh.position.set(3.25, 1.65, 0.12);
          plaqueMesh.userData.editionId = ed.id;
          group.add(plaqueMesh);
          clickableMeshes.push(plaqueMesh);

          const accentLight = new THREE.PointLight(new THREE.Color(ed.accent), 0.9, 10, 1.8);
          accentLight.position.set(0, 5.2, 2.2);
          group.add(accentLight);

          const poolMat = new THREE.MeshBasicMaterial({
            color: new THREE.Color(ed.accent),
            transparent: true,
            opacity: 0.11,
            blending: THREE.AdditiveBlending,
            depthWrite: false
          });
          const pool = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 2.8), poolMat);
          pool.rotation.x = -Math.PI / 2;
          pool.position.set(0, 0.02, 1.8);
          group.add(pool);

          scene.add(group);

          const viewX = isLeft ? -3.2 : 3.2;
          const viewYaw = isLeft ? Math.PI / 2 : -Math.PI / 2;

          exhibitObjects.push({
            edition: ed,
            group,
            screenMesh,
            plaqueMesh,
            rimMat,
            accentLight,
            poolMat,
            viewPos: new THREE.Vector3(viewX, 2.1, ed.zPos),
            viewYaw,
            worldCenter: new THREE.Vector3(xWall, 2.75, ed.zPos)
          });
        });
      }

      buildExhibits();

      function refreshExhibitTextures(edId) {
        const obj = exhibitObjects.find(o => o.edition.id === edId);
        if (!obj) return;
        const ed = editions.find(e => e.id === edId);
        obj.edition = ed;

        const oldScreenTex = obj.screenMesh.material.map;
        const newTex = createPortfolioTexture(ed);
        obj.screenMesh.material.map = newTex;
        obj.screenMesh.material.emissiveMap = newTex;
        obj.screenMesh.material.needsUpdate = true;
        if (oldScreenTex) oldScreenTex.dispose();

        const oldPlaqueTex = obj.plaqueMesh.material.map;
        const newPlaque = createPlaqueTexture(ed);
        obj.plaqueMesh.material.map = newPlaque;
        obj.plaqueMesh.material.emissiveMap = newPlaque;
        obj.plaqueMesh.material.needsUpdate = true;
        if (oldPlaqueTex) oldPlaqueTex.dispose();

        obj.rimMat.color.set(ed.accent);
        obj.accentLight.color.set(ed.accent);
        obj.poolMat.color.set(ed.accent);
      }

      // ============================================================
      // 7. POINTER LOCK (MOUSE CURSOR BOUND TO 3D CAMERA MOVEMENT)
      // ============================================================
      function updateMouseLockUI() {
        const btn = document.getElementById('btn-mouse-lock');
        const label = document.getElementById('label-mouse-lock');
        if (!btn || !label) return;
        if (state.isPointerLocked) {
          label.textContent = 'Mouse Bound (Esc)';
          btn.classList.add('border-amber-200/50', 'text-amber-200');
        } else {
          label.textContent = 'Lock Mouse';
          btn.classList.remove('border-amber-200/50', 'text-amber-200');
        }
      }

      function requestMouseLock() {
        if (isCoarsePointer || state.mode !== 'explore') return;
        const el = renderer && renderer.domElement;
        if (!el || typeof el.requestPointerLock !== 'function') return;
        try {
          const maybePromise = el.requestPointerLock();
          if (maybePromise && typeof maybePromise.catch === 'function') {
            maybePromise.catch(() => {});
          }
        } catch (e) { /* pointer lock unavailable or declined */ }
      }

      function releaseMouseLock() {
        if (document.pointerLockElement && typeof document.exitPointerLock === 'function') {
          try { document.exitPointerLock(); } catch (e) {}
        }
      }

      document.addEventListener('pointerlockchange', () => {
        const locked = document.pointerLockElement === renderer.domElement;
        state.isPointerLocked = locked;
        document.body.classList.toggle('pointer-locked', locked);
        container.classList.toggle('locked-look', locked);
        if (locked) {
          state.isDragging = false;
          container.classList.remove('dragging');
        }
        updateMouseLockUI();
      });

      // Raw FPS mouse-look whenever pointer is locked
      window.addEventListener('mousemove', (ev) => {
        if (state.mode !== 'explore' || !state.isPointerLocked) return;
        // Clamp extreme Pointer Lock wake spikes (common on Windows/Chrome)
        const dx = Math.max(-120, Math.min(120, ev.movementX || 0));
        const dy = Math.max(-120, Math.min(120, ev.movementY || 0));
        if (dx === 0 && dy === 0) return;

        if (state.autoTour) {
          state.autoTour = false;
          updateTourUI();
        }
        state.glide = null;

        const sensitivityX = 0.0024;
        const sensitivityY = 0.0022;
        state.targetYaw -= dx * sensitivityX;
        state.targetPitch = Math.max(-0.58, Math.min(0.68, state.targetPitch - dy * sensitivityY));
      });

      // ============================================================
      // 8. CAMERA GLIDE & NAVIGATION HELPERS
      // ============================================================
      function normalizeAngle(a) {
        while (a > Math.PI) a -= Math.PI * 2;
        while (a < -Math.PI) a += Math.PI * 2;
        return a;
      }

      function startGlideTo(endPos, endYaw, endPitch, duration = 1.15, onComplete = null) {
        state.autoTour = false;
        updateTourUI();
        const startYaw = state.yaw;
        const diffYaw = normalizeAngle(endYaw - startYaw);
        state.glide = {
          startPos: state.pos.clone(),
          endPos: endPos.clone(),
          startYaw,
          endYaw: startYaw + diffYaw,
          startPitch: state.pitch,
          endPitch,
          t: 0,
          duration,
          onComplete
        };
      }

      function focusExhibit(edId, openModalAfter = true) {
        const obj = exhibitObjects.find(o => o.edition.id === edId);
        if (!obj) return;
        if (openModalAfter) releaseMouseLock();
        playChime(587.33);
        startGlideTo(obj.viewPos, obj.viewYaw, 0.08, 1.05, () => {
          if (openModalAfter) openInspector(edId);
        });
        highlightDock(edId);
      }

      // ============================================================
      // 9. LIVE INTERACTIVE PORTFOLIO PREVIEW RENDERER (MODAL)
      //    (Every featured card links directly to live canonical briefings)
      // ============================================================
      function renderLivePreview(ed) {
        const stage = document.getElementById('live-preview-stage');
        const displayUrl = ed.url.startsWith('./')
          ? 'areebazhar.dev/' + ed.url.replace(/^\\.\\//, '')
          : ed.url.replace(/^https?:\\/\\//, '');
        document.getElementById('mock-url-bar').textContent = displayUrl;

        if (ed.themeKey === 'terminal') {
          stage.innerHTML = \`
            <div class="p-5 sm:p-6 min-h-[320px] sm:min-h-[360px] font-mono-tech text-xs sm:text-sm" style="background:#07120e; color:#34d399;">
              <div class="opacity-70 mb-3">Snapshot 16fbb13 — Original Neon Portfolio Edition</div>
              <div class="mb-2"><span class="text-white">areeb@archive:~$</span> whoami</div>
              <div class="mb-4 text-emerald-200/90 pl-3">Areeb Azhar — Software Engineer &amp; Creative Developer (Karachi, PK)</div>
              <div class="mb-2"><span class="text-white">areeb@archive:~$</span> ls -la ./projects</div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pl-0 sm:pl-3 mb-5">
                <a href="./projects/cryptotrader/" class="preview-card-link p-3.5 rounded border border-emerald-400/30 hover:border-emerald-300/70 bg-emerald-400/5 min-h-[56px]">
                  <div class="flex items-center justify-between text-white font-semibold"><span>CryptoTrader/</span><span class="text-emerald-300 text-xs">↗</span></div>
                  <div class="text-[11px] text-emerald-300/75 mt-1">React 19 · TanStack Query · Zustand</div>
                </a>
                <a href="./projects/rustbot/" class="preview-card-link p-3.5 rounded border border-emerald-400/30 hover:border-emerald-300/70 bg-emerald-400/5 min-h-[56px]">
                  <div class="flex items-center justify-between text-white font-semibold"><span>RustBot/</span><span class="text-emerald-300 text-xs">↗</span></div>
                  <div class="text-[11px] text-emerald-300/75 mt-1">Rust · Local Knowledge Store · APIs</div>
                </a>
                <a href="./projects/degree-verification/" class="preview-card-link p-3.5 rounded border border-emerald-400/30 hover:border-emerald-300/70 bg-emerald-400/5 min-h-[56px]">
                  <div class="flex items-center justify-between text-white font-semibold"><span>DegreeChain/</span><span class="text-emerald-300 text-xs">↗</span></div>
                  <div class="text-[11px] text-emerald-300/75 mt-1">Hyperledger Fabric · Docker · CouchDB</div>
                </a>
                <a href="./projects/bunetto/" class="preview-card-link p-3.5 rounded border border-emerald-400/30 hover:border-emerald-300/70 bg-emerald-400/5 min-h-[56px]">
                  <div class="flex items-center justify-between text-white font-semibold"><span>Bunetto/</span><span class="text-emerald-300 text-xs">↗</span></div>
                  <div class="text-[11px] text-emerald-300/75 mt-1">Storefront · Cart · WhatsApp Order Flow</div>
                </a>
              </div>
              <div class="flex items-center gap-2 text-emerald-300">
                <span class="text-white">areeb@archive:~$</span>
                <span>open ./designs/original-neon/</span>
                <span class="inline-block w-2 h-4 bg-emerald-400 animate-pulse"></span>
              </div>
            </div>
          \`;
        } else if (ed.themeKey === 'swiss') {
          stage.innerHTML = \`
            <div class="p-5 sm:p-8 min-h-[320px] sm:min-h-[360px]" style="background:#f5f2eb; color:#111111;">
              <div class="h-2 w-24 mb-5" style="background:\${ed.accent};"></div>
              <div class="flex flex-wrap items-end justify-between gap-4 border-b border-black/20 pb-5">
                <div>
                  <div class="text-[10px] font-mono-tech uppercase tracking-[0.2em] text-stone-500">Edition 03 · Commit a9d3640</div>
                  <h3 class="text-3xl sm:text-4xl font-bold tracking-tight mt-1">Areeb Azhar</h3>
                </div>
                <div class="text-xs font-medium text-stone-600 max-w-xs">
                  Warm editorial project showcase with internship certification and canonical project briefings.
                </div>
              </div>
              <div class="mt-4 divide-y divide-black/15 text-xs sm:text-sm">
                <a href="./projects/cryptotrader/" class="preview-card-link py-3.5 px-1 hover:bg-black/5 rounded grid grid-cols-12 items-center min-h-[44px]"><span class="col-span-2 font-mono-tech text-stone-500">01</span><span class="col-span-6 font-semibold">CryptoTrader Simulator ↗</span><span class="col-span-4 text-right text-stone-600">React 19 / Vite</span></a>
                <a href="./projects/degree-verification/" class="preview-card-link py-3.5 px-1 hover:bg-black/5 rounded grid grid-cols-12 items-center min-h-[44px]"><span class="col-span-2 font-mono-tech text-stone-500">02</span><span class="col-span-6 font-semibold">Degree Verification Portal ↗</span><span class="col-span-4 text-right text-stone-600">Hyperledger / Docker</span></a>
                <a href="./projects/rustbot/" class="preview-card-link py-3.5 px-1 hover:bg-black/5 rounded grid grid-cols-12 items-center min-h-[44px]"><span class="col-span-2 font-mono-tech text-stone-500">03</span><span class="col-span-6 font-semibold">RustBot Knowledge Store ↗</span><span class="col-span-4 text-right text-stone-600">Rust / HTTP API</span></a>
                <a href="./projects/bunetto/" class="preview-card-link py-3.5 px-1 hover:bg-black/5 rounded grid grid-cols-12 items-center min-h-[44px]"><span class="col-span-2 font-mono-tech text-stone-500">04</span><span class="col-span-6 font-semibold">Bunetto Storefront ↗</span><span class="col-span-4 text-right text-stone-600">Tailwind / JS</span></a>
              </div>
            </div>
          \`;
        } else if (ed.themeKey === 'brutalist') {
          stage.innerHTML = \`
            <div class="p-5 sm:p-6 min-h-[320px] sm:min-h-[360px]" style="background:#18181b; color:#ffffff;">
              <div class="inline-block px-3 py-1 font-mono-tech text-xs font-bold uppercase text-black mb-4" style="background:\${ed.accent}; box-shadow:4px 4px 0 #ffffff;">
                CANONICAL ARCHIVE // 19 PROJECTS
              </div>
              <h3 class="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight leading-none">
                BOLD SYSTEMS.<br/>ZERO FLUFF.
              </h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <a href="./projects/amazing-giant-flowers/" class="preview-card-link p-4 bg-zinc-900 border-2 border-white min-h-[112px]" style="box-shadow:5px 5px 0 \${ed.accent};">
                  <div class="flex items-center justify-between text-xs font-mono-tech uppercase" style="color:\${ed.accent};"><span>E-Commerce</span><span>↗</span></div>
                  <div class="text-lg font-bold mt-1">Amazing Giant Flowers</div>
                  <p class="text-xs text-zinc-400 mt-1">Custom Shopify Liquid storefront, floral catalog UX, and quote-oriented ordering.</p>
                </a>
                <a href="./projects/unity-minigame-suite/" class="preview-card-link p-4 bg-zinc-900 border-2 border-white min-h-[112px]" style="box-shadow:5px 5px 0 #38bdf8;">
                  <div class="flex items-center justify-between text-xs font-mono-tech uppercase text-sky-400"><span>Game Dev FYP</span><span>↗</span></div>
                  <div class="text-lg font-bold mt-1">Unity Minigame Suite</div>
                  <p class="text-xs text-zinc-400 mt-1">Adaptive learning hub with player progress and dynamic difficulty scaling.</p>
                </a>
              </div>
            </div>
          \`;
        } else if (ed.themeKey === 'glass') {
          stage.innerHTML = \`
            <div class="p-5 sm:p-6 min-h-[320px] sm:min-h-[360px] relative overflow-hidden" style="background:radial-gradient(circle at 20% 20%, rgba(56,189,248,0.28), transparent 55%), radial-gradient(circle at 85% 80%, rgba(168,85,247,0.25), transparent 55%), #0b1022;">
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <a href="./designs/glass-systems/" class="preview-card-link sm:col-span-2 p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 hover:border-sky-300/50">
                  <div class="flex items-center justify-between">
                    <span class="text-[10px] font-mono-tech uppercase tracking-widest text-sky-300">Commit 425829f · V2.0</span>
                    <span class="text-xs text-sky-200">Open V2 ↗</span>
                  </div>
                  <h3 class="text-2xl font-semibold text-white mt-1.5">Glass, Code &amp; Systems</h3>
                  <p class="text-xs text-slate-300 mt-2 leading-relaxed">Dark glass-panel engineering dashboard with floating code snippets and ambient neural linework.</p>
                </a>
                <a href="./projects/ai-game-agents/" class="preview-card-link p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 hover:border-sky-300/50 flex flex-col justify-between">
                  <span class="text-[10px] font-mono-tech uppercase text-slate-400">AI Search</span>
                  <div class="text-2xl font-bold text-sky-300 mt-2">Minimax</div>
                  <span class="text-[11px] text-slate-300">AI Game Agents ↗</span>
                </a>
                <a href="./projects/tally/" class="preview-card-link sm:col-span-3 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 hover:border-sky-300/50 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div class="text-sm font-semibold text-white">Tally — Flutter Personal Finance Ledger ↗</div>
                    <div class="text-xs text-slate-300">SQLite local persistence · Analytics · Firebase sync</div>
                  </div>
                  <span class="px-3 py-1 rounded-full text-xs font-medium bg-sky-400/20 text-sky-200 border border-sky-300/30">Featured</span>
                </a>
              </div>
            </div>
          \`;
        } else if (ed.themeKey === 'noir') {
          stage.innerHTML = \`
            <div class="p-6 sm:p-9 min-h-[320px] sm:min-h-[360px] flex flex-col justify-between" style="background:#09090b; color:#f4f4f5;">
              <div class="flex items-center justify-between text-[10px] font-mono-tech uppercase tracking-[0.25em] text-zinc-500">
                <span>Commit f81b386 · Oct 2026</span>
                <a href="./designs/cinematic-sculpture/" class="text-amber-200/80 hover:text-amber-200 transition-colors">Open Snapshot ↗</a>
              </div>
              <div class="my-6">
                <h3 class="font-serif-display text-3xl sm:text-5xl font-medium tracking-tight text-white">
                  Sculpture in <span class="italic" style="color:\${ed.accent};">the story.</span>
                </h3>
                <p class="mt-3 text-xs sm:text-sm text-zinc-400 max-w-md leading-relaxed">
                  First near-black editorial sculptural redesign pairing a metallic AA monogram with quiet architectural typography.
                </p>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-4 border-t border-white/10 text-xs">
                <a href="./projects/cryptotrader/" class="preview-card-link p-2.5 rounded-lg bg-white/[0.03] hover:bg-white/10 border border-white/10"><div class="text-zinc-500 font-mono-tech text-[10px]">01</div><div class="text-white mt-0.5 flex items-center justify-between"><span>CryptoTrader</span><span class="text-amber-200">↗</span></div></a>
                <a href="./projects/gravipop/" class="preview-card-link p-2.5 rounded-lg bg-white/[0.03] hover:bg-white/10 border border-white/10"><div class="text-zinc-500 font-mono-tech text-[10px]">02</div><div class="text-white mt-0.5 flex items-center justify-between"><span>GraviPop Rust</span><span class="text-amber-200">↗</span></div></a>
                <a href="./projects/tally/" class="preview-card-link p-2.5 rounded-lg bg-white/[0.03] hover:bg-white/10 border border-white/10"><div class="text-zinc-500 font-mono-tech text-[10px]">03</div><div class="text-white mt-0.5 flex items-center justify-between"><span>Tally Ledger</span><span class="text-amber-200">↗</span></div></a>
              </div>
            </div>
          \`;
        } else {
          stage.innerHTML = \`
            <div class="p-6 sm:p-7 min-h-[320px] sm:min-h-[360px] flex flex-col justify-between" style="background:radial-gradient(circle at 75% 30%, rgba(245,158,11,0.2), transparent 55%), #0c0a09; color:#fafaf9;">
              <div class="flex items-center justify-between">
                <span class="px-2.5 py-1 rounded-full text-[10px] font-mono-tech uppercase tracking-widest border border-amber-400/40 text-amber-300">Current Flagship · 28fb767</span>
                <span class="text-xs font-mono-tech text-stone-400">Karachi, PK</span>
              </div>
              <div class="my-5">
                <h3 class="font-serif-display text-4xl sm:text-5xl text-white leading-tight">A Living Ribbon</h3>
                <p class="mt-2 text-xs sm:text-sm text-stone-300 max-w-md">
                  Fourteen horizontal editorial scenes carried by one continuous filament and transforming metallic Three.js ribbon.
                </p>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a href="./projects/rustbot/" class="preview-card-link p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-amber-200/20 hover:border-amber-200/50 min-h-[60px]">
                  <div class="flex items-center justify-between text-xs font-semibold text-amber-200"><span>RustBot</span><span>↗</span></div>
                  <div class="text-[11px] text-stone-400 mt-0.5">Rust HTTP Server · Local Store · Live APIs</div>
                </a>
                <a href="./projects/degree-verification/" class="preview-card-link p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-amber-200/20 hover:border-amber-200/50 min-h-[60px]">
                  <div class="flex items-center justify-between text-xs font-semibold text-amber-200"><span>Degree Verification</span><span>↗</span></div>
                  <div class="text-[11px] text-stone-400 mt-0.5">Hyperledger Fabric · Express · CouchDB</div>
                </a>
              </div>
            </div>
          \`;
        }
      }

      // ============================================================
      // 10. MODAL & UI CONTROLS
      // ============================================================
      const splashEl = document.getElementById('splash-overlay');
      const hudTop = document.getElementById('hud-top');
      const hudBottom = document.getElementById('hud-bottom');
      const reticleEl = document.getElementById('reticle');
      const promptWrap = document.getElementById('exhibit-prompt');
      const modalEl = document.getElementById('inspector-modal');

      function showToast(msg) {
        const toast = document.getElementById('toast');
        toast.textContent = msg;
        toast.classList.remove('opacity-0');
        toast.classList.add('opacity-100');
        clearTimeout(toast._timer);
        toast._timer = setTimeout(() => {
          toast.classList.remove('opacity-100');
          toast.classList.add('opacity-0');
        }, 2600);
      }

      function enterGallery(startTour = false) {
        state.pos.copy(camera.position);
        state.vel.set(0, 0, 0);
        const euler = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ');
        state.yaw = euler.y;
        state.pitch = Math.max(-0.55, Math.min(0.65, euler.x));
        state.targetYaw = state.yaw;
        state.targetPitch = state.pitch;

        state.mode = 'explore';
        splashEl.classList.add('hidden-splash');
        hudTop.classList.remove('opacity-0');
        hudBottom.classList.remove('opacity-0');
        reticleEl.classList.remove('hidden');

        if (startTour) {
          releaseMouseLock();
          state.glide = null;
          state.autoTour = true;
          state.tourTime = 0;
          updateTourUI();
          showToast('Cinematic Auto-Tour active — press WASD or click scene to take control');
        } else {
          state.autoTour = false;
          updateTourUI();
          startGlideTo(new THREE.Vector3(0, 1.78, 19.5), 0, 0.02, 0.65);
          if (!isCoarsePointer) {
            requestMouseLock();
            showToast('Mouse bound to camera — move to look, Click/E to inspect, Esc for cursor');
          }
        }
        playChime(440);
      }

      function returnToSplash() {
        releaseMouseLock();
        closeInspector(false);
        state.mode = 'splash';
        state.autoTour = false;
        updateTourUI();
        splashEl.classList.remove('hidden-splash');
        hudTop.classList.add('opacity-0');
        hudBottom.classList.add('opacity-0');
        reticleEl.classList.add('hidden');
        promptWrap.classList.add('hidden');
      }

      function openInspector(edId) {
        const ed = editions.find(e => e.id === edId);
        if (!ed) return;
        releaseMouseLock();
        state.mode = 'modal';
        state.activeModalId = edId;
        state.editMode = false;
        syncModalContent(ed);
        modalEl.classList.remove('modal-closed');
        reticleEl.classList.add('hidden');
        promptWrap.classList.add('hidden');
        highlightDock(edId);
      }

      function syncModalContent(ed) {
        document.getElementById('modal-edition-num').textContent = \`ED. \${ed.num}\`;
        document.getElementById('modal-title').textContent = ed.title;
        document.getElementById('modal-subtitle').textContent = \`\${ed.year} · \${ed.subtitle}\`;
        document.getElementById('modal-description').textContent = ed.description;
        document.getElementById('modal-aesthetic').textContent = ed.aesthetic;

        const stackEl = document.getElementById('modal-stack');
        stackEl.innerHTML = ed.stack.map(s => \`<span class="px-2.5 py-1 rounded-full text-[11px] bg-white/5 border border-white/10 text-slate-200">\${s}</span>\`).join('');

        const hlEl = document.getElementById('modal-highlights');
        hlEl.innerHTML = ed.highlights.map(h => \`<li class="flex items-start gap-2"><span class="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style="background:\${ed.accent};"></span><span>\${h}</span></li>\`).join('');

        const liveBtn = document.getElementById('btn-launch-live');
        const liveLabel = document.getElementById('label-launch-live');
        const targetUrl = ed.url || './portfolio/';
        const isExternal = /^https?:\\/\\//i.test(targetUrl);
        liveBtn.href = targetUrl;
        if (isExternal) {
          liveBtn.target = '_blank';
          liveBtn.rel = 'noopener noreferrer';
          liveLabel.textContent = 'Launch External Link';
        } else {
          liveBtn.removeAttribute('target');
          liveBtn.removeAttribute('rel');
          liveLabel.textContent = targetUrl === './portfolio/' ? 'Enter Current Flagship' : targetUrl === './projects/' ? 'Browse All 19 Projects' : 'Open Live Edition';
        }

        document.getElementById('edit-title').value = ed.title;
        document.getElementById('edit-year').value = ed.year;
        document.getElementById('edit-accent').value = ed.accent;
        document.getElementById('edit-url').value = ed.url;
        document.getElementById('edit-desc').value = ed.description;

        document.getElementById('modal-info-view').classList.toggle('hidden', state.editMode);
        document.getElementById('modal-edit-form').classList.toggle('hidden', !state.editMode);

        renderLivePreview(ed);
      }

      function closeInspector(reLockMouse = false) {
        if (state.mode !== 'modal') return;
        modalEl.classList.add('modal-closed');
        state.mode = 'explore';
        state.activeModalId = null;
        reticleEl.classList.remove('hidden');
        if (reLockMouse && !isCoarsePointer) {
          requestMouseLock();
        }
      }

      function stepModal(delta) {
        if (!state.activeModalId) return;
        const idx = editions.findIndex(e => e.id === state.activeModalId);
        const nextIdx = (idx + delta + editions.length) % editions.length;
        const nextEd = editions[nextIdx];
        state.activeModalId = nextEd.id;
        state.editMode = false;
        syncModalContent(nextEd);
        const obj = exhibitObjects.find(o => o.edition.id === nextEd.id);
        if (obj) startGlideTo(obj.viewPos, obj.viewYaw, 0.08, 0.9);
        highlightDock(nextEd.id);
        playChime(delta > 0 ? 587.33 : 493.88);
      }

      function updateTourUI() {
        const iconPlay = document.getElementById('icon-tour-play');
        const iconPause = document.getElementById('icon-tour-pause');
        const label = document.getElementById('label-tour');
        const btn = document.getElementById('btn-toggle-tour');
        if (state.autoTour) {
          iconPlay.classList.add('hidden');
          iconPause.classList.remove('hidden');
          iconPause.classList.add('inline-flex');
          label.textContent = 'Touring';
          btn.classList.add('border-amber-200/50', 'text-amber-200');
        } else {
          iconPause.classList.add('hidden');
          iconPause.classList.remove('inline-flex');
          iconPlay.classList.remove('hidden');
          label.textContent = 'Auto-Tour';
          btn.classList.remove('border-amber-200/50', 'text-amber-200');
        }
      }

      function updateAudioUI() {
        const iconOff = document.getElementById('icon-audio-off');
        const iconOn = document.getElementById('icon-audio-on');
        const label = document.getElementById('label-audio');
        const btn = document.getElementById('btn-toggle-audio');
        if (state.audioEnabled) {
          iconOff.classList.add('hidden');
          iconOn.classList.remove('hidden');
          iconOn.classList.add('inline-flex');
          label.textContent = 'Ambient On';
          btn.classList.add('text-amber-200', 'border-amber-200/40');
        } else {
          iconOn.classList.add('hidden');
          iconOn.classList.remove('inline-flex');
          iconOff.classList.remove('hidden');
          label.textContent = 'Sound Off';
          btn.classList.remove('text-amber-200', 'border-amber-200/40');
        }
      }

      function buildDock() {
        const dock = document.getElementById('edition-dock');
        dock.innerHTML = '';

        const overviewBtn = document.createElement('button');
        overviewBtn.className = 'px-3 py-1.5 rounded-full text-[11px] font-mono-tech uppercase tracking-wider text-slate-300 hover:text-white hover:bg-white/10 transition-colors shrink-0';
        overviewBtn.textContent = 'Hall';
        overviewBtn.dataset.dockId = 'hall';
        overviewBtn.addEventListener('click', () => {
          closeInspector(false);
          startGlideTo(new THREE.Vector3(0, 1.8, 20), 0, 0.02, 1.15);
          highlightDock('hall');
        });
        dock.appendChild(overviewBtn);

        editions.forEach(ed => {
          const btn = document.createElement('button');
          btn.className = 'flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-all shrink-0';
          btn.dataset.dockId = ed.id;
          btn.innerHTML = \`<span class="w-1.5 h-1.5 rounded-full" style="background:\${ed.accent};"></span><span class="font-mono-tech text-[10px] opacity-75">\${ed.num}</span><span class="hidden md:inline">\${ed.year}</span>\`;
          btn.addEventListener('click', () => focusExhibit(ed.id, true));
          dock.appendChild(btn);
        });
      }

      function highlightDock(activeId) {
        document.querySelectorAll('#edition-dock button').forEach(btn => {
          const isMatch = btn.dataset.dockId === activeId;
          btn.classList.toggle('bg-amber-200/20', isMatch);
          btn.classList.toggle('text-amber-200', isMatch);
        });
      }

      buildDock();

      // ============================================================
      // 11. EVENT LISTENERS (KEYBOARD, POINTER, TOUCH, RAYCASTING)
      // ============================================================
      document.getElementById('btn-enter-gallery').addEventListener('click', () => enterGallery(false));
      document.getElementById('btn-start-tour').addEventListener('click', () => enterGallery(true));
      document.getElementById('btn-back-splash').addEventListener('click', returnToSplash);

      const mouseLockBtn = document.getElementById('btn-mouse-lock');
      if (mouseLockBtn) {
        mouseLockBtn.addEventListener('click', () => {
          if (state.isPointerLocked) {
            releaseMouseLock();
          } else {
            if (state.mode === 'modal') closeInspector(false);
            state.autoTour = false;
            updateTourUI();
            requestMouseLock();
          }
        });
      }

      document.getElementById('btn-toggle-tour').addEventListener('click', () => {
        if (state.mode === 'modal') closeInspector(false);
        state.autoTour = !state.autoTour;
        if (state.autoTour) releaseMouseLock();
        state.glide = null;
        updateTourUI();
        showToast(state.autoTour ? 'Cinematic Auto-Tour resumed' : 'Manual walkthrough mode');
      });

      document.getElementById('btn-toggle-cinema').addEventListener('click', () => {
        state.cinemaBars = !state.cinemaBars;
        document.body.classList.toggle('cinema-bars', state.cinemaBars);
        document.getElementById('btn-toggle-cinema').classList.toggle('text-amber-200', state.cinemaBars);
      });

      document.getElementById('btn-toggle-audio').addEventListener('click', () => {
        setAudioEnabled(!state.audioEnabled);
      });

      document.getElementById('btn-toggle-help').addEventListener('click', () => {
        document.getElementById('help-popover').classList.toggle('hidden');
      });
      document.getElementById('btn-close-help').addEventListener('click', () => {
        document.getElementById('help-popover').classList.add('hidden');
      });

      document.getElementById('btn-prompt-inspect').addEventListener('click', () => {
        const targetId = state.hoveredId || state.nearestId;
        if (targetId) focusExhibit(targetId, true);
      });

      document.getElementById('btn-modal-close').addEventListener('click', () => closeInspector(false));
      document.getElementById('btn-modal-walk').addEventListener('click', () => closeInspector(true));
      document.getElementById('btn-modal-prev').addEventListener('click', () => stepModal(-1));
      document.getElementById('btn-modal-next').addEventListener('click', () => stepModal(1));

      document.getElementById('btn-modal-edit-toggle').addEventListener('click', () => {
        state.editMode = !state.editMode;
        const ed = editions.find(e => e.id === state.activeModalId);
        if (ed) syncModalContent(ed);
      });

      document.getElementById('btn-reset-exhibit').addEventListener('click', () => {
        const idx = editions.findIndex(e => e.id === state.activeModalId);
        if (idx === -1) return;
        editions[idx] = Object.assign({}, DEFAULT_EDITIONS[idx]);
        saveEditions(editions);
        refreshExhibitTextures(editions[idx].id);
        buildDock();
        syncModalContent(editions[idx]);
        showToast('Exhibit reset to default');
      });

      document.getElementById('modal-edit-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const ed = editions.find(x => x.id === state.activeModalId);
        if (!ed) return;
        ed.title = document.getElementById('edit-title').value.trim() || ed.title;
        ed.year = document.getElementById('edit-year').value.trim() || ed.year;
        ed.accent = document.getElementById('edit-accent').value || ed.accent;
        ed.url = document.getElementById('edit-url').value.trim() || ed.url;
        ed.description = document.getElementById('edit-desc').value.trim() || ed.description;
        saveEditions(editions);
        refreshExhibitTextures(ed.id);
        buildDock();
        state.editMode = false;
        syncModalContent(ed);
        showToast('3D Monolith & metadata updated');
      });

      modalEl.addEventListener('click', (e) => {
        if (e.target === modalEl) closeInspector(false);
      });

      window.addEventListener('keydown', (e) => {
        if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
        const k = e.key.toLowerCase();
        state.keys[k] = true;

        if (k === 'escape') {
          if (state.mode === 'modal') closeInspector(false);
          document.getElementById('help-popover').classList.add('hidden');
          return;
        }

        if (state.mode === 'modal') {
          if (e.key === 'ArrowRight') stepModal(1);
          if (e.key === 'ArrowLeft') stepModal(-1);
          return;
        }

        if (state.mode === 'explore') {
          if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) {
            if (state.autoTour) {
              state.autoTour = false;
              updateTourUI();
            }
            state.glide = null;
          }
          if (k === 'e' || k === 'enter') {
            const targetId = state.hoveredId || state.nearestId;
            if (targetId) focusExhibit(targetId, true);
          }
          if (['1', '2', '3', '4', '5', '6'].includes(k)) {
            const idx = parseInt(k, 10) - 1;
            if (editions[idx]) focusExhibit(editions[idx].id, true);
          }
        }
      });

      window.addEventListener('keyup', (e) => {
        state.keys[e.key.toLowerCase()] = false;
      });

      // Touch / On-screen D-Pad
      document.querySelectorAll('.dpad-btn').forEach(btn => {
        const dir = btn.dataset.move;
        const start = (ev) => {
          ev.preventDefault();
          state.touchMove[dir] = true;
          btn.classList.add('pressed');
          if (state.autoTour) { state.autoTour = false; updateTourUI(); }
          state.glide = null;
        };
        const stop = () => {
          state.touchMove[dir] = false;
          btn.classList.remove('pressed');
        };
        btn.addEventListener('pointerdown', start);
        btn.addEventListener('pointerup', stop);
        btn.addEventListener('pointerleave', stop);
        btn.addEventListener('pointercancel', stop);
      });

      // Pointer Drag Look (mobile + unlocked desktop) & Locked Reticle Click
      const raycaster = new THREE.Raycaster();
      const pointerNDC = new THREE.Vector2();

      function updatePointerNDC(ev) {
        const rect = renderer.domElement.getBoundingClientRect();
        pointerNDC.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
        pointerNDC.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
      }

      container.addEventListener('pointerdown', (ev) => {
        if (state.mode !== 'explore') return;

        // While pointer-locked, left click inspects the aimed monolith via center reticle
        if (state.isPointerLocked) {
          if (ev.button === 0 && state.hoveredId) {
            focusExhibit(state.hoveredId, true);
          }
          return;
        }

        state.isDragging = true;
        state.dragMoved = false;
        state.lastPointer.x = ev.clientX;
        state.lastPointer.y = ev.clientY;
        container.classList.add('dragging');
      });

      window.addEventListener('pointermove', (ev) => {
        if (state.mode !== 'explore' || state.isPointerLocked) return;
        updatePointerNDC(ev);

        if (state.isDragging) {
          const dx = ev.clientX - state.lastPointer.x;
          const dy = ev.clientY - state.lastPointer.y;
          if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
            state.dragMoved = true;
            if (state.autoTour) { state.autoTour = false; updateTourUI(); }
            state.glide = null;
          }
          state.targetYaw -= dx * 0.0042;
          state.targetPitch = Math.max(-0.55, Math.min(0.65, state.targetPitch - dy * 0.0036));
          state.lastPointer.x = ev.clientX;
          state.lastPointer.y = ev.clientY;
        } else if (ev.pointerType !== 'touch') {
          raycaster.setFromCamera(pointerNDC, camera);
          const hits = raycaster.intersectObjects(clickableMeshes, false);
          if (hits.length > 0 && hits[0].distance < 22) {
            const hitId = hits[0].object.userData.editionId;
            if (state.hoveredId !== hitId) {
              state.hoveredId = hitId;
              playChime(659.25);
            }
            container.classList.add('hover-exhibit');
          } else {
            state.hoveredId = null;
            container.classList.remove('hover-exhibit');
          }
        }
      });

      window.addEventListener('pointerup', (ev) => {
        if (!state.isDragging) return;
        state.isDragging = false;
        container.classList.remove('dragging');

        if (!state.dragMoved && state.mode === 'explore') {
          updatePointerNDC(ev);
          raycaster.setFromCamera(pointerNDC, camera);
          const hits = raycaster.intersectObjects(clickableMeshes, false);
          if (hits.length > 0 && hits[0].distance < 26) {
            const hitId = hits[0].object.userData.editionId;
            focusExhibit(hitId, true);
          } else if (ev.pointerType === 'mouse' && !isCoarsePointer) {
            // Clicking open gallery space on desktop re-binds mouse cursor to camera
            if (state.autoTour) {
              state.autoTour = false;
              updateTourUI();
            }
            requestMouseLock();
          }
        }
      });

      window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      });

      const clock = new THREE.Clock();
      document.addEventListener('visibilitychange', () => {
        state.isTabHidden = document.hidden;
        if (!document.hidden) {
          clock.getDelta();
        }
      });

      // ============================================================
      // 12. MINIMAP FLOORPLAN RADAR
      // ============================================================
      const minimapCanvas = document.getElementById('minimap-canvas');
      const mCtx = minimapCanvas ? minimapCanvas.getContext('2d') : null;
      const radarCoords = document.getElementById('radar-coords');

      function drawMinimap() {
        if (!mCtx) return;
        const w = minimapCanvas.width;
        const h = minimapCanvas.height;
        mCtx.clearRect(0, 0, w, h);

        mCtx.fillStyle = 'rgba(255, 255, 255, 0.04)';
        mCtx.fillRect(10, 6, w - 20, h - 12);
        mCtx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
        mCtx.lineWidth = 1;
        mCtx.strokeRect(10, 6, w - 20, h - 12);

        const mapX = (x) => 10 + ((x + 9) / 18) * (w - 20);
        const mapZ = (z) => 6 + ((z + 28) / 56) * (h - 12);

        exhibitObjects.forEach(obj => {
          const ex = mapX(obj.edition.wing === 'left' ? -8.2 : 8.2);
          const ez = mapZ(obj.edition.zPos);
          mCtx.fillStyle = obj.edition.accent;
          mCtx.fillRect(ex - 2, ez - 6, 4, 12);
        });

        solidObstacles.forEach(obs => {
          const rx = mapX(obs.minX);
          const rz = mapZ(obs.minZ);
          const rw = Math.max(3, mapX(obs.maxX) - rx);
          const rh = Math.max(3, mapZ(obs.maxZ) - rz);
          mCtx.fillStyle = obs.type === 'pedestal' ? 'rgba(240, 201, 125, 0.55)' : 'rgba(148, 163, 184, 0.42)';
          mCtx.fillRect(rx, rz, rw, rh);
        });

        const px = mapX(state.pos.x);
        const pz = mapZ(state.pos.z);

        mCtx.save();
        mCtx.translate(px, pz);
        mCtx.rotate(-state.yaw);
        mCtx.beginPath();
        mCtx.moveTo(0, 0);
        mCtx.lineTo(-9, -16);
        mCtx.lineTo(9, -16);
        mCtx.closePath();
        mCtx.fillStyle = 'rgba(240, 201, 125, 0.22)';
        mCtx.fill();
        mCtx.restore();

        mCtx.beginPath();
        mCtx.arc(px, pz, 3.2, 0, Math.PI * 2);
        mCtx.fillStyle = '#f0c97d';
        mCtx.fill();

        if (radarCoords) {
          if (state.pos.z > 15) radarCoords.textContent = 'HALL · ENTRANCE';
          else if (state.pos.z > 4) radarCoords.textContent = 'WING I · ED 01–02';
          else if (state.pos.z > -9) radarCoords.textContent = 'WING II · ED 03–04';
          else radarCoords.textContent = 'WING III · ED 05–06';
        }
      }

      // ============================================================
      // 13. MAIN CINEMATIC RENDER & ANIMATION LOOP
      // ============================================================
      function animate() {
        requestAnimationFrame(animate);
        if (state.isTabHidden) return;

        const dt = Math.min(clock.getDelta(), 0.05);
        const elapsed = clock.elapsedTime;

        for (let i = 0; i < pedestalSculptures.length; i++) {
          const s = pedestalSculptures[i];
          s.pivot.rotation.y = elapsed * 0.45 + s.phase;
          s.pivot.rotation.x = Math.sin(elapsed * 0.5 + s.phase) * 0.18;
          s.pivot.position.y = s.baseY + Math.sin(elapsed * 1.15 + s.phase) * 0.08;
        }

        if (state.mode !== 'modal' || state.glide) {
          const posArr = dustParticles.geometry.attributes.position.array;
          for (let i = 0; i < particleCount; i++) {
            posArr[i * 3 + 1] += Math.sin(elapsed * 0.4 + i) * 0.0012;
          }
          dustParticles.geometry.attributes.position.needsUpdate = true;
        }

        if (state.mode === 'splash') {
          const t = elapsed * 0.14;
          camera.position.set(Math.sin(t) * 2.2, 2.35 + Math.sin(t * 1.4) * 0.25, 22 - (Math.sin(t * 0.6) + 1) * 4.5);
          camera.lookAt(0, 2.5, -10);
        } else if (state.glide) {
          state.glide.t += dt / state.glide.duration;
          const u = Math.min(1, state.glide.t);
          const ease = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;

          state.pos.lerpVectors(state.glide.startPos, state.glide.endPos, ease);
          state.yaw = state.glide.startYaw + (state.glide.endYaw - state.glide.startYaw) * ease;
          state.pitch = state.glide.startPitch + (state.glide.endPitch - state.glide.startPitch) * ease;
          state.targetYaw = state.yaw;
          state.targetPitch = state.pitch;

          camera.position.copy(state.pos);
          camera.rotation.set(state.pitch, state.yaw, 0);

          if (u >= 1) {
            const cb = state.glide.onComplete;
            state.glide = null;
            if (cb) cb();
          }
        } else if (state.autoTour && state.mode === 'explore') {
          state.tourTime += dt * 0.22;
          const cycle = state.tourTime % (Math.PI * 2);
          const z = 18 - ((state.tourTime * 3.2) % 40);
          const x = Math.sin(cycle * 2) * 2.6;
          state.pos.set(x, 1.9 + Math.sin(elapsed * 0.8) * 0.08, z);
          resolveObstacleCollisions(state.pos, 0.9);
          const lookX = Math.sin(cycle * 2 + 0.6) * 5.5;
          camera.position.copy(state.pos);
          camera.lookAt(lookX, 2.55, z - 6.5);
          state.yaw = camera.rotation.y;
          state.pitch = camera.rotation.x;
          state.targetYaw = state.yaw;
          state.targetPitch = state.pitch;
        } else if (state.mode === 'explore') {
          // Smooth mouse-bound / drag first-person camera rotation
          const lookLerp = state.isPointerLocked ? Math.min(1, dt * 24) : Math.min(1, dt * 12);
          state.yaw += (state.targetYaw - state.yaw) * lookLerp;
          state.pitch += (state.targetPitch - state.pitch) * lookLerp;

          const moveF = (state.keys['w'] || state.keys['arrowup'] || state.touchMove.forward ? 1 : 0) -
                        (state.keys['s'] || state.keys['arrowdown'] || state.touchMove.backward ? 1 : 0);
          const moveR = (state.keys['d'] || state.keys['arrowright'] || state.touchMove.right ? 1 : 0) -
                        (state.keys['a'] || state.keys['arrowleft'] || state.touchMove.left ? 1 : 0);

          const speed = 6.2;
          forwardVec.set(-Math.sin(state.yaw), 0, -Math.cos(state.yaw));
          rightVec.set(Math.cos(state.yaw), 0, -Math.sin(state.yaw));

          wishDir.set(0, 0, 0);
          wishDir.addScaledVector(forwardVec, moveF);
          wishDir.addScaledVector(rightVec, moveR);
          if (wishDir.lengthSq() > 0) wishDir.normalize();

          state.vel.lerp(wishDir.multiplyScalar(speed), Math.min(1, dt * 9));
          state.pos.addScaledVector(state.vel, dt);

          state.pos.x = Math.max(-6.2, Math.min(6.2, state.pos.x));
          state.pos.z = Math.max(-24.2, Math.min(24.8, state.pos.z));
          resolveObstacleCollisions(state.pos, 0.58);

          const horizSpeed = Math.hypot(state.vel.x, state.vel.z);
          if (horizSpeed > 0.25) {
            state.bobPhase += dt * 7.5;
          }
          const bobY = Math.sin(state.bobPhase) * 0.045 * Math.min(1, horizSpeed / 4);
          camera.position.set(state.pos.x, 1.78 + bobY, state.pos.z);
          camera.rotation.set(state.pitch, state.yaw, 0);

          // Center-reticle raycast when mouse cursor is bound via Pointer Lock
          if (state.isPointerLocked) {
            raycaster.setFromCamera(centerNDC, camera);
            const hits = raycaster.intersectObjects(clickableMeshes, false);
            if (hits.length > 0 && hits[0].distance < 22) {
              const hitId = hits[0].object.userData.editionId;
              if (state.hoveredId !== hitId) {
                state.hoveredId = hitId;
                playChime(659.25);
              }
            } else {
              state.hoveredId = null;
            }
          }
        }

        // Proximity & Hover highlight for all 6 exhibits
        let closestId = null;
        let closestDist = 9.5;
        exhibitObjects.forEach(obj => {
          const dist = state.pos.distanceTo(obj.worldCenter);
          if (dist < closestDist) {
            closestDist = dist;
            closestId = obj.edition.id;
          }
          const isHighlighted = (state.hoveredId === obj.edition.id) || (closestId === obj.edition.id && dist < 8.5);
          const targetOpacity = isHighlighted ? 0.92 : 0.28;
          obj.rimMat.opacity += (targetOpacity - obj.rimMat.opacity) * Math.min(1, dt * 8);
          obj.accentLight.intensity += ((isHighlighted ? 1.55 : 0.85) - obj.accentLight.intensity) * Math.min(1, dt * 6);
        });
        state.nearestId = closestId;

        if (state.mode === 'explore') {
          const focusId = state.hoveredId || state.nearestId;
          reticleEl.classList.toggle('active', Boolean(state.hoveredId));
          if (focusId) {
            const ed = editions.find(e => e.id === focusId);
            if (ed) {
              document.getElementById('prompt-badge').textContent = \`ED. \${ed.num}\`;
              document.getElementById('prompt-title').textContent = \`\${ed.title} (\${ed.year})\`;
              promptWrap.classList.remove('hidden', 'opacity-0', 'translate-y-2');
              promptWrap.classList.add('opacity-100', 'translate-y-0');
            }
          } else {
            promptWrap.classList.add('opacity-0', 'translate-y-2');
            promptWrap.classList.remove('opacity-100', 'translate-y-0');
          }
          drawMinimap();
        }

        renderer.render(scene, camera);
      }

      window.addEventListener('load', () => {
        if (window.lucide) lucide.createIcons();
        updateMouseLockUI();
        animate();
      });
    })();
  </script>
</body>
</html>
`;
