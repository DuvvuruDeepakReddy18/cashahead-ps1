import * as T from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export const cast = {
  jot: {
    name: "Jot",
    role: "Bookkeeper",
    color: "#399b98",
    form: "pocket camera",
  },
  scout: {
    name: "Scout",
    role: "Forecaster",
    color: "#e48847",
    form: "twin-lens viewfinder",
  },
  mend: {
    name: "Mend",
    role: "Planner",
    color: "#9282cf",
    form: "pocket calculator",
  },
  dock: {
    name: "Dock",
    role: "Payment matcher",
    color: "#58a487",
    form: "receipt printer",
  },
};
export function palette() {
  const make = (color) =>
    new T.MeshStandardMaterial({ color, roughness: 0.57, metalness: 0.035 });
  const colors = {
    ink: "#252b45",
    boot: "#3b4168",
    ivory: "#fff2d3",
    white: "#fffcef",
    paper: "#fff6df",
    rose: "#f59c83",
    yellow: "#ffc854",
    brass: "#e4933b",
    blue: "#516cd9",
    periwinkle: "#a5b5ed",
    red: "#e66c53",
    mint: "#85cbb1",
    teal: "#41999c",
    sky: "#a9d9eb",
    plum: "#7c68b5",
    base: "#424b85",
    lilac: "#c4c1eb",
    line: "#7e87b2",
    shadow: "#35334a",
  };
  const m = Object.fromEntries(
    Object.entries(colors).map(([k, c]) => [k, make(c)]),
  );
  for (const [id, s] of Object.entries(cast))
    m[id] = new T.MeshPhysicalMaterial({
      color: s.color,
      roughness: 0.31,
      metalness: 0.09,
      clearcoat: 0.72,
      clearcoatRoughness: 0.21,
    });
  m.chrome = new T.MeshStandardMaterial({
    color: "#b6c5c8",
    roughness: 0.23,
    metalness: 0.82,
  });
  m.led = new T.MeshStandardMaterial({
    color: "#d4fff3",
    emissive: "#a0f0dc",
    emissiveIntensity: 0.45,
    roughness: 0.28,
  });
  m.brass.metalness = 0.59;
  m.brass.roughness = 0.31;
  m.ink.color.set("#202b3b");
  m.boot.color.set("#364350");
  m.ivory.roughness = 0.35;
  m.glass = new T.MeshPhysicalMaterial({
    color: "#102c39",
    roughness: 0.17,
    clearcoat: 0.56,
    metalness: 0.04,
  });
  // Keep the finish of plain painted parts while submitting their colors in one draw.
  m.paintBatch = new T.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.57,
    metalness: 0.035,
    vertexColors: true,
  });
  for (const key of Object.keys(colors))
    if (key !== "brass" && key !== "ivory")
      m[key].userData.paintBatch = m.paintBatch;
  return m;
}
export function group(parent, x = 0, y = 0, z = 0) {
  const g = new T.Group();
  g.position.set(x, y, z);
  parent.add(g);
  return g;
}
export function mesh(parent, geo, mat, x = 0, y = 0, z = 0) {
  const obj = new T.Mesh(geo, mat);
  obj.position.set(x, y, z);
  parent.add(obj);
  return obj;
}
export function box(p, w, h, d, r, m, x, y, z) {
  return mesh(
    p,
    r <= 0.016
      ? new T.BoxGeometry(w, h, d)
      : new RoundedBoxGeometry(
          w,
          h,
          d,
          r < 0.065 ? 1 : 2,
          Math.min(r, w / 2, h / 2, d / 2),
        ),
    m,
    x,
    y,
    z,
  );
}
export function ball(p, x, y, z, w, h, d, m) {
  const obj = mesh(p, new T.SphereGeometry(1, 20, 14), m, x, y, z);
  obj.scale.set(w, h, d);
  return obj;
}
export function drum(p, radius, length, m, x, y, z, front = false) {
  const o = mesh(
    p,
    new T.CylinderGeometry(radius, radius, length, 40),
    m,
    x,
    y,
    z,
  );
  if (front) o.rotation.x = Math.PI / 2;
  return o;
}
export function rod(p, a, b, r, m) {
  const v = new T.Vector3(...a),
    u = new T.Vector3(...b),
    delta = u.clone().sub(v);
  const obj = mesh(p, new T.CylinderGeometry(r, r, delta.length(), 12), m);
  obj.position.copy(v).lerp(u, 0.5);
  obj.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), delta.normalize());
  return obj;
}
export function line(p, points, r, mat) {
  return mesh(
    p,
    new T.TubeGeometry(
      new T.CatmullRomCurve3(points.map((v) => new T.Vector3(...v))),
      18,
      r,
      8,
      false,
    ),
    mat,
  );
}
export function batch(p) {
  const byMaterial = new Map();
  for (const o of [...p.children]) {
    if (!o.isMesh || o.children.length) continue;
    o.updateMatrix();
    let g = o.geometry;
    if (g.index) {
      g = g.toNonIndexed();
      o.geometry.dispose();
    }
    g.applyMatrix4(o.matrix);
    const material = o.material.userData.paintBatch || o.material;
    if (material !== o.material) {
      const count = g.getAttribute("position").count,
        tint = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) o.material.color.toArray(tint, i * 3);
      g.setAttribute("color", new T.BufferAttribute(tint, 3));
    }
    if (!byMaterial.has(material)) byMaterial.set(material, []);
    byMaterial.get(material).push(g);
    o.removeFromParent();
  }
  for (const [mat, geos] of byMaterial) {
    const geometry = mergeGeometries(geos);
    mesh(p, geometry, mat);
    geos.forEach((g) => g.dispose());
  }
}
// Furniture can merge across static subgroups; character joints stay individually poseable.
export function batchFurniture(root) {
  const meshes = [];
  root.traverse((object) => {
    if (object.isMesh && !object.children.length) meshes.push(object);
  });
  for (const object of meshes) if (object.parent !== root) root.attach(object);
  batch(root);
}
function iris(p, x, y, z, m) {
  const pivot = group(p, x, y, z);
  ball(pivot, 0, 0, 0.01, 0.069, 0.098, 0.029, m.led);
  ball(pivot, 0.012, -0.004, 0.038, 0.026, 0.052, 0.012, m.glass);
  ball(pivot, 0.001, 0.043, 0.05, 0.017, 0.022, 0.009, m.white);
  batch(pivot);
  return pivot;
}
export function makeActor(id, m) {
  const root = new T.Group(),
    trunk = group(root, 0, 0.39, 0),
    head = group(trunk, 0, 0.82, 0);
  const color = m[id],
    eyes = [];
  let perform = () => {};
  box(trunk, 0.68, 0.61, 0.53, 0.18, color, 0, 0.3, 0);
  box(trunk, 0.45, 0.25, 0.06, 0.065, m.ivory, 0, 0.34, 0.277);
  for (let i = 0; i < 3; i++)
    box(
      trunk,
      0.045,
      0.09,
      0.023,
      0.015,
      i === 0 ? m.yellow : m.ink,
      -0.09 + i * 0.09,
      0.34,
      0.313,
    );
  const belt = group(trunk, 0, 0.14, 0);
  box(belt, 0.65, 0.075, 0.53, 0.035, m.boot, 0, 0, 0);
  box(belt, 0.14, 0.078, 0.031, 0.011, m.chrome, 0, 0, 0.272);
  batch(belt);
  for (const side of [-1, 1]) {
    drum(trunk, 0.029, 0.018, m.chrome, side * 0.246, 0.485, 0.22, true);
    box(trunk, 0.058, 0.22, 0.043, 0.015, m.boot, side * 0.238, 0.357, 0.257);
  }
  drum(trunk, 0.19, 0.12, m.ink, 0, 0.62, 0);
  const legs = [],
    arms = [],
    sleeves = [],
    mitts = [];
  for (const s of [-1, 1]) {
    const leg = group(root, s * 0.22, 0.413, 0);
    legs.push(leg);
    rod(leg, [0, 0, 0], [0, -0.25, 0.025], 0.083, m.ink);
    box(leg, 0.3, 0.18, 0.43, 0.085, m.boot, 0, -0.32, 0.083);
    box(leg, 0.3, 0.051, 0.42, 0.022, m.ivory, 0, -0.385, 0.082);
    drum(leg, 0.104, 0.055, m.chrome, 0, -0.112, 0.014);
    box(leg, 0.224, 0.038, 0.081, 0.017, color, 0, -0.275, 0.25);
    batch(leg);
    const arm = group(trunk, s * 0.385, 0.46, 0);
    arms.push(arm);
    arm.userData.workingArm = true;
    ball(arm, 0, 0, 0, 0.123, 0.128, 0.125, color);
    const sleeve = group(arm);
    sleeves.push(sleeve);
    line(
      sleeve,
      [
        [0, -0.018, 0],
        [s * 0.11, -0.16, 0.02],
        [s * 0.16, -0.29, 0.09],
      ],
      0.069,
      m.ink,
    );
    const mitt = group(arm, s * 0.17, -0.31, 0.098);
    mitts.push(mitt);
    ball(mitt, 0, 0, 0, 0.115, 0.125, 0.11, m.ivory);
    ball(mitt, -s * 0.09, 0.025, 0.063, 0.063, 0.072, 0.061, m.ivory);
    drum(mitt, 0.101, 0.056, m.chrome, 0, 0.087, -0.018);
    batch(mitt);
    batch(sleeve);
    batch(arm);
  }
  const smile = (y, z) =>
    line(
      head,
      [
        [-0.09, y + 0.031, z],
        [0, y, z + 0.012],
        [0.09, y + 0.031, z],
      ],
      0.014,
      m.led,
    );
  if (id === "jot") {
    box(head, 1.23, 0.79, 0.68, 0.165, color, 0, 0.14, 0);
    box(head, 1.18, 0.16, 0.66, 0.065, m.ivory, 0, 0.455, 0);
    const shutter = group(head, 0.34, 0.578, 0.02);
    drum(shutter, 0.145, 0.079, m.red, 0, 0, 0);
    perform = (effort, travel) => {
      shutter.position.y =
        0.578 - 0.052 * effort * Math.sin(Math.PI * Math.min(1, travel * 3));
    };
    box(head, 0.29, 0.16, 0.2, 0.035, m.boot, -0.33, 0.59, 0);
    box(head, 0.19, 0.083, 0.035, 0.019, m.sky, -0.33, 0.59, 0.108);
    drum(head, 0.364, 0.165, m.ink, 0.05, 0.13, 0.374, true);
    drum(head, 0.316, 0.115, m.brass, 0.05, 0.13, 0.479, true);
    drum(head, 0.282, 0.077, m.glass, 0.05, 0.13, 0.548, true);
    ball(head, 0.05, 0.13, 0.56, 0.268, 0.268, 0.033, m.glass);
    for (let i = 0; i < 26; i++) {
      const a = (i * 2 * Math.PI) / 26;
      const rib = box(
        head,
        0.02,
        0.037,
        0.071,
        0.006,
        m.chrome,
        0.05 + 0.322 * Math.sin(a),
        0.13 + 0.322 * Math.cos(a),
        0.478,
      );
      rib.rotation.z = -a;
    }
    eyes.push(
      iris(head, -0.055, 0.165, 0.601, m),
      iris(head, 0.164, 0.165, 0.601, m),
    );
    smile(0.045, 0.6);
    for (let i = 0; i < 3; i++)
      box(
        head,
        0.032,
        0.23,
        0.032,
        0.014,
        m.ink,
        -0.49 + i * 0.058,
        0.055,
        0.35,
      );
    ball(head, -0.435, 0.345, 0.345, 0.053, 0.054, 0.026, m.yellow);
  } else if (id === "scout") {
    box(head, 0.99, 0.63, 0.66, 0.18, color, 0, 0.09, -0.018);
    for (const s of [-1, 1]) {
      drum(head, 0.305, 0.38, m.ink, s * 0.29, 0.21, 0.236, true);
      drum(head, 0.281, 0.12, color, s * 0.29, 0.21, 0.456, true);
      drum(head, 0.227, 0.067, m.glass, s * 0.29, 0.21, 0.538, true);
      ball(head, s * 0.29, 0.21, 0.55, 0.213, 0.213, 0.031, m.glass);
      eyes.push(iris(head, s * 0.29, 0.218, 0.587, m));
      const brow = box(
        head,
        0.245,
        0.057,
        0.065,
        0.028,
        m.boot,
        s * 0.3,
        0.49,
        0.41,
      );
      brow.rotation.z = s * 0.16;
    }
    box(head, 0.285, 0.11, 0.21, 0.045, m.yellow, 0, 0.44, 0.15);
    smile(-0.107, 0.324);
    rod(head, [0.38, 0.38, -0.13], [0.51, 0.65, -0.12], 0.033, m.boot);
    ball(head, 0.52, 0.68, -0.12, 0.077, 0.077, 0.077, m.red);
  } else if (id === "mend") {
    box(head, 0.99, 1.03, 0.5, 0.15, color, 0, 0.22, 0);
    box(head, 0.82, 0.45, 0.07, 0.09, m.boot, 0, 0.41, 0.265);
    box(head, 0.73, 0.35, 0.04, 0.07, m.glass, 0, 0.41, 0.317);
    eyes.push(
      iris(head, -0.17, 0.42, 0.352, m),
      iris(head, 0.17, 0.42, 0.352, m),
    );
    smile(0.315, 0.355);
    for (let j = 0; j < 2; j++)
      for (let i = 0; i < 4; i++)
        box(
          head,
          0.139,
          0.087,
          0.075,
          0.028,
          i === 3 ? m.yellow : j ? m.plum : m.ivory,
          -0.265 + i * 0.175,
          0.05 - j * 0.138,
          0.267,
        );
    box(head, 0.41, 0.075, 0.12, 0.035, m.ink, 0, 0.75, -0.058);
  } else {
    box(head, 1.15, 0.72, 0.7, 0.17, color, 0, 0.105, 0);
    box(head, 0.84, 0.39, 0.067, 0.111, m.glass, 0, 0.195, 0.349);
    eyes.push(
      iris(head, -0.208, 0.218, 0.392, m),
      iris(head, 0.208, 0.218, 0.392, m),
    );
    smile(0.101, 0.397);
    box(head, 0.7, 0.075, 0.055, 0.032, m.ink, 0, -0.118, 0.35);
    const paper = box(
      head,
      0.49,
      0.28,
      0.037,
      0.017,
      m.paper,
      0.018,
      -0.247,
      0.389,
    );
    paper.rotation.x = -0.2;
    for (let k = 0; k < 2; k++)
      box(
        head,
        0.29 - k * 0.07,
        0.018,
        0.018,
        0.006,
        m.line,
        -0.022,
        -0.2 - k * 0.058,
        0.417 + k * 0.012,
      );
    box(head, 0.66, 0.061, 0.29, 0.028, m.boot, 0, 0.48, -0.035);
    const spool = group(head, 0, 0.597, -0.03);
    const ticket = box(spool, 0.46, 0.28, 0.035, 0.017, m.paper, 0, 0, 0);
    ticket.rotation.z = -0.07;
    box(spool, 0.25, 0.027, 0.02, 0.01, m.mint, 0, 0.052, 0.025);
    batch(spool);
    perform = (effort) => {
      spool.position.y = 0.49 + 0.22 * effort;
    };
  }
  // Split lines and fasteners carry the cast's construction around to the sides.
  for (const side of [-1, 1]) {
    const offset = id === "jot" ? 0.595 : id === "dock" ? 0.555 : 0.48;
    const hinge = drum(
      head,
      0.11,
      0.058,
      m.chrome,
      side * offset,
      0.095,
      -0.015,
    );
    hinge.rotation.z = Math.PI / 2;
    const inset = drum(
      head,
      0.066,
      0.062,
      m.boot,
      side * (offset + 0.019),
      0.095,
      -0.015,
    );
    inset.rotation.z = Math.PI / 2;
  }
  batch(head);
  batch(trunk);
  const index = Object.keys(cast).indexOf(id);
  function pose(time, effort = 0, travel = 0) {
    rig.visible = false;
    sleeves[1].visible = true;
    const t = time + index * 0.71,
      cycle = t * 2.8 + travel * 4;
    trunk.position.y =
      0.39 +
      0.018 * Math.sin(t * 2.1) +
      0.045 * effort * Math.abs(Math.sin(cycle));
    head.rotation.z =
      0.032 * Math.sin(t * 1.55) +
      effort * 0.08 * Math.sin(travel * Math.PI * 2 + 0.5);
    head.rotation.y =
      0.09 * Math.sin(t * 0.9) + 0.11 * Math.sin(travel * 4 + index);
    const blink = Math.min(
      1,
      0.12 + Math.abs(((t + 1.67) % 4.3) - 0.16) * 12.5,
    );
    eyes.forEach((eye) => {
      eye.scale.y = blink * (id === "scout" ? 1 - 0.3 * effort : 1);
    });
    head.rotation.x = id === "mend" ? -0.14 * effort : 0;
    perform(effort, travel);
    legs.forEach(
      (leg, i) =>
        (leg.rotation.x =
          (i ? 1 : -1) * (0.055 + effort * 0.34) * Math.sin(cycle)),
    );
    arms.forEach((arm, i) => {
      const sign = i ? 1 : -1;
      sleeves[i].scale.setScalar(1);
      mitts[i].position.set(sign * 0.17, -0.31, 0.098);
      arm.rotation.y = 0;
      arm.rotation.z =
        sign *
        (0.11 + effort * (i ? 0.82 : 0.32) + 0.065 * Math.sin(t * 2 + i));
      arm.rotation.x = -0.11 + sign * 0.18 * Math.sin(cycle);
    });
  }
  const rig = group(trunk);
  rig.userData.workingArm = true;
  const upper = drum(rig, 0.062, 1, m.ink, 0, 0, 0);
  const lower = drum(rig, 0.055, 1, m.boot, 0, 0, 0);
  const elbowCap = ball(rig, 0, 0, 0, 0.086, 0.086, 0.086, color);
  const wrist = new T.Vector3(),
    elbow = new T.Vector3();
  const axis = new T.Vector3(0, 1, 0),
    direction = new T.Vector3();
  function connect(part, a, b) {
    direction.subVectors(b, a);
    part.position.copy(a).lerp(b, 0.5);
    part.scale.y = direction.length();
    part.quaternion.setFromUnitVectors(axis, direction.normalize());
  }
  // Two slim links bend around the edge of the easel. The mitten stays
  // the same size throughout the reach and meets the tool at its grip.
  function operate(handle, focus) {
    head.rotation.y += 0.15 * focus;
    head.rotation.x += 0.15 * focus;
    const arm = arms[1];
    trunk.worldToLocal(wrist.copy(handle));
    elbow.set(
      0.42,
      Math.min(arm.position.y, wrist.y) - 0.13,
      Math.min(0.83, wrist.z + 0.03),
    );
    arm.rotation.set(0, 0, 0);
    sleeves[1].visible = false;
    mitts[1].position.copy(wrist).sub(arm.position);
    rig.visible = true;
    connect(upper, arm.position, elbow);
    connect(lower, elbow, wrist);
    elbowCap.position.copy(elbow);
  }
  pose(0);
  return { root, pose, operate };
}
