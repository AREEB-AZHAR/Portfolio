import * as THREE from "three";
import { createStrandGeometry } from "./strand-geometry.mjs";

export async function createContinuousSculpture(host, environment) {
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
  renderer.toneMappingExposure = 1.2;
  renderer.domElement.setAttribute("aria-hidden", "true");
  host.append(renderer.domElement);
  const scene = new THREE.Scene();
  scene.environment = environment;
  const camera = new THREE.PerspectiveCamera(33, 1, 0.1, 100);
  camera.position.set(0, 0, 10.5);
  const { geometry, sequence } = createStrandGeometry();
  const material = new THREE.MeshStandardMaterial({
    color: 0x44463e,
    metalness: 1,
    roughness: 0.28,
    envMapIntensity: 1.3,
  });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  for (const [color, intensity, position] of [
    [0xe4e1d9, 6, [-4, 4, 3]],
    [0x939989, 3, [5, -1, 1]],
    [0xffffff, 3, [0, 5, -3]],
  ]) {
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(...position);
    scene.add(light);
  }
  let ready = false,
    visible = true,
    paused = false,
    reduced = false,
    frame = 0,
    last = 0;
  function render(time) {
    const phase = Math.max(
      0,
      Math.min(sequence.length - 1, Number(host.dataset.sceneProgress || 0)),
    );
    const index = Math.min(sequence.length - 2, Math.floor(phase));
    const u = phase - index,
      blend = u * u * (3 - 2 * u);
    const from = sequence[index],
      to = sequence[index + 1];
    mesh.morphTargetInfluences.fill(0);
    if (from > 0) mesh.morphTargetInfluences[from - 1] += 1 - blend;
    if (to > 0) mesh.morphTargetInfluences[to - 1] += blend;
    mesh.rotation.set(
      -0.12 + Math.sin(phase * 0.5) * 0.12,
      -0.4 - Math.sin(phase * 0.65) * 0.3,
      -0.12 + Math.sin(phase * 0.45) * 0.12,
    );
    mesh.position.set(
      0.55 - (phase / (sequence.length - 1)) * 1.1,
      0.35 -
        (phase / (sequence.length - 1)) * 0.65 +
        Math.sin(time * 0.00012) * 0.025,
      0,
    );
    const heroWeight = 1 - Math.min(1, phase);
    material.color.setRGB(
      0.18 + heroWeight * 0.07,
      0.19 + heroWeight * 0.07,
      0.16 + heroWeight * 0.06,
    );
    host.style.opacity = String(0.34 + heroWeight * 0.26);
    renderer.render(scene, camera);
    host.dataset.morphPhase = phase.toFixed(4);
    host.dataset.morphFrom = String(from);
    host.dataset.morphTo = String(to);
    host.dataset.morphBlend = blend.toFixed(4);
  }
  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
  }
  function loop(time) {
    frame = 0;
    if (!ready || !visible || paused || reduced || document.hidden) return;
    if (time - last > (innerWidth < 768 ? 30 : 15)) {
      render(time);
      last = time;
    }
    frame = requestAnimationFrame(loop);
  }
  function start() {
    if (ready && !frame && visible && !paused && !reduced && !document.hidden)
      frame = requestAnimationFrame(loop);
  }
  function resize() {
    const w = host.clientWidth,
      h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.z = w < 600 ? 13.5 : 10.5;
    camera.updateProjectionMatrix();
    mesh.scale.setScalar(w < 600 ? 0.82 : 1.1);
    if (ready) render(performance.now());
  }
  new ResizeObserver(resize).observe(host);
  new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    visible ? start() : stop();
  }).observe(host);
  document.addEventListener("visibilitychange", () =>
    document.hidden ? stop() : start(),
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
  resize();
  await renderer.compileAsync(scene, camera);
  ready = true;
  render(0);
  host.classList.add("has-webgl");
  start();
  host.dataset.meshCount = "1";
  host.dataset.morphTargetCount = String(sequence.length);
  return {
    setReduced(value) {
      reduced = value;
      value ? stop() : start();
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
