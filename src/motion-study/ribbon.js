import * as THREE from "three";
import { loadStudio } from "../sculpture.js";
import { sampleRibbon, sceneState, smooth } from "./choreography.mjs";

export function makeRibbonGeometry(count = 256, sides = 16) {
  const geometry = new THREE.BufferGeometry(),
    position = new Float32Array((count + 1) * sides * 3),
    uv = new Float32Array((count + 1) * sides * 2),
    indices = [];
  for (let i = 0; i <= count; i++)
    for (let j = 0; j < sides; j++) {
      const v = i * sides + j;
      uv[v * 2] = i / count;
      uv[v * 2 + 1] = j / sides;
      if (i < count) {
        const n = i * sides + ((j + 1) % sides);
        indices.push(v, v + sides, n, n, v + sides, n + sides);
      }
    }
  for (let j = 1; j < sides - 1; j++) {
    indices.push(0, j + 1, j);
    const end = count * sides;
    indices.push(end, end + j, end + j + 1);
  }
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(position, 3).setUsage(THREE.DynamicDrawUsage),
  );
  geometry.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  geometry.setIndex(indices);
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 30);
  const line = new Float32Array((count + 1) * 3),
    tangent = new THREE.Vector3(),
    normal = new THREE.Vector3(),
    binormal = new THREE.Vector3(),
    previousT = new THREE.Vector3(),
    q = new THREE.Quaternion();
  function update(phase, opts) {
    sampleRibbon(phase, { ...opts, count, out: line });
    const state = sceneState(phase);
    for (let i = 0; i <= count; i++) {
      const a = Math.max(0, i - 1) * 3,
        b = Math.min(count, i + 1) * 3;
      tangent
        .set(
          line[b] - line[a],
          line[b + 1] - line[a + 1],
          line[b + 2] - line[a + 2],
        )
        .normalize();
      if (i === 0) {
        normal.set(0, 0, 1).cross(tangent).normalize();
        if (normal.lengthSq() < 0.001) normal.set(1, 0, 0);
      } else {
        q.setFromUnitVectors(previousT, tangent);
        normal.applyQuaternion(q);
        normal.addScaledVector(tangent, -normal.dot(tangent)).normalize();
      }
      previousT.copy(tangent);
      binormal.crossVectors(tangent, normal).normalize();
      const s = i / count,
        twist =
          0.2 * Math.sin(s * Math.PI * 3 + state.t * 0.5) +
          Math.sin(phase * Math.PI * 0.7) * s * 0.6;
      const c = Math.cos(twist),
        sn = Math.sin(twist),
        taper = 0.12 + 0.88 * Math.sin(Math.PI * s) ** 0.35;
      const size =
        opts.scale ?? state.scale * Math.min(1, (opts.aspect || 1.6) / 1.6);
      const release = 1 - 0.94 * smooth(12.25, 13, phase);
      const width = 0.27 * taper * size * release,
        depth = 0.047 * taper * size * release;
      for (let j = 0; j < sides; j++) {
        const angle = (j / sides) * Math.PI * 2,
          co = Math.cos(angle),
          si = Math.sin(angle);
        const x = (Math.sign(co) * Math.abs(co) ** 0.36 * width) / 2,
          y = (Math.sign(si) * Math.abs(si) ** 0.36 * depth) / 2;
        const nx = x * c - y * sn,
          ny = x * sn + y * c,
          v = (i * sides + j) * 3;
        position[v] = line[i * 3] + normal.x * nx + binormal.x * ny;
        position[v + 1] = line[i * 3 + 1] + normal.y * nx + binormal.y * ny;
        position[v + 2] = line[i * 3 + 2] + normal.z * nx + binormal.z * ny;
      }
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
    return line;
  }
  update(0, { aspect: 1.6, time: 0 });
  return { geometry, update, line };
}

export async function createRibbonRenderer(host) {
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
  renderer.toneMappingExposure = 0.94;
  host.append(renderer.domElement);
  const scene = new THREE.Scene(),
    camera = new THREE.OrthographicCamera(-6.4, 6.4, 4, -4, 0.1, 100);
  camera.position.z = 12;
  scene.environment = await loadStudio();
  const ribbon = makeRibbonGeometry(),
    material = new THREE.MeshPhysicalMaterial({
      color: 0x8b8170,
      metalness: 0.97,
      roughness: 0.26,
      envMapIntensity: 1.35,
      clearcoat: 0.16,
      clearcoatRoughness: 0.24,
      side: THREE.DoubleSide,
    });
  const mesh = new THREE.Mesh(ribbon.geometry, material);
  scene.add(mesh);
  for (const [color, intensity, pos] of [
    [0xf0e3ca, 2.4, [-4, 5, 4]],
    [0xcbd0cf, 1.6, [5, 1, 2]],
    [0xe4e1d9, 1.2, [0, -3, -2]],
  ]) {
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(...pos);
    scene.add(light);
  }
  let width = 0,
    height = 0;
  function draw(phase, opts) {
    const w = host.clientWidth,
      h = host.clientHeight;
    if (!w || !h) return;
    if (w !== width || h !== height) {
      width = w;
      height = h;
      renderer.setSize(w, h, false);
      camera.left = (-4 * w) / h;
      camera.right = (4 * w) / h;
      camera.updateProjectionMatrix();
    }
    ribbon.update(phase, opts);
    renderer.render(scene, camera);
  }
  await renderer.compileAsync(scene, camera);
  draw(0, { aspect: innerWidth / innerHeight, time: 0 });
  host.classList.add("ready");
  return {
    draw,
    dispose() {
      ribbon.geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
