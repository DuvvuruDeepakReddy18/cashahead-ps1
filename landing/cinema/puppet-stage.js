import {
  lightStudio,
  bakeStudioShadows,
  renderPixelBudget,
} from "./studio-light.js";
import { invoiceTrailPass } from "./invoice-trail.js";
import * as T from "three";
import {
  palette,
  makeActor,
  group,
  mesh,
  box,
  ball,
  drum,
  rod,
  batch,
  batchFurniture,
} from "./cast.js";

import { makeStudioFilm, stations } from "./studio-film.js";

const ids = ["jot", "scout", "mend", "dock"];
const clamp = T.MathUtils.clamp;
function shadowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 96;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(48, 48, 2, 48, 48, 46);
  g.addColorStop(0, "rgba(44,40,65,.36)");
  g.addColorStop(0.48, "rgba(44,40,65,.17)");
  g.addColorStop(1, "rgba(44,40,65,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 96, 96);
  return new T.CanvasTexture(c);
}
function tripod(p, x, z, height, material) {
  rod(p, [x, 0.07, z], [x, height, z], 0.034, material);
  for (let i = 0; i < 3; i++) {
    const a = i * 2.094 + 0.4;
    rod(
      p,
      [x, 0.39, z],
      [x + 0.34 * Math.cos(a), 0.04, z + 0.34 * Math.sin(a)],
      0.028,
      material,
    );
  }
}
function studioSet(m) {
  const set = new T.Group();
  // A slate with film perforations doubles as the floor of Ananyaâ€™s miniature set.
  box(set, 18.68, 0.36, 4.8, 0.17, m.boot, 0, -0.22, 0);
  box(set, 18.56, 0.12, 4.77, 0.055, m.blue, 0, -0.045, 0);
  box(set, 18.4, 0.104, 4.68, 0.05, m.ivory, 0, 0.027, 0);
  for (let i = 0; i < 53; i++)
    box(
      set,
      0.155,
      0.087,
      0.018,
      0.028,
      m.lilac,
      -8.84 + i * 0.34,
      -0.225,
      2.405,
    );
  for (const x of [-8.6, 8.6])
    box(set, 0.37, 0.15, 0.45, 0.07, m.boot, x, -0.445, 0.77);
  // Two fixtures belong to the photographer's set: a softbox and a striped umbrella.
  tripod(set, -8.47, -0.85, 1.99, m.boot);
  const soft = group(set, -8.46, 2.02, -0.86);
  soft.rotation.y = 0.42;
  soft.rotation.z = 0.115;
  soft.rotation.x = -0.14;
  const hood = mesh(
    soft,
    new T.CylinderGeometry(0.73, 0.33, 0.43, 8),
    m.boot,
    0,
    0,
    0,
  );
  hood.rotation.x = Math.PI / 2;
  const diffuser = mesh(
    soft,
    new T.CylinderGeometry(0.683, 0.683, 0.035, 8),
    m.paper,
    0,
    0,
    0.228,
  );
  diffuser.rotation.x = Math.PI / 2;
  const rim = mesh(
    soft,
    new T.TorusGeometry(0.666, 0.022, 8, 8),
    m.brass,
    0,
    0,
    0.255,
  );
  rim.rotation.z = Math.PI / 8;
  tripod(set, 8.4, -0.99, 1.66, m.boot);
  const umbrella = group(set, 8.4, 1.72, -0.99);
  umbrella.rotation.z = -0.39;
  umbrella.rotation.x = 0.19;
  for (let i = 0; i < 10; i++) {
    const gore = mesh(
      umbrella,
      new T.SphereGeometry(0.77, 4, 9, (i * Math.PI) / 5, Math.PI / 5, 0, 1.28),
      i % 2 ? m.ivory : m.red,
    );
    gore.scale.y = 0.69;
  }
  ball(umbrella, 0, 0.56, 0, 0.047, 0.09, 0.047, m.boot);
  // Contact sheets and a film cartridge occupy the edge of the worktable.
  for (let i = 0; i < 3; i++) {
    const print = group(set, -8.6 + i * 0.049, 0.099 + i * 0.026, 0.73);
    print.rotation.y = -0.22 + i * 0.14;
    box(print, 0.55, 0.025, 0.66, 0.011, m.white, 0, 0, 0);
    box(
      print,
      0.435,
      0.01,
      0.455,
      0.005,
      i === 1 ? m.mint : m.sky,
      0,
      0.019,
      -0.04,
    );
    batch(print);
  }
  const film = group(set, 8.55, 0.225, 0.58);
  film.rotation.z = 0.16;
  drum(film, 0.175, 0.53, m.ink, 0, 0.08, 0);
  drum(film, 0.18, 0.3, m.yellow, 0, 0.08, 0);
  drum(film, 0.19, 0.055, m.ink, 0, 0.36, 0);
  batch(film);
  batch(soft);
  batch(umbrella);
  batchFurniture(set);
  return set;
}
export function mountPuppetStage(
  host,
  {
    mode = "world",
    initial = "jot",
    onLost = () => {},
    onReady = () => {},
    motion = true,
  } = {},
) {
  const renderer = new T.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: mode === "world" ? "high-performance" : "low-power",
  });
  const pixelBudget = motion ? renderPixelBudget(renderer) : Infinity;
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = mode === "world" ? 1.01 : 1.09;
  renderer.domElement.setAttribute("aria-hidden", "true");
  host.appendChild(renderer.domElement);
  const scene = new T.Scene(),
    camera =
      mode === "world"
        ? new T.PerspectiveCamera(34, 1, 0.1, 70)
        : new T.OrthographicCamera(),
    m = palette();
  const { env: environment, key } = lightStudio(scene);
  if (mode === "world") scene.fog = new T.Fog("#dae5df", 13, 34);
  const root = group(scene),
    actors = {},
    set = mode === "world" ? studioSet(m) : null;
  if (set) {
    root.add(set);
  }
  const shade = new T.MeshBasicMaterial({
    map: shadowTexture(),
    transparent: true,
    depthWrite: false,
    toneMapped: false,
  });
  function addActor(id) {
    const a = makeActor(id, m);
    actors[id] = a;
    const i = ids.indexOf(id);
    const foot = new T.Group();
    root.add(foot);
    foot.add(a.root);
    a.foot = foot;
    const [x, z] = mode === "world" ? stations[i] : [0, 0];
    foot.position.set(x, mode === "world" ? 0.087 : 0, z);
    foot.rotation.y = mode === "world" ? -0.035 : 0;
    const floorShadow = mesh(
      foot,
      new T.PlaneGeometry(1.6, 1.1),
      shade,
      0,
      0.001,
      0.05,
    );
    floorShadow.rotation.x = -Math.PI / 2;
    return a;
  }
  if (mode === "world") ids.forEach(addActor);
  else addActor(initial);
  const film = set ? makeStudioFilm(root, actors, m) : null;
  if (film) {
    // The static architecture and the resting crew cast one soft shadow pass.
    // The invoice and articulated working arms stay dynamic.
    bakeStudioShadows(renderer, key, set, 11.1);
    for (const actor of Object.values(actors))
      actor.root.traverse((o) => {
        if (!o.isMesh || !o.material?.isMeshStandardMaterial) return;
        o.receiveShadow = true;
        let part = o;
        while (part && !part.userData.workingArm && part !== actor.root)
          part = part.parent;
        o.castShadow = part === actor.root;
      });
    film.room.traverse((o) => {
      if (o.isMesh && o.material?.isMeshStandardMaterial) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
  }
  const drawTrail = film ? invoiceTrailPass(scene, film.invoice) : null;
  if (film) camera.layers.enable(1);
  let trail = null;
  let current = initial,
    progress = 0,
    performing = true,
    angle = 0.2,
    tilt = 0.14,
    frame = 0,
    visible = true,
    dead = false,
    lost = false,
    t = 0,
    last = 0,
    aspect = 1;
  let viewportWidth = 1,
    viewportHeight = 1;
  let topInset = 0,
    bottomInset = 0,
    displayedBottom = 0,
    insetTime = 0;
  let firstFrame = true;
  const media = matchMedia("(prefers-reduced-motion: reduce)");
  function draw(now) {
    frame = 0;
    if (dead || lost) return;
    const moving = !trail && motion && performing && !media.matches;
    let top = 0,
      bottom = 0;
    if (moving && last) t += Math.min(50, now - last) / 1000;
    last = now;
    if (film) {
      const ui = T.MathUtils.smoothstep(progress, 0.05, 0.11);
      // Render a window onto the same full-size canvas throughout the dolly.
      // Caption changes may adjust composition, but never clear the backbuffer.
      const dt = insetTime ? Math.min(80, now - insetTime) : 80;
      insetTime = now;
      displayedBottom +=
        (bottomInset - displayedBottom) * (1 - Math.exp(-dt / 95));
      top = Math.min(topInset * ui, viewportHeight * 0.24);
      bottom = Math.min(displayedBottom * ui, viewportHeight * 0.58);
      const safeHeight = Math.max(1, viewportHeight - top - bottom);
      film.direct(trail ? 1 : progress, t, camera, viewportWidth / safeHeight);
      camera.setViewOffset(
        viewportWidth,
        safeHeight,
        0,
        -top,
        viewportWidth,
        viewportHeight,
      );
    } else {
      actors[current].pose(t, 0.62, 0);
      const scale = Math.max(2.66, 2.55 / aspect);
      camera.left = (-scale * aspect) / 2;
      camera.right = -camera.left;
      camera.top = scale / 2;
      camera.bottom = -scale / 2;
      camera.position.set(
        7 * Math.sin(angle) * Math.cos(tilt),
        1.03 + 7 * Math.sin(tilt),
        7 * Math.cos(angle) * Math.cos(tilt),
      );
      camera.lookAt(0, 1.03, 0);
    }
    camera.near = 0.1;
    camera.far = 50;
    camera.updateProjectionMatrix();
    if (trail)
      drawTrail(
        renderer,
        camera,
        viewportWidth,
        viewportHeight,
        top,
        bottom,
        trail,
      );
    else renderer.render(scene, camera);
    if (firstFrame) {
      firstFrame = false;
      onReady();
    }
    if (moving) request();
  }
  function request() {
    if (!frame && (visible || trail) && !document.hidden && !dead && !lost)
      frame = requestAnimationFrame(draw);
  }
  let bufferWidth = 0,
    bufferHeight = 0,
    pixelRatio = 0;

  function resize() {
    const w = Math.max(1, host.clientWidth),
      h = Math.max(1, host.clientHeight);
    viewportWidth = w;
    viewportHeight = h;
    aspect = w / h;
    const ratio = Math.min(
      devicePixelRatio || 1,
      w < 550 ? 1.3 : 1.55,
      Math.sqrt(pixelBudget / (w * h)),
    );
    if (ratio !== pixelRatio || w !== bufferWidth || h !== bufferHeight) {
      pixelRatio = ratio;
      bufferWidth = w;
      bufferHeight = h;
      renderer.setDrawingBufferSize(w, h, ratio);
    }
    request();
  }
  function pause() {
    cancelAnimationFrame(frame);
    frame = 0;
    last = 0;
    request();
  }
  function select(id) {
    if (!ids.includes(id) || mode === "world") return;
    actors[current].foot.visible = false;
    current = id;
    const a = actors[id] || addActor(id);
    a.foot.visible = true;
    angle = 0.2;
    request();
  }
  function loss(e) {
    e.preventDefault();
    lost = true;
    if (trail) {
      host.appendChild(renderer.domElement);
      trail = null;
    }
    cancelAnimationFrame(frame);
    onLost();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(host);
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    pause();
  });
  io.observe(host);
  document.addEventListener("visibilitychange", pause);
  media.addEventListener("change", pause);
  renderer.domElement.addEventListener("webglcontextlost", loss);
  resize();
  return {
    select,
    setTrail(next, overlay) {
      if (!film || lost || dead || (!trail && !next)) return;
      const canvas = renderer.domElement;
      if (next && !trail) overlay.appendChild(canvas);
      if (!next && trail) host.appendChild(canvas);
      trail = next;
      cancelAnimationFrame(frame);
      draw(performance.now());
    },
    setInsets(top, bottom) {
      topInset = top;
      bottomInset = bottom;
      if (firstFrame || media.matches) displayedBottom = bottom;
      request();
    },
    setProgress(p, animate = true) {
      performing = animate;
      progress = clamp(p, 0, 1);
      request();
    },
    orbit(dx, dy = 0) {
      angle += dx;
      tilt = clamp(tilt + dy, -0.05, 0.65);
      request();
    },
    dispose() {
      dead = true;
      cancelAnimationFrame(frame);
      ro.disconnect();
      io.disconnect();
      media.removeEventListener("change", pause);
      document.removeEventListener("visibilitychange", pause);
      renderer.domElement.removeEventListener("webglcontextlost", loss);
      const geos = new Set();
      scene.traverse((o) => {
        if (o.geometry) geos.add(o.geometry);
      });
      geos.forEach((g) => g.dispose());
      Object.values(m).forEach((mat) => mat.dispose());
      film?.dispose();
      key.shadow.dispose();
      environment.dispose();
      shade.map.dispose();
      shade.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
