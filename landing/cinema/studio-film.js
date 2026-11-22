import * as T from "three";
import {
  ball,
  batch,
  batchFurniture,
  box,
  drum,
  group,
  mesh,
  rod,
} from "./cast.js";
import {
  delayMark,
  ease,
  jobProgress,
  matchMark,
  ramp,
  takes,
} from "./scene-clock.js";

export const stations = [
  [-6.65, 0.18],
  [-2.25, -0.12],
  [2.13, 0.18],
  [6.42, -0.12],
];
const colors = ["#237f83", "#a74e2e", "#6e51a2", "#337659"];
const ids = ["jot", "scout", "mend", "dock"];
const lerp = T.MathUtils.lerp;
const vec = (x, y, z) => new T.Vector3(x, y, z);

function artwork(width, height, paint, materials) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  paint(ctx);
  const map = new T.CanvasTexture(canvas);
  map.colorSpace = T.SRGBColorSpace;
  map.anisotropy = 4;
  const mat = new T.MeshBasicMaterial({ map, toneMapped: false });
  materials.push(mat);
  return mat;
}
function lettering(ctx, value, x, y, size, color, weight = 700) {
  ctx.fillStyle = color;
  ctx.font = weight + " " + size + "px Arial, sans-serif";
  ctx.fillText(value, x, y);
}
function paperFace(rows, tint, materials) {
  return artwork(
    448,
    496,
    (g) => {
      g.fillStyle = "#fff6e2";
      g.fillRect(0, 0, 448, 496);
      g.fillStyle = tint;
      g.fillRect(0, 0, 448, 87);
      lettering(g, rows[0], 24, 61, 48, "#fff7e7");
      lettering(g, rows[1], 24, 152, 30, "#494558");
      lettering(g, rows[2], 20, 252, 74, "#272941", 800);
      g.strokeStyle = "#cdc1aa";
      g.setLineDash([9, 6]);
      g.beginPath();
      g.moveTo(22, 298);
      g.lineTo(423, 298);
      g.stroke();
      g.setLineDash([]);
      lettering(g, rows[3], 26, 370, 36, tint);
      if (rows[0] === "INV-104") {
        g.strokeStyle = "#a8a0a2";
        g.beginPath();
        g.moveTo(29, 445);
        g.lineTo(371, 445);
        g.stroke();
        return;
      }
      for (let j = 0; j < 56; j++) {
        g.fillStyle = "#514958";
        if ((j * 7) % 9 < 5) g.fillRect(26 + 4 * j, 415, (j % 3) + 1, 39);
      }
    },
    materials,
  );
}
function placard(parent, w, h, mat, x, y, z) {
  return mesh(parent, new T.PlaneGeometry(w, h), mat, x, y, z);
}
function makePaper(root, m, faces) {
  const paper = group(root);
  box(paper, 0.94, 1.04, 0.047, 0.024, m.paper, 0, 0, 0);
  const face = placard(paper, 0.905, 1.006, faces[0], 0, 0, 0.025);
  return {
    paper,
    show(i) {
      face.material = faces[i];
    },
  };
}

function buildRoom(root, m, materials) {
  const room = group(root);
  // A front lighting bridge gives the dolly a real threshold to cross.
  const grid = group(room, 0, 0.89, 0);
  for (const side of [-8.91, 8.91]) {
    box(grid, 0.14, 4.07, 0.15, 0.048, m.boot, side, 1.185, 1.25);
    box(grid, 0.37, 0.12, 0.38, 0.04, m.brass, side, -0.75, 1.25);
  }
  // Two cantilever arms suspend the entry lights in front of the floor.
  // The opening camera passes beneath them as it approaches the booking desk.
  const entryZ = 4.46;
  for (const x of [-8.91, 8.91]) {
    rod(grid, [x, 3.1, 1.25], [x, 3.1, entryZ], 0.055, m.boot);
    rod(grid, [x, 2.7, 1.25], [x, 3.1, entryZ - 0.66], 0.044, m.boot);
  }
  for (const level of [3.1, 3.31]) {
    rod(grid, [-8.91, level, entryZ], [8.91, level, entryZ], 0.043, m.boot);
  }
  for (let i = 0; i < 38; i++) {
    const x = -8.9 + i * 0.47;
    rod(
      grid,
      [x, i % 2 ? 3.31 : 3.1, entryZ],
      [Math.min(8.91, x + 0.47), i % 2 ? 3.1 : 3.31, entryZ],
      0.021,
      m.boot,
    );
  }
  for (const x of [-7.7, -3.2, 1.2, 5.5, 8.2]) {
    rod(grid, [x, 3.24, entryZ], [x, 2.99, entryZ], 0.032, m.brass);
    const light = group(grid, x, 2.98, entryZ);
    light.rotation.set(0.58, -0.32, -0.1);
    drum(light, 0.16, 0.33, m.boot, 0, 0, 0, true);
    drum(light, 0.178, 0.066, m.brass, 0, 0, 0.145, true);
    drum(light, 0.132, 0.017, m.paper, 0, 0, 0.185, true);
    batch(light);
  }
  batch(grid);
  const tops = [m.teal, m.scout, m.plum, m.dock];
  const titles = ["Bookings", "Forecast", "Collections", "Payments"];
  const glazes = ["#b4d4ca", "#dbccc0", "#c9c4d6", "#c0d2c6"];
  for (const [i, [x, z]] of stations.entries()) {
    const bay = group(room, x + 0.15, 0, z);
    // A continuous enamel dado and four real reveals read as one photographic loft.
    box(bay, 4.52, 3.57, 0.2, 0.06, m.ivory, 0, 1.77, -2.08);
    box(bay, 4.52, 1.02, 0.23, 0.065, m.teal, 0, 0.51, -1.96);
    box(bay, 4.5, 0.062, 0.27, 0.024, m.brass, 0, 1.035, -1.91);
    for (let n = 0; n < 15; n++)
      box(
        bay,
        0.026,
        0.88,
        0.035,
        0.008,
        m.mint,
        -2.15 + n * 0.305,
        0.52,
        -1.82,
      );
    const windowArt = artwork(
      480,
      486,
      (g) => {
        const w = 480,
          h = 486;
        g.beginPath();
        g.moveTo(4, h);
        g.lineTo(4, 238);
        g.arc(240, 238, 236, Math.PI, 2 * Math.PI);
        g.lineTo(476, h);
        g.closePath();
        g.clip();
        const sky = g.createLinearGradient(0, 0, w * 0.18, h);
        sky.addColorStop(0, "#9bbcca");
        sky.addColorStop(0.56, glazes[i]);
        sky.addColorStop(1, "#f8dba8");
        g.fillStyle = sky;
        g.fillRect(0, 0, w, h);
        if (i === 1) {
          g.fillStyle = "#fff0c4";
          g.beginPath();
          g.arc(308, 161, 44, 0, 2 * Math.PI);
          g.fill();
        }
        for (let row = 0; row < 2; row++) {
          g.fillStyle = row ? "#819c9b" : "#a5b5aa";
          for (let n = -1; n < 14; n++) {
            const bx = n * (row ? 49 : 58) + i * 12,
              by = 328 + row * 48 + 22 * Math.sin(n * 2.35 + i);
            g.fillRect(bx, by, 44, h - by);
            g.beginPath();
            g.moveTo(bx - 2, by);
            g.lineTo(bx + 18, by - 12);
            g.lineTo(bx + 48, by);
            g.fill();
          }
        }
        g.fillStyle = "#fff7df3d";
        g.beginPath();
        g.moveTo(50, 0);
        g.lineTo(101, 0);
        g.lineTo(365, h);
        g.lineTo(321, h);
        g.fill();
      },
      materials,
    );
    windowArt.alphaTest = 0.35;
    const wx = -0.48,
      wy = 2.06,
      wz = -1.9,
      ww = 2.27,
      wh = 2.26;
    placard(bay, ww, wh, windowArt, wx, wy, wz);
    const arch = group(bay, wx, wy, wz + 0.028);
    for (const s of [-1, 1])
      rod(arch, [s * 1.115, -1.12, 0], [s * 1.115, 0.012, 0], 0.043, m.boot);
    for (let n = 0; n < 20; n++) {
      const a = (n * Math.PI) / 20,
        b = ((n + 1) * Math.PI) / 20;
      rod(
        arch,
        [1.115 * Math.cos(a), 0.012 + 1.1 * Math.sin(a), 0],
        [1.115 * Math.cos(b), 0.012 + 1.1 * Math.sin(b), 0],
        0.043,
        m.boot,
      );
    }
    for (const sx of [-0.39, 0.39])
      rod(arch, [sx, -1.11, 0], [sx, 1.044, 0], 0.018, m.boot);
    box(arch, 2.21, 0.045, 0.053, 0.008, m.boot, 0, 0, 0);
    box(arch, 2.38, 0.09, 0.26, 0.025, m.chrome, 0, -1.11, 0.024);
    batch(arch);
    // A small sign above each side cabinet leaves the window and actor silhouettes clear.
    const enamel = artwork(
      540,
      140,
      (g) => {
        g.fillStyle = "#223b40";
        g.fillRect(0, 0, 540, 140);
        lettering(g, titles[i], 26, 95, 65, "#fff1d3");
      },
      materials,
    );
    box(bay, 1.43, 0.39, 0.09, 0.04, m.brass, 1.3, 2.31, -1.91);
    placard(bay, 1.36, 0.332, enamel, 1.3, 2.31, -1.85);
    box(bay, 1.34, 0.069, 0.33, 0.024, m.boot, 1.3, 1.32, -1.69);
    for (let k = 0; k < 3; k++) {
      const can = group(bay, 0.86 + k * 0.32, 1.5, -1.66);
      drum(can, 0.116, 0.27, k === 1 ? m.scout : m.chrome, 0, 0, 0);
      drum(can, 0.125, 0.045, m.ink, 0, 0.147, 0);
      batch(can);
    }
    box(bay, 1.74, 0.16, 1.07, 0.065, m.boot, 0.86, 0.51, 0.45);
    box(bay, 1.77, 0.085, 1.09, 0.038, m.brass, 0.86, 0.598, 0.45);
    box(bay, 1.72, 0.034, 1.065, 0.015, tops[i], 0.86, 0.654, 0.45);
    for (const px of [0.2, 1.5])
      for (const pz of [0.04, 0.86]) {
        rod(bay, [px, 0.1, pz], [px, 0.49, pz], 0.056, m.boot);
        drum(bay, 0.068, 0.055, m.chrome, px, 0.13, pz);
      }
    box(bay, 0.95, 0.059, 0.14, 0.025, m.ink, 0.73, 0.695, 0.58);
    batchFurniture(bay);
  }

  return room;
}
function pen(m, parent) {
  const tool = group(parent);
  rod(tool, [0, 0, 0], [-0.036, 0.046, 0.016], 0.02, m.ink);
  rod(tool, [-0.036, 0.046, 0.016], [-0.23, 0.32, 0.12], 0.04, m.yellow);
  rod(tool, [-0.23, 0.32, 0.12], [-0.28, 0.39, 0.14], 0.041, m.teal);
  ball(tool, 0, 0, 0, 0.024, 0.024, 0.024, m.ink);
  batch(tool);
  return tool;
}
function scanner(m, parent) {
  const tool = group(parent);
  box(tool, 0.83, 0.092, 0.105, 0.039, m.boot, 0, 0, 0);
  box(tool, 0.71, 0.026, 0.022, 0.008, m.yellow, 0, -0.027, 0.062);
  box(tool, 0.2, 0.12, 0.17, 0.04, m.red, -0.42, 0.035, 0.066);
  batch(tool);
  return tool;
}
function stamp(m, parent) {
  const tool = group(parent);
  box(tool, 0.43, 0.2, 0.055, 0.026, m.boot, 0, 0, 0);
  rod(tool, [0, 0, 0], [0, 0.005, 0.17], 0.061, m.brass);
  ball(tool, 0, 0.01, 0.19, 0.145, 0.075, 0.071, m.red);
  batch(tool);
  return tool;
}
function fly(object, from, to, u, turn = 1) {
  const h = Math.sin(Math.PI * u);
  object.position.copy(from).lerp(to, u);
  object.position.y += h * 0.63;
  object.position.z += h * 0.65;
  object.rotation.set(
    -0.14 - h * 0.28,
    turn * h * 0.39,
    -turn * Math.sin(2 * Math.PI * u) * 0.23,
  );
}
export function makeStudioFilm(root, actors, m) {
  const materials = [];
  const room = buildRoom(root, m, materials);
  const face = (lines, i) => paperFace(lines, colors[i], materials);
  const wedding = makePaper(root, m, [
    face(["INV-104", "REDDY–VARMA", "₹11,000", "DUE THURSDAY"], 0),
    face(["INV-104", "REDDY–VARMA", "₹11,000", "15 DAYS LATE"], 1),
  ]);
  const overdue = makePaper(root, m, [
    face(["INV-101", "KIRAN & DIVYA", "₹8,000", "OVERDUE"], 2),
    face(["INV-101", "KIRAN & DIVYA", "₹3,000", "STILL DUE"], 3),
  ]);
  const bank = makePaper(root, m, [
    face(["BANK CREDIT", "UPI / INV-101", "₹5,000", "RECEIVED"], 3),
  ]);
  wedding.paper.name = "INV-104";
  overdue.paper.name = "INV-101";
  bank.paper.name = "UPI credit";
  bank.paper.scale.setScalar(0.73);
  const approvalMat = artwork(
    400,
    108,
    (g) => {
      g.fillStyle = "#377a5d";
      g.fillRect(0, 0, 400, 108);
      lettering(g, "✓  MATCHED", 22, 76, 55, "#fff6dd");
    },
    materials,
  );
  const imprint = placard(
    overdue.paper,
    0.75,
    0.202,
    approvalMat,
    0,
    -0.362,
    0.03,
  );
  imprint.rotation.z = -0.08;
  const easels = stations.map(([x, z]) => vec(x + 0.97, 1.16, z + 0.52));
  const pencil = pen(m, root),
    wand = scanner(m, root),
    seal = stamp(m, root);
  const ink = group(wedding.paper, -0.33, -0.377, 0.034);
  // A pen-width signature unfurls directly behind the nib.
  const stroke = [];
  for (let k = 0; k < 18; k++) {
    const point = (n) => [
      n * 0.035,
      0.017 * Math.sin(n * 0.97) + 0.009 * Math.sin(n * 1.71),
      0,
    ];
    stroke.push(rod(ink, point(k), point(k + 1), 0.01, m.teal));
  }
  const calendar = group(
    root,
    stations[1][0] + 1.82,
    0.9,
    stations[1][1] + 0.42,
  );
  box(calendar, 0.7, 0.48, 0.092, 0.047, m.boot, 0, 0, 0);
  const dates = ["THU", "+15d"].map((v) =>
    artwork(
      270,
      170,
      (g) => {
        g.fillStyle = "#fff2cf";
        g.fillRect(0, 0, 270, 170);
        g.fillStyle = "#e18856";
        g.fillRect(0, 0, 270, 42);
        lettering(g, v, 24, 132, 79, "#373249");
      },
      materials,
    ),
  );
  const flap = placard(calendar, 0.63, 0.4, dates[0], 0, 0, 0.052);
  const file = group(root, stations[2][0] + 1.38, 0.78, stations[2][1] + 0.08);
  const drawer = group(file);
  drawer.name = "Overdue drawer";
  box(drawer, 0.99, 0.07, 0.63, 0.03, m.boot, 0, -0.12, 0);
  box(drawer, 0.99, 0.35, 0.075, 0.03, m.plum, 0, 0.02, 0.32);
  for (const side of [-0.47, 0.47])
    box(drawer, 0.06, 0.27, 0.62, 0.025, m.plum, side, 0, 0);
  box(drawer, 0.32, 0.085, 0.1, 0.03, m.brass, 0, -0.07, 0.4);
  const tab = artwork(
    360,
    78,
    (g) => {
      g.fillStyle = "#fff1cd";
      g.fillRect(0, 0, 360, 78);
      lettering(g, "OVERDUE", 31, 60, 57, "#564074");
    },
    materials,
  );
  placard(drawer, 0.63, 0.14, tab, 0, 0.105, 0.362);
  batch(drawer);
  // Scout drops the delayed booking into its own pocket behind the overdue drawer.
  const pocket = group(file, 0.23, -0.02, -0.44);
  box(pocket, 1.02, 0.4, 0.09, 0.038, m.line, 0, 0.11, 0);
  for (const side of [-0.48, 0.48])
    box(pocket, 0.06, 0.39, 0.29, 0.025, m.boot, side, 0.1, -0.11);
  batch(pocket);
  const toolPoint = vec(0, 0, 0);
  const dockGrip = vec(0, 0, 0);
  const onPaper = (obj, x, y, z) => obj.localToWorld(toolPoint.set(x, y, z));
  function reach(id, tool, x, y, z, focus = 1) {
    actors[id].operate(onPaper(tool, x, y, z), focus);
  }
  const fileSlot = vec(stations[2][0] + 1.38, 0.79, stations[2][1] + 0.14);
  const drawerOrigin = vec(0, 0, 0);
  const workingGrip = vec(0, 0, 0);
  const penRest = vec(stations[0][0] + 0.51, 0.665, stations[0][1] + 0.75);
  const filed = vec(stations[2][0] + 1.61, 0.83, stations[2][1] - 0.55);
  function direct(p, time, camera, aspect) {
    const [j, s, n, d] = takes.map((_, i) => jobProgress(p, i));
    const jobs = [j, s, n, d];
    for (let i = 0; i < ids.length; i++) {
      const action = jobs[i];
      const focus = Math.sin(Math.PI * action);
      actors[ids[i]].pose(time, 0.09 + 0.37 * focus, action);
    }
    const step1 = ease(p, takes[0].end, takes[1].start);
    const step2 = ease(p, takes[1].end, takes[2].start);
    const step3 = ease(p, takes[2].end, takes[3].start);
    if (p < takes[1].end) fly(wedding.paper, easels[0], easels[1], step1);
    else fly(wedding.paper, easels[1], filed, step2, -1);
    wedding.paper.scale.setScalar(1 - 0.37 * step2);
    wedding.paper.rotation.z -= 0.065 * step2;
    wedding.show(s >= delayMark ? 1 : 0);
    const opened = ease(n, 0.025, 0.24) * (1 - ease(n, 0.77, 0.99));
    drawer.position.z = 0.32 * opened;
    drawerOrigin.copy(fileSlot);
    drawerOrigin.z += drawer.position.z;
    const pulling = ease(n, 0.205, 0.77);
    if (p <= takes[2].end) {
      fly(overdue.paper, drawerOrigin, easels[2], pulling, -1);
      overdue.paper.position.y += 0.15 * Math.sin(pulling * Math.PI);
      overdue.paper.rotation.z += 0.12 * (1 - pulling);
      overdue.paper.scale.setScalar(0.68 + 0.32 * pulling);
    } else {
      fly(overdue.paper, easels[2], easels[3], step3);
      overdue.paper.scale.setScalar(1);
    }
    overdue.show(d >= matchMark ? 1 : 0);
    imprint.visible = d >= matchMark;
    const sig = ramp(j, 0.08, 0.88) * 18;
    stroke.forEach((segment, i) => {
      segment.visible = i < Math.floor(sig);
    });
    pencil.position.copy(
      onPaper(
        wedding.paper,
        -0.33 + 0.035 * sig,
        -0.377 + 0.017 * Math.sin(sig * 0.97) + 0.009 * Math.sin(sig * 1.71),
        0.046,
      ),
    );
    pencil.position.y += 0.14 * (1 - ease(j, 0, 0.08) + ease(j, 0.9, 1));
    const putDown = ease(j, 0.88, 1);
    pencil.position.lerp(penRest, putDown);
    pencil.rotation.z = 0.91 * putDown;
    workingGrip.copy(onPaper(pencil, -0.12, 0.17, 0.067));
    // Jot guides the lower corner into the pass and lets go near the desk edge.
    const push = ease(p, 0.224, 0.245) * (1 - ease(step1, 0.025, 0.19));
    workingGrip.lerp(onPaper(wedding.paper, -0.38, -0.34, 0.045), push);
    actors.jot.operate(workingGrip, 1 - 0.75 * step1);
    const level = lerp(0.42, -0.43, ease(s, 0.07, 0.87));
    const scoutDesk = easels[1];
    wand.position.set(
      scoutDesk.x,
      scoutDesk.y + level,
      scoutDesk.z + 0.096 - 0.14 * level,
    );
    // The reader is on the bench before the page arrives and stays there afterward.
    const stow = ease(p, 0.477, 0.515);
    wand.position.x -= 0.25 * stow;
    wand.position.y -= 0.06 * stow;
    wand.rotation.z = -0.1 * stow;
    reach("scout", wand, -0.43, 0.035, 0.066, 0.35 + 0.65 * step1);
    const flip = ease(s, 0.43, 0.79);
    flap.rotation.x = Math.sin(flip * Math.PI) * 1.45;
    flap.material = dates[flip >= 0.5 ? 1 : 0];
    workingGrip.copy(onPaper(drawer, -0.19, -0.055, 0.41));
    // First the handle, then the exposed edge of the overdue invoice.
    const grasp = ease(n, 0.13, 0.29) * (1 - ease(step3, 0.02, 0.18));
    workingGrip.lerp(onPaper(overdue.paper, -0.41, -0.12, 0.035), grasp);
    actors.mend.operate(workingGrip, 0.32 + 0.68 * opened);
    // Dock slides the credit alongside the invoice before pressing the matching seal.
    const bankIn = ease(d, 0.03, 0.48),
      home = easels[3];
    bank.paper.visible = true;
    bank.paper.scale.setScalar(0.73);
    bank.paper.position.set(
      home.x + lerp(-0.32, 0.76, bankIn),
      home.y + lerp(-0.75, -0.05, bankIn) + 0.19 * Math.sin(bankIn * Math.PI),
      home.z + lerp(-0.17, 0.075, bankIn),
    );
    bank.paper.rotation.set(-0.12, 0.04, lerp(-0.38, 0.095, bankIn));
    const press = ease(d, 0.5, matchMark) * (1 - ease(d, 0.8, 0.99));
    seal.position.copy(
      onPaper(
        overdue.paper,
        lerp(-0.3, -0.04, press),
        lerp(-0.53, -0.345, press),
        lerp(0.36, 0.048, press),
      ),
    );
    seal.rotation.z = lerp(-0.39, -0.08, press);
    const stampRest = 1 - ease(d, 0.4, 0.55);
    seal.position.lerp(
      workingGrip.set(home.x - 0.28, 0.68, home.z + 0.31),
      stampRest,
    );
    seal.visible = true;
    {
      dockGrip.copy(onPaper(bank.paper, -0.45, -0.3, 0.03));
      dockGrip.lerp(onPaper(seal, 0, 0.01, 0.18), ease(d, 0.44, 0.56));
      actors.dock.operate(dockGrip, 1);
    }
    directCamera(
      camera,
      p,
      aspect,
      pencil.position,
      wedding.paper.position,
      overdue.paper.position,
      bank.paper.position,
      seal.position,
    );
  }
  return {
    direct,
    invoice: overdue.paper,
    room,
    dispose() {
      materials.forEach((mat) => {
        mat.map.dispose();
        mat.dispose();
      });
    },
  };
}

// The lens, hands and moving sheets share these world coordinates. Weight shifts
// begin before each release and finish after the catching hand has settled.
function directCamera(camera, p, aspect, nib, wedding, overdue, bank, stamp) {
  const first = ease(p, takes[0].end, takes[1].start);
  const second = ease(p, takes[1].end, takes[2].start);
  const third = ease(p, takes[2].end, takes[3].start);
  const pass = (from, to) =>
    ease(p, from - 0.024, from + 0.013) * (1 - ease(p, to - 0.005, to + 0.03));
  const travel = Math.max(
    pass(takes[0].end, takes[1].start),
    pass(takes[1].end, takes[2].start),
    pass(takes[2].end, takes[3].start),
  );
  const approach = ease(p, 0, takes[0].start + 0.018);
  const write = ease(p, 0.104, 0.166) * (1 - ease(p, 0.215, 0.245));
  const pull = ease(p, 0.564, 0.61) * (1 - ease(p, 0.674, 0.73));
  const match = ease(p, 0.835, 0.9);
  const changeFile = ease(p, 0.566, 0.604);
  const at = (a, b, c, d) =>
    a + (b - a) * first + (c - b) * second + (d - c) * third;
  const fov = 34,
    tangent = Math.tan(T.MathUtils.degToRad(fov / 2));
  const width = lerp(5.7, 12.8, ease(aspect, 1.08, 1.92));
  const establishing = Math.max(4.5, width / (2 * tangent * aspect));
  const close = Math.max(
    3.76,
    at(2.78, 3.38, 2.9, 3.2) / (2 * tangent * aspect),
  );
  // Let the sheet lead the eye between desks, then include the worker and tool.
  const workX = at(
    stations[0][0] + 0.35,
    stations[1][0] + 0.65,
    stations[2][0] + 0.41,
    stations[3][0] + 0.56,
  );
  const workZ =
    at(stations[0][1], stations[1][1], stations[2][1], stations[3][1]) + 0.16;
  let subjectX = lerp(wedding.x, overdue.x, changeFile);
  let subjectY = lerp(wedding.y, overdue.y, changeFile);
  let subjectZ = lerp(wedding.z, overdue.z, changeFile);
  subjectX = lerp(subjectX, nib.x, write);
  subjectY = lerp(subjectY, nib.y + 0.19, write);
  subjectZ = lerp(subjectZ, nib.z, write);
  const receiptWeight = match * 0.38;
  subjectX = lerp(subjectX, bank.x, receiptWeight);
  subjectY = lerp(subjectY, bank.y, receiptWeight);
  subjectZ = lerp(subjectZ, bank.z, receiptWeight);
  // A small tilt follows the stamp down without losing the bank reference.
  subjectY = lerp(subjectY, stamp.y + 0.17, match * 0.17);
  const subjectWeight =
    approach *
    (0.22 + 0.68 * travel + 0.19 * pull + 0.13 * write + 0.08 * match);
  const x = lerp(workX, subjectX, subjectWeight);
  const y = lerp(lerp(1.12, 1.18, approach), subjectY, subjectWeight);
  const z = lerp(workZ * approach, subjectZ, subjectWeight);
  const distance =
    lerp(establishing, close, approach) * (1 - 0.075 * write - 0.055 * pull) +
    0.28 * travel;
  const yaw =
    lerp(-0.42, -0.165, approach) +
    0.12 * travel * Math.cos(p * Math.PI * 3) -
    0.1 * write +
    0.085 * first -
    0.13 * second +
    0.09 * third +
    0.07 * Math.sin(p * Math.PI * 2);
  const pitch =
    lerp(0.32, 0.12, approach) + 0.13 * travel + 0.05 * pull + 0.025 * match;
  camera.fov = fov;
  camera.aspect = aspect;
  camera.position.set(
    x + Math.sin(yaw) * Math.cos(pitch) * distance,
    y + Math.sin(pitch) * distance,
    z + Math.cos(yaw) * Math.cos(pitch) * distance,
  );
  camera.lookAt(x, y, z);
}
