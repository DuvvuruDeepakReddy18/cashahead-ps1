import * as T from "three";

// A small, baked latitude-longitude softbox rig gives enamel and glass readable reflections.
export function lightStudio(scene) {
  const width = 128,
    height = 64,
    data = new Uint16Array(width * height * 4);
  const lamps = [
    [-2.0, 0.61, 0.33, 0.43, 3.1, 2.7, 2.1],
    [0.54, 0.39, 0.17, 0.56, 1.5, 2.5, 3.1],
    [2.1, 0.16, 0.26, 0.09, 2.4, 1.8, 1.0],
  ];
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const u = ((x + 0.5) / width) * Math.PI * 2 - Math.PI,
        v = ((y + 0.5) / height) * Math.PI - Math.PI / 2;
      const values = [0.19, 0.21, 0.25].map(
        (c) => c + 0.2 * Math.max(0, Math.sin(v)),
      );
      for (const [ax, ay, sx, sy, r, g, b] of lamps) {
        const dx = Math.atan2(Math.sin(u - ax), Math.cos(u - ax)) / sx,
          dy = (v - ay) / sy;
        const strength = Math.exp(-Math.pow(dx, 4) - Math.pow(dy, 4));
        values[0] += r * strength;
        values[1] += g * strength;
        values[2] += b * strength;
      }
      const offset = (y * width + x) * 4;
      for (let k = 0; k < 3; k++)
        data[offset + k] = T.DataUtils.toHalfFloat(values[k]);
      data[offset + 3] = T.DataUtils.toHalfFloat(1);
    }
  const env = new T.DataTexture(
    data,
    width,
    height,
    T.RGBAFormat,
    T.HalfFloatType,
  );
  env.mapping = T.EquirectangularReflectionMapping;
  env.minFilter = T.LinearFilter;
  env.magFilter = T.LinearFilter;
  env.needsUpdate = true;
  scene.environment = env;
  scene.environmentIntensity = 0.64;
  scene.add(new T.HemisphereLight("#fff0d6", "#807fa2", 0.93));
  const key = new T.DirectionalLight("#fff0d4", 2.27);
  key.position.set(-3, 5.8, 4);
  scene.add(key);
  const rim = new T.DirectionalLight("#c3e9ff", 1.95);
  rim.position.set(4, 3, -3);
  scene.add(rim);
  return { env, key };
}

export function bakeStudioShadows(renderer, key, root, extent) {
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;
  key.castShadow = true;
  key.position.set(-7, 13, 9);
  const shadow = key.shadow;
  shadow.mapSize.set(1536, 1536);
  Object.assign(shadow.camera, {
    left: -extent,
    right: extent,
    top: extent,
    bottom: -extent,
    near: 0.1,
    far: 40,
  });
  shadow.camera.updateProjectionMatrix();
  shadow.normalBias = 0.015;
  shadow.bias = -0.00015;
  // Moving paper and tools are excluded so their silhouettes never stay on the desk.
  root.traverse((o) => {
    if (!o.isMesh || !o.material?.isMeshStandardMaterial) return;
    o.receiveShadow = true;
    o.castShadow = true;
  });
}

// Choose a pixel budget once per renderer. Only a viewport resize can change
// the buffer size, including while the opening lens covers both scenes.
export function renderPixelBudget(renderer) {
  const gl = renderer.getContext(),
    info = gl.getExtension("WEBGL_debug_renderer_info");
  const software =
    info &&
    /swiftshader|llvmpipe|software rasterizer|basic render driver/i.test(
      gl.getParameter(info.UNMASKED_RENDERER_WEBGL),
    );
  return software ? 640000 : 2359296;
}
