import * as THREE from "three";
let studioPromise;
export function loadStudio() {
  studioPromise ||= fetch(
    `${import.meta.env.BASE_URL}lighting/studio.cubeuv.bin.gz`,
  ).then(async (response) => {
    if (!response.ok) throw new Error("Studio lighting unavailable");
    const payload = await response.arrayBuffer();
    const magic = new Uint8Array(payload, 0, 2);
    // Some static hosts transparently decode .gz responses; others serve the
    // compressed bytes. Inspect the payload to avoid double decompression.
    const bytes =
      magic[0] === 31 && magic[1] === 139
        ? await new Response(
            new Blob([payload])
              .stream()
              .pipeThrough(new DecompressionStream("gzip")),
          ).arrayBuffer()
        : payload;
    const header = new DataView(bytes);
    const texture = new THREE.DataTexture(
      new Uint16Array(bytes, 8),
      header.getUint32(0, true),
      header.getUint32(4, true),
      THREE.RGBAFormat,
      THREE.HalfFloatType,
    );
    texture.mapping = THREE.CubeUVReflectionMapping;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    texture.colorSpace = THREE.LinearSRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  });
  return studioPromise;
}

export async function createSculpture(host) {
  // Lighting is baked once at development time, not synchronously on each visit.
  // Keep the static sculpture visible while its small asset loads asynchronously.
  const environment = await loadStudio();
  if (host.dataset.variant === "continuous") {
    const { createContinuousSculpture } = await import(
      "./continuous-sculpture.js"
    );
    return createContinuousSculpture(host, environment);
  }
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "low-power",
    });
  } catch {
    return null;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setClearColor(0x090909, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;
  host.append(renderer.domElement);
  renderer.domElement.setAttribute("aria-hidden", "true");
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(33, 1, 0.1, 100);
  camera.position.set(0, 0.15, 9.5);
  scene.environment = environment;
  const shape = new THREE.Shape();
  shape.moveTo(-1.05, -1.25);
  shape.lineTo(-0.2, 1.25);
  shape.quadraticCurveTo(0, 1.58, 0.2, 1.25);
  shape.lineTo(1.05, -1.25);
  shape.lineTo(0.55, -1.25);
  shape.lineTo(0.31, -0.48);
  shape.lineTo(-0.31, -0.48);
  shape.lineTo(-0.55, -1.25);
  shape.closePath();
  const hole = new THREE.Path();
  hole.moveTo(-0.19, -0.02);
  hole.lineTo(0.19, -0.02);
  hole.lineTo(0, 0.67);
  hole.closePath();
  shape.holes.push(hole);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.32,
    bevelEnabled: true,
    bevelThickness: 0.075,
    bevelSize: 0.055,
    bevelSegments: 6,
    curveSegments: 20,
  });
  geometry.center();
  const material = new THREE.MeshStandardMaterial({
    color: 0x30322e,
    metalness: 1,
    roughness: 0.22,
    envMapIntensity: 1.7,
  });
  const group = new THREE.Group();
  const first = new THREE.Mesh(geometry, material);
  const second = new THREE.Mesh(geometry, material);
  first.position.set(-0.55, 0.12, 0.2);
  second.position.set(0.55, -0.13, -0.25);
  first.rotation.y = -0.25;
  second.rotation.y = 0.25;
  group.add(first, second);
  const principles = host.dataset.variant === "principles";
  const forms = [];
  if (principles) {
    group.remove(first, second);
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.15, 0.24, 24, 96),
      material,
    );
    const frame = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const beam = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 0.25, 0.4),
        material,
      );
      if (i < 2) beam.position.y = i === 0 ? 1 : -1;
      else {
        beam.rotation.z = Math.PI / 2;
        beam.position.x = i === 2 ? 1 : -1;
      }
      frame.add(beam);
    }
    const connected = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const link = new THREE.Mesh(
        new THREE.TorusGeometry(0.72, 0.13, 16, 64),
        material,
      );
      link.position.x = (i - 1) * 0.9;
      link.rotation.y = ((i % 2) * Math.PI) / 2;
      connected.add(link);
    }
    forms.push(ring, frame, connected);
    forms.forEach((form) => {
      const surface = material.clone();
      surface.transparent = true;
      surface.depthWrite = false;
      form.userData.surface = surface;
      form.traverse((node) => {
        if (node.isMesh) node.material = surface;
      });
    });
    group.add(...forms);
  }
  group.rotation.set(-0.18, -0.45, -0.2);
  group.scale.setScalar(1.32);
  scene.add(group);
  const rim = new THREE.DirectionalLight(0xe4e1d9, 6);
  rim.position.set(-4, 4, 3);
  scene.add(rim);
  const fill = new THREE.DirectionalLight(0x939989, 3);
  fill.position.set(5, -1, 1);
  scene.add(fill);
  const top = new THREE.DirectionalLight(0xffffff, 3);
  top.position.set(0, 5, -3);
  scene.add(top);
  let ready = false;
  let visible = true,
    paused = false,
    reduced = false,
    frame = 0,
    last = 0;
  let pointerX = 0,
    pointerY = 0;
  const hero = host.closest(".hero-story") || host.closest(".approach-story");
  const observer = new IntersectionObserver(
    (entries) => {
      visible = entries[0].isIntersecting;
      if (visible) start();
      else stop();
    },
    { rootMargin: "100px" },
  );
  observer.observe(host);
  const resize = new ResizeObserver(() => {
    const width = host.clientWidth,
      height = host.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    camera.position.z = width < 600 ? 11.5 : 9.5;
    group.scale.setScalar(width < 600 ? 0.94 : 1.32);
    if (ready) render(performance.now());
  });
  resize.observe(host);
  const render = (time) => {
    const progress =
      host.dataset.sceneProgress !== undefined && !reduced
        ? Number(host.dataset.sceneProgress)
        : hero && !reduced
          ? THREE.MathUtils.clamp(
              -hero.getBoundingClientRect().top /
                Math.max(1, hero.offsetHeight - innerHeight),
              0,
              1,
            )
          : 0;
    const t = reduced ? 0 : time * 0.00015;
    group.rotation.y =
      -0.5 + progress * Math.PI * 1.35 + Math.sin(t) * 0.055 + pointerX * 0.07;
    group.rotation.x =
      -0.15 + Math.sin(progress * Math.PI) * 0.4 + pointerY * 0.04;
    group.rotation.z = -0.18 + Math.sin(progress * Math.PI * 2) * 0.15;
    first.position.x = -0.55 - progress * 0.3;
    second.position.x = 0.55 + progress * 0.3;
    first.position.z = 0.2 + Math.sin(progress * Math.PI) * 0.6;
    second.position.z = -0.25 - Math.sin(progress * Math.PI) * 0.6;
    group.position.y = Math.sin(t) * 0.04;
    if (principles) {
      const phase = progress * 2;
      forms.forEach((form, i) => {
        const weight = Math.max(0, 1 - Math.abs(phase - i));
        form.visible = weight > 0.01;
        form.userData.surface.opacity = weight;
        form.scale.setScalar(0.72 + weight * 0.28);
      });
      group.position.x = 1 - progress * 2;
    }
    rim.intensity = 6 + Math.sin(progress * Math.PI) * 2;
    fill.intensity = 3 + progress * 1.5;
    renderer.render(scene, camera);
  };
  function loop(time) {
    frame = 0;
    if (!visible || paused || document.hidden || reduced) return;
    if (time - last > (host.clientWidth < 600 ? 30 : 15)) {
      render(time);
      last = time;
    }
    frame = requestAnimationFrame(loop);
  }
  function start() {
    if (ready && !frame && !paused && visible && !document.hidden && !reduced)
      frame = requestAnimationFrame(loop);
  }
  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
  }
  document.addEventListener("visibilitychange", () =>
    document.hidden ? stop() : start(),
  );
  window.addEventListener(
    "pointermove",
    (event) => {
      if (event.pointerType === "mouse") {
        pointerX = event.clientX / innerWidth - 0.5;
        pointerY = event.clientY / innerHeight - 0.5;
      }
    },
    { passive: true },
  );
  renderer.domElement.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    stop();
    host.classList.remove("has-webgl");
  });
  renderer.domElement.addEventListener("webglcontextrestored", () => {
    host.classList.add("has-webgl");
    start();
  });
  const width = host.clientWidth,
    height = host.clientHeight;
  renderer.setSize(width, height, false);
  camera.aspect = width / Math.max(1, height);
  camera.updateProjectionMatrix();
  // Let parallel shader compilation complete before the first visible frame.
  await renderer.compileAsync(scene, camera);
  ready = true;
  render(0);
  host.classList.add("has-webgl");
  start();
  return {
    setReduced(value) {
      reduced = value;
      if (value) {
        stop();
        // Static mode uses the SVG, and does not submit another GPU frame.
      } else start();
    },
    pause() {
      paused = true;
      stop();
    },
    resume() {
      paused = false;
      start();
    },
  };
}
