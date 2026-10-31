import * as THREE from "three";
import { createStrandGeometry } from "./strand-geometry.mjs";
import { createWindSculpture } from "./wind-sculpture.mjs";
import { storyArtPresence } from "./living-strand.mjs";
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
  renderer.toneMappingExposure = 1.07;
  renderer.domElement.setAttribute("aria-hidden", "true");
  host.append(renderer.domElement);
  const scene = new THREE.Scene();
  scene.environment = environment;
  const camera = new THREE.OrthographicCamera(-6, 6, 4, -4, 0.1, 100);
  camera.position.z = 10;
  const { geometry, update, centerline } = createStrandGeometry();
  const material = new THREE.MeshStandardMaterial({
    color: 0x74786f,
    metalness: 0.9,
    roughness: 0.38,
    envMapIntensity: 1.05,
    transparent: true,
  });
  let shader;
  material.onBeforeCompile = (program) => {
    shader = program;
    program.uniforms.wireFlow = { value: 0 };
    program.vertexShader = "varying float vWireU;\n" + program.vertexShader;
    program.vertexShader = program.vertexShader.replace(
      "#include <uv_vertex>",
      "#include <uv_vertex>\nvWireU=uv.x;",
    );
    program.fragmentShader =
      "varying float vWireU;uniform float wireFlow;\n" + program.fragmentShader;
    program.fragmentShader = program.fragmentShader.replace(
      "#include <color_fragment>",
      "#include <color_fragment>\nfloat energy=pow(0.5+0.5*cos(6.2831853*(vWireU+wireFlow)),24.0);diffuseColor.rgb*=0.37+energy*0.8;",
    );
  };
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  const sculpture = createWindSculpture();
  scene.add(sculpture.group);
  for (const [color, intensity, position] of [
    [0xe4e1d9, 5, [-4, 4, 3]],
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
    last = 0,
    aspect = 1.44;
  function render(time) {
    const phase = Number(host.dataset.sceneProgress || 0);
    const seconds = time * 0.001;
    const presence = storyArtPresence(phase);
    material.opacity = presence;
    mesh.visible = presence > 0.005;
    update(phase, aspect, seconds);
    const wind = sculpture.update(phase, aspect, seconds, reduced);
    if (shader) shader.uniforms.wireFlow.value = phase * 0.8 + time * 0.00009;
    renderer.render(scene, camera);
    host.dataset.morphPhase = phase.toFixed(4);
    // A real vertex readback sample for debugging, not a replacement for visual QA.
    host.dataset.wireVertex = `${centerline[288].toFixed(4)},${centerline[289].toFixed(4)}`;
    host.dataset.windBend = wind.x.toFixed(4);
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
    aspect = w / h;
    renderer.setSize(w, h, false);
    camera.left = -4 * aspect;
    camera.right = 4 * aspect;
    camera.updateProjectionMatrix();
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
  host.dataset.meshCount = "3";
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
