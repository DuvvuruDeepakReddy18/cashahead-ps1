import * as T from "three";
import {
  palette,
  makeActor,
  group,
  mesh,
  box,
  drum,
  ball,
  rod,
  line,
  batch,
} from "./cast.js";
import {
  lightStudio,
  bakeStudioShadows,
  renderPixelBudget,
} from "./studio-light.js";

const span = 9.6;
function enamelRing(parent, r, t, mat, x, y, z) {
  return mesh(parent, new T.TorusGeometry(r, t, 10, 72), mat, x, y, z);
}
function printSurface(width, height, paint) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  paint(canvas.getContext("2d"), width, height);
  const texture = new T.CanvasTexture(canvas);
  texture.colorSpace = T.SRGBColorSpace;
  return texture;
}
function filmBend(parent, points, materials) {
  const curve = new T.CatmullRomCurve3(points.map((v) => new T.Vector3(...v)));
  const pos = [],
    uv = [],
    indices = [];
  for (let i = 0; i <= 56; i++) {
    const u = i / 56,
      c = curve.getPointAt(u),
      turn = 0.38 * Math.sin(u * Math.PI * 2);
    for (const side of [-1, 1]) {
      pos.push(c.x, c.y + side * 0.13, c.z + side * turn * 0.19);
      uv.push(u, side === 1 ? 1 : 0);
    }
    if (i < 56) {
      const n = i * 2;
      indices.push(n, n + 2, n + 1, n + 1, n + 2, n + 3);
    }
  }
  const g = new T.BufferGeometry();
  g.setAttribute("position", new T.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new T.Float32BufferAttribute(uv, 2));
  g.setIndex(indices);
  g.computeVertexNormals();
  const texture = printSurface(768, 64, (ctx, w, h) => {
    ctx.fillStyle = "#50392f";
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 8; i++) {
      const x = i * 96;
      const sky = ctx.createLinearGradient(0, 12, 0, 53);
      sky.addColorStop(0, i % 2 ? "#d7ab81" : "#9fb3ab");
      sky.addColorStop(1, "#bd8c5e");
      ctx.fillStyle = sky;
      ctx.fillRect(x + 4, 12, 87, 40);
      ctx.fillStyle = "#ffe4ac";
      ctx.beginPath();
      ctx.arc(x + 60, 23, 5, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = "#332f35";
      ctx.beginPath();
      ctx.moveTo(x + 6, 50);
      ctx.lineTo(x + 35, 28 + (i % 3) * 4);
      ctx.lineTo(x + 57, 42);
      ctx.lineTo(x + 72, 26);
      ctx.lineTo(x + 90, 50);
      ctx.fill();
      for (let j = 0; j < 4; j++)
        for (const y of [3, 56]) ctx.clearRect(x + j * 24 + 4, y, 12, 5);
    }
  });
  const mat = new T.MeshStandardMaterial({
    map: texture,
    roughness: 0.46,
    metalness: 0.17,
    side: T.DoubleSide,
    alphaTest: 0.4,
  });
  materials.push(mat);
  mesh(parent, g, mat);
}
function cameraBody(parent, m, extra) {
  const c = group(parent, 0, 1.09, 0.2);
  c.rotation.set(-0.13, 0.23, -0.035, "YXZ");
  box(c, 2.7, 1.46, 1.02, 0.22, m.boot, 0, 0, 0);
  box(c, 2.68, 1.11, 1.04, 0.16, m.scout, 0, -0.035, 0.014);
  box(c, 2.63, 0.24, 1.01, 0.095, m.chrome, 0, 0.575, 0);
  box(c, 2.55, 0.11, 0.97, 0.054, m.chrome, 0, -0.667, 0.008);
  box(c, 0.5, 1.15, 1.13, 0.14, m.ink, -1.07, -0.02, 0.047);
  for (let i = 0; i < 7; i++)
    box(c, 0.373, 0.025, 0.04, 0.012, m.boot, -1.07, -0.3 + i * 0.102, 0.615);
  box(c, 0.68, 0.31, 0.46, 0.085, m.boot, 0.34, 0.824, -0.12);
  box(c, 0.41, 0.17, 0.042, 0.035, m.glass, 0.34, 0.841, 0.12);
  box(c, 0.28, 0.067, 0.017, 0.019, m.sky, 0.34, 0.857, 0.147);
  for (const x of [-0.91, 0.91]) {
    drum(c, 0.201, 0.13, m.ink, x, 0.76, 0);
    drum(c, 0.16, 0.045, m.chrome, x, 0.845, 0);
    for (let i = 0; i < 14; i++) {
      const a = (i * 2 * Math.PI) / 14;
      box(
        c,
        0.027,
        0.076,
        0.027,
        0.006,
        m.chrome,
        x + 0.199 * Math.cos(a),
        0.756,
        0.199 * Math.sin(a),
      );
    }
  }
  drum(c, 0.096, 0.09, m.red, -0.89, 0.888, -0.004);
  for (const [r, l, z, mat] of [
    [0.62, 0.2, 0.55, m.ink],
    [0.595, 0.22, 0.71, m.chrome],
    [0.574, 0.25, 0.86, m.boot],
    [0.52, 0.1, 0.99, m.brass],
    [0.483, 0.065, 1.048, m.ink],
    [0.406, 0.04, 1.082, m.glass],
  ])
    drum(c, r, l, mat, 0, 0, z, true);
  for (let i = 0; i < 48; i++) {
    const a = (i * Math.PI) / 24;
    const rib = box(
      c,
      0.028,
      0.047,
      0.18,
      0.009,
      i % 4 === 0 ? m.chrome : m.ink,
      0.573 * Math.sin(a),
      0.573 * Math.cos(a),
      0.875,
    );
    rib.rotation.z = -a;
  }
  enamelRing(c, 0.465, 0.012, m.chrome, 0, 0, 1.075);
  enamelRing(c, 0.385, 0.015, m.teal, 0, 0, 1.109);
  for (const s of [-1, 1]) {
    const lug = enamelRing(c, 0.075, 0.018, m.chrome, s * 1.36, 0.3, 0.075);
    lug.rotation.y = Math.PI / 2;
  }
  line(
    c,
    [
      [1.36, 0.3, 0.08],
      [1.63, -0.16, -0.1],
      [1.59, -0.67, 0.19],
      [1.37, -0.62, 0.44],
      [1.32, 0.29, 0.12],
    ],
    0.033,
    m.ink,
  );
  ball(c, 0.82, 0.065, 0.548, 0.049, 0.049, 0.017, m.red);
  const lens = group(c, 0, 0, 1.111);
  const glass = printSurface(384, 384, (ctx, w, h) => {
    const g = ctx.createRadialGradient(160, 124, 5, 193, 187, 204);
    g.addColorStop(0, "#477e88");
    g.addColorStop(0.35, "#152e3c");
    g.addColorStop(0.6, "#111e30");
    g.addColorStop(0.83, "#215564");
    g.addColorStop(1, "#0a1423");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.translate(192, 192);
    for (let i = 0; i < 8; i++) {
      ctx.rotate(Math.PI / 4);
      ctx.strokeStyle = "#83c3c759";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-44, -53);
      ctx.quadraticCurveTo(64, -145, 167, -63);
      ctx.stroke();
    }
    ctx.fillStyle = "#b3e9ea69";
    ctx.beginPath();
    ctx.ellipse(-47, -80, 70, 12, -0.45, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = "#d9ffffa6";
    ctx.beginPath();
    ctx.ellipse(-68, -61, 17, 5, -0.48, 0, 2 * Math.PI);
    ctx.fill();
  });
  const disc = new T.MeshBasicMaterial({ map: glass, toneMapped: false });
  extra.push(disc);
  mesh(lens, new T.CircleGeometry(0.376, 80), disc);
  const plate = printSurface(420, 114, (ctx, w, h) => {
    ctx.fillStyle = "#252c33";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#fff0c7";
    ctx.font = "bold 51px Arial";
    ctx.fillText("CA   /   35 mm", 18, 76);
  });
  const label = new T.MeshBasicMaterial({ map: plate, toneMapped: false });
  extra.push(label);
  mesh(c, new T.PlaneGeometry(0.65, 0.176), label, 0.85, 0.3, 0.544);
  for (const x of [-1.22, 1.22]) {
    drum(c, 0.044, 0.021, m.chrome, x, 0.55, 0.51, true);
  }
  batch(c);
  return lens;
}
export function mountCover(
  host,
  { ready = () => {}, lost = () => {}, motion = true } = {},
) {
  const renderer = new T.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: "high-performance",
  });
  const pixelBudget = motion ? renderPixelBudget(renderer) : Infinity;
  renderer.setClearColor(0, 0);
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.04;
  renderer.domElement.setAttribute("aria-hidden", "true");
  host.appendChild(renderer.domElement);
  const scene = new T.Scene(),
    m = palette(),
    { env: environment, key } = lightStudio(scene),
    extra = [];
  const set = group(scene),
    cam = new T.OrthographicCamera(-5, 5, 3, -3, 0.1, 70);
  // The platform is a stack of contact sheets on a darkroom trimming board.
  const leaves = [m.ivory, m.paper, m.lilac, m.ivory, m.paper];
  leaves.forEach((mat, i) => {
    const leaf = box(
      set,
      6.5 + 0.05 * i,
      0.092,
      3.09,
      0.065,
      mat,
      0,
      -0.38 + 0.082 * i,
      -0.14,
    );
    leaf.rotation.y = (i - 2) * 0.019;
  });
  box(set, 6.96, 0.175, 3.34, 0.083, m.boot, 0, 0.035, -0.16);
  box(set, 6.87, 0.062, 3.3, 0.03, m.teal, 0, 0.141, -0.16);
  box(set, 6.75, 0.045, 3.22, 0.021, m.ivory, 0, 0.191, -0.16);
  for (let i = 0; i < 47; i++)
    box(
      set,
      0.015,
      0.009,
      i % 5 === 0 ? 0.13 : 0.064,
      0.003,
      m.line,
      -3.12 + i * 0.137,
      0.216,
      1.33,
    );
  const shadowMap = printSurface(192, 192, (ctx) => {
    const g = ctx.createRadialGradient(96, 96, 8, 96, 96, 95);
    g.addColorStop(0, "#27373464");
    g.addColorStop(0.6, "#27373428");
    g.addColorStop(1, "#27373400");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 192, 192);
  });
  const shade = new T.MeshBasicMaterial({
    map: shadowMap,
    transparent: true,
    depthWrite: false,
    toneMapped: false,
  });
  extra.push(shade);
  const shadow = (x, y, z, w, d) => {
    const o = mesh(set, new T.PlaneGeometry(w, d), shade, x, y, z);
    o.rotation.x = -Math.PI / 2;
  };
  shadow(0, -0.59, -0.15, 9, 5.8);
  shadow(0, 0.217, 0.08, 3.8, 1.6);
  box(set, 1.63, 0.2, 0.76, 0.08, m.boot, 0, 0.317, 0.15);
  const lens = cameraBody(set, m, extra);
  const receipt = group(set, 1.14, 0.243, 1.02);
  receipt.rotation.y = -0.27;
  box(receipt, 1.09, 0.032, 0.66, 0.015, m.paper, 0, 0, 0);
  const receiptMap = printSurface(440, 260, (g) => {
    g.fillStyle = "#fffae8";
    g.fillRect(0, 0, 440, 260);
    g.fillStyle = "#276664";
    g.fillRect(18, 18, 404, 53);
    g.fillStyle = "#fff8dd";
    g.font = "bold 34px Arial";
    g.fillText("INV-104", 30, 56);
    g.fillStyle = "#1b3137";
    g.font = "bold 58px Arial";
    g.fillText("₹11,000", 27, 151);
    g.fillStyle = "#6b8381";
    g.fillRect(28, 182, 315, 4);
    g.fillRect(28, 203, 183, 4);
  });
  const receiptInk = new T.MeshBasicMaterial({
    map: receiptMap,
    toneMapped: false,
  });
  extra.push(receiptInk);
  const facePrint = mesh(
    receipt,
    new T.PlaneGeometry(1.058, 0.64),
    receiptInk,
    0,
    0.022,
    0,
  );
  facePrint.rotation.x = -Math.PI / 2;
  const castAt = [
    ["jot", -1.98, 0.85, 0.76, 0.26],
    ["scout", 2.02, 0.55, 0.85, -0.37],
    ["mend", -2.67, -0.93, 0.64, 0.32],
    ["dock", 2.86, -0.96, 0.64, -0.45],
  ];
  const actors = castAt.map(([id, x, z, size, yaw]) => {
    const a = makeActor(id, m);
    a.root.position.set(x, 0.217, z);
    a.root.scale.setScalar(size);
    a.root.rotation.y = yaw;
    set.add(a.root);
    shadow(x, 0.22, z, size * 1.25, size * 0.85);
    return a;
  });
  const rolls = group(set, -2.52, 0.43, 0.98);
  rolls.rotation.z = 0.13;
  drum(rolls, 0.16, 0.43, m.ink, 0, 0, 0);
  drum(rolls, 0.17, 0.29, m.yellow, 0, 0, 0);
  const light = group(set, 2.96, 0.216, -1.31);
  for (const s of [-1, 1])
    rod(light, [0, 0.37, 0], [s * 0.28, 0, 0.1], 0.029, m.ink);
  rod(light, [0, 0, 0], [0, 2.17, 0], 0.03, m.chrome);
  const head = group(light, -0.11, 2.16, 0.04);
  head.rotation.y = -0.89;
  head.rotation.x = 0.23;
  const hood = mesh(head, new T.CylinderGeometry(0.38, 0.19, 0.32, 8), m.ink);
  hood.rotation.x = Math.PI / 2;
  const face = mesh(head, new T.CircleGeometry(0.355, 8), m.paper, 0, 0, 0.165);
  face.rotation.z = Math.PI / 8;
  for (let i = 0; i < 8; i++) {
    const a = ((i + 0.5) * Math.PI) / 4;
    rod(
      head,
      [0, 0, 0.174],
      [0.334 * Math.cos(a), 0.334 * Math.sin(a), 0.174],
      0.004,
      m.chrome,
    );
  }
  drum(head, 0.052, 0.012, m.ivory, 0, 0, 0.184, true);
  batch(head);
  batch(light);
  batch(rolls);
  const strip = group(set);
  filmBend(
    strip,
    [
      [-4.9, 1.74, -1.4],
      [-3.91, 1.49, -1.3],
      [-3.75, 0.62, -0.4],
      [-3.98, 0.13, 0.8],
      [-3.52, -0.29, 1.55],
      [-2.69, -0.32, 1.43],
    ],
    extra,
  );
  filmBend(
    strip,
    [
      [2.72, -0.14, -2],
      [3.76, 0.05, -1.6],
      [4.25, 0.89, -1.85],
      [4.14, 1.42, -1.1],
      [4.88, 1.55, -0.5],
    ],
    extra,
  );
  batch(set);
  set.updateMatrixWorld(true);
  bakeStudioShadows(renderer, key, set, 5.2);
  const target = lens.getWorldPosition(new T.Vector3());
  cam.position.copy(target).add(new T.Vector3(-1.85, 1.91, 10));
  cam.lookAt(target);
  let first = true,
    frame = 0,
    last = 0,
    active = true,
    dead = false,
    time = 0,
    state = { zoom: 1, y: 0.5, progress: 0 };
  let width = 1,
    height = 1,
    modelWidth = 1;
  function draw(now) {
    frame = 0;
    if (dead || document.hidden || !active) return;
    if (last) time += Math.min(0.05, (now - last) / 1000);
    last = now;
    const scale = (modelWidth / span) * state.zoom;
    cam.left = -width / (2 * scale);
    cam.right = -cam.left;
    cam.top = (height * state.y) / scale;
    cam.bottom = cam.top - height / scale;
    cam.updateProjectionMatrix();
    actors.forEach((actor, i) =>
      actor.pose(
        motion ? time * 0.62 : 0,
        0.19 + 0.035 * i,
        state.progress * 0.28,
      ),
    );
    strip.rotation.x =
      0.025 * Math.sin((motion ? time : 0) * 0.59) + state.progress * 0.032;
    renderer.render(scene, cam);
    if (first) {
      first = false;
      ready();
    }
    if (motion && state.progress < 0.075) request();
  }
  function request() {
    if (!dead && active && !frame && !document.hidden)
      frame = requestAnimationFrame(draw);
  }
  function resize() {
    width = host.clientWidth;
    height = host.clientHeight;
    modelWidth = host.parentElement.querySelector(".cover-sheet").clientWidth;
    if (!width || !height || !modelWidth) return;
    renderer.setDrawingBufferSize(
      width,
      height,
      Math.min(
        devicePixelRatio || 1,
        1.35,
        Math.sqrt(pixelBudget / (width * height)),
      ),
    );
    request();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(host);
  const onLoss = (e) => {
    e.preventDefault();
    dead = true;
    cancelAnimationFrame(frame);
    lost();
  };
  renderer.domElement.addEventListener("webglcontextlost", onLoss);
  const visibility = () => {
    last = 0;
    request();
  };
  document.addEventListener("visibilitychange", visibility);
  resize();
  return {
    set(next) {
      state = next;
      active = next.progress < 1;
      if (!active) {
        cancelAnimationFrame(frame);
        frame = 0;
        last = 0;
      } else request();
    },
    dispose() {
      dead = true;
      cancelAnimationFrame(frame);
      ro.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      renderer.domElement.removeEventListener("webglcontextlost", onLoss);
      const geo = new Set();
      scene.traverse((o) => {
        if (o.geometry) geo.add(o.geometry);
      });
      geo.forEach((g) => g.dispose());
      for (const mat of [...Object.values(m), ...extra]) {
        mat.map?.dispose();
        mat.dispose();
      }
      key.shadow.dispose();
      environment.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
