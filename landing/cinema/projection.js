

const $ = (selector) => document.querySelector(selector);
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

// The case prints and reminders only need frames while their chapters are on screen.
function runWhileVisible(element, draw) {
  let frame = 0;
  function tick(time) {
    draw(time);
    frame = requestAnimationFrame(tick);
  }
  new IntersectionObserver(([entry]) => {
    cancelAnimationFrame(frame);
    if (entry.isIntersecting) frame = requestAnimationFrame(tick);
  }).observe(element);
}

// ---------- DRYING LINE (scroll-driven, stage 2b) ----------
{
  const RED = "#E0352B",
    GRN = "#1E9E5A",
    MAR = "#F2A900",
    INK = "#15130F",
    WH = "#FFFFFF";
  const CATS = {
    CAPTURE: "#3346D3",
    FORECAST: "#1FA2E0",
    RESCUE: "#F2A900",
    PAYMENTS: "#8E4FD8",
    TRUST: "#15130F",
  };
  const box = (x, y, w, h, extra = "") =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" ${extra}/>`;
  const card = (x, y, w, h, extra = "") =>
    box(x, y, w, h, `fill="${WH}" stroke="${INK}" stroke-width="2" ${extra}`);
  const tx = (x, y, s, cls = "pf-mono", extra = "") =>
    `<text x="${x}" y="${y}" class="${cls}" ${extra}>${s}</text>`;
  const tl = (x, y, lines, cls = "pf-mono", lh = 19) =>
    `<text x="${x}" y="${y}" class="${cls}">${lines.map((s, i) => `<tspan x="${x}" dy="${i ? lh : 0}">${s}</tspan>`).join("")}</text>`;
  const note = (x, y, s, rot = -4) =>
    `<text x="${x}" y="${y}" class="pf-hand" fill="${RED}" transform="rotate(${rot} ${x} ${y})">${s}</text>`;
  const chip = (x, y, w, s, col) =>
    box(x, y, w, 30, `rx="15" fill="${col}"`) +
    tx(x + 12, y + 20, s, "pf-sm", `fill="${WH}"`);
  const rule = (y) =>
    `<line x1="62" x2="338" y1="${y}" y2="${y}" stroke="#9FB8D8" stroke-width="1"/>`;
  const tick = (x, y, col = GRN) =>
    `<path d="M${x} ${y} l6 7 l12 -14" fill="none" stroke="${col}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;

  // CASES: scenes are simple SVG shapes plus exact print strings only
  const CASES = [
    {
      n: "01",
      title: "The Invoice That Lived in Chat",
      cat: "CAPTURE",
      helper: "JOT",
      hook: "Booked on chat. Never billed.",
      broken: () =>
        box(
          56,
          150,
          288,
          118,
          `rx="20" fill="${WH}" stroke="${INK}" stroke-width="2"`,
        ) +
        tl(
          78,
          190,
          ["Done! Confirmed for 22 Jan, ", "advance 20k next week"],
          "pf-mono",
          20,
        ) +
        note(150, 312, "no invoice"),
      fixed: () =>
        card(50, 130, 300, 176) +
        tl(
          72,
          170,
          [
            "INV-110 \u00B7 Booking deposit ",
            "\u20B920,000 \u00B7 due next Fri",
          ],
          "pf-mono",
          22,
        ) +
        chip(70, 250, 240, "from chat \u00B7 you confirmed", GRN),
    },
    {
      n: "02",
      title: "After Sankranti",
      cat: "CAPTURE",
      helper: "JOT",
      hook: "A promise without a date.",
      broken: () =>
        box(
          50,
          130,
          300,
          200,
          'fill="#FFFDF5" stroke="#8A8A8A" stroke-width="1.5"',
        ) +
        rule(188) +
        rule(212) +
        rule(236) +
        rule(260) +
        tl(
          64,
          182,
          [
            "Ramesh gari reception \u2013",
            "pannendu velu \u2013",
            "Sankranti tarvata",
          ],
          "pf-hand",
          24,
        ) +
        note(230, 304, "when?", -5),
      fixed: () =>
        card(50, 140, 300, 160) +
        tx(72, 186, "\u20B912,000 \u00B7 Thu 15 Jan", "pf-mono") +
        box(70, 200, 118, 24, `fill="${MAR}"`) +
        tx(76, 217, "(agreed date)", "pf-mono") +
        tx(72, 256, "\u00B7 you confirmed", "pf-mono"),
    },
    {
      n: "03",
      title: "The Friday Nobody Saw",
      cat: "FORECAST",
      helper: "SCOUT",
      hook: "The bill lands before the balance.",
      broken: () =>
        card(44, 130, 312, 210) +
        box(60, 150, 280, 60, 'fill="#F3EEE2"') +
        tx(74, 186, "Thu", "pf-sm", 'font-weight="600"') +
        tx(130, 186, "Reddy \u20B911,000 (maybe late)", "pf-sm") +
        box(60, 224, 280, 60, 'fill="#F3EEE2"') +
        tx(74, 260, "Fri", "pf-sm", 'font-weight="600"') +
        tx(130, 260, "Ravi \u20B96,000 + LensHub \u20B94,000", "pf-sm") +
        note(246, 322, "short?", -3),
      fixed: () =>
        card(50, 140, 300, 170) +
        tl(
          72,
          178,
          ["Seen 4 days ahead \u00B7 ", "\u2212\u20B94,000 if late"],
          "pf-mono",
          22,
        ) +
        `<path d="M90 280 H310" stroke="${INK}" stroke-width="2"/>` +
        `<circle cx="100" cy="280" r="6" fill="${INK}"/><circle cx="210" cy="280" r="6" fill="none" stroke="${INK}" stroke-width="2"/>` +
        `<path d="M100 298 H210" stroke="${INK}" stroke-width="3" stroke-dasharray="4 4"/>`,
    },
    {
      n: "04",
      title: "The Overdue Everyone Assumed",
      cat: "FORECAST",
      helper: "SCOUT",
      hook: '"They\'ll pay today" is not a forecast.',
      broken: () =>
        card(50, 140, 300, 190) +
        tx(72, 178, "Kiran &amp; Divya \u20B98,000", "pf-mono") +
        [0, 1, 2, 3, 4]
          .map((i) =>
            box(
              72 + i * 52,
              300 - (60 + ((i * 17) % 50)),
              36,
              60 + ((i * 17) % 50),
              `fill="${i ? "#DCE3EC" : MAR}"`,
            ),
          )
          .join("") +
        note(230, 230, "assumed", -4),
      fixed: () =>
        card(50, 140, 300, 190) +
        box(
          70,
          160,
          260,
          60,
          `fill="none" stroke="${INK}" stroke-dasharray="5 4"`,
        ) +
        tx(86, 196, "Kiran &amp; Divya \u20B98,000", "pf-mono") +
        tl(
          72,
          262,
          [
            "Left out until you estimate \u00B7",
            "no date confirmed \u00B7",
            "ask for a payment date",
          ],
          "pf-sm",
          18,
        ),
    },
    {
      n: "05",
      title: "Chasing the Wrong Client",
      cat: "RESCUE",
      helper: "MEND",
      hook: "The biggest invoice isn't the one that matters.",
      broken: () =>
        card(50, 130, 300, 200) +
        tx(72, 166, "Lakshmi &amp; Arjun \u20B935,000", "pf-mono") +
        rule(180) +
        tx(72, 206, "Kiran &amp; Divya \u20B98,000", "pf-mono") +
        rule(220) +
        note(200, 292, "not due till D+40", -3),
      fixed: () =>
        card(50, 130, 300, 200) +
        tx(72, 166, "Kiran &amp; Divya \u20B98,000", "pf-mono") +
        tick(316, 152) +
        rule(180) +
        tl(
          72,
          228,
          [
            "Chase Kiran &amp; Divya first \u00B7",
            "\u20B94,000 by Friday protects crew",
          ],
          "pf-sm",
          18,
        ),
    },
    {
      n: "06",
      title: "Delaying the Crew",
      cat: "RESCUE",
      helper: "MEND",
      hook: "Your second shooter is not a credit line.",
      broken: () =>
        card(70, 170, 260, 110) +
        tx(90, 210, "Pay Ravi next week", "pf-serif") +
        note(160, 330, "crew can't wait", -4),
      fixed: () =>
        card(70, 170, 260, 130) +
        `<rect x="112" y="200" width="36" height="28" rx="4" fill="${INK}"/><path d="M118 200 V192 a12 12 0 0 1 24 0 V200" fill="none" stroke="${INK}" stroke-width="4"/>` +
        tl(
          160,
          226,
          ["Ravi \u00B7 marked can't-move \u00B7", "excluded, with reason"],
          "pf-sm",
          18,
        ),
    },
    {
      n: "07",
      title: "The Half That Looked Whole",
      cat: "PAYMENTS",
      helper: "DOCK",
      hook: "\u20B95,000 arrived. \u20B96,000 didn't.",
      broken: () =>
        card(50, 140, 300, 170) +
        tx(72, 180, "\u20B95,000 of \u20B911,000", "pf-mono") +
        `<rect x="150" y="200" width="120" height="44" fill="none" stroke="${RED}" stroke-width="3" transform="rotate(-8 210 222)"/>` +
        `<text x="162" y="230" class="pf-sm" fill="${RED}" font-weight="700" transform="rotate(-8 210 222)">PAID</text>` +
        note(240, 290, "part-paid", -4),
      fixed: () =>
        card(50, 140, 300, 170) +
        tl(
          72,
          180,
          ["Part-paid \u00B7", "\u20B96,000 still due"],
          "pf-mono",
          22,
        ) +
        box(72, 250, 256, 14, `fill="#EFE9DC" stroke="${INK}"`) +
        box(72, 250, (256 * 5) / 11, 14, `fill="${GRN}"`),
    },
    {
      n: "08",
      title: "Whose \u20B93,500?",
      cat: "PAYMENTS",
      helper: "DOCK",
      hook: "Close enough is how ledgers lie.",
      broken: () =>
        card(50, 150, 300, 110) +
        tx(66, 200, "\u2026/LAKSHMI P/\u2026/payment \u20B93,500", "pf-sm") +
        box(
          66,
          214,
          140,
          26,
          `rx="13" fill="none" stroke="${RED}" stroke-width="2"`,
        ) +
        tx(80, 232, "Sai Teja", "pf-sm", `fill="${RED}"`) +
        note(200, 300, "guessed", -3),
      fixed: () =>
        card(50, 150, 300, 150) +
        tl(
          72,
          190,
          ["Needs your choice \u00B7", "you picked: not a client payment"],
          "pf-mono",
          20,
        ) +
        `<circle cx="84" cy="250" r="8" fill="none" stroke="${INK}" stroke-width="2"/><circle cx="84" cy="250" r="4" fill="${INK}"/>` +
        `<circle cx="84" cy="280" r="8" fill="none" stroke="${INK}" stroke-width="2"/>`,
    },
    {
      n: "09",
      title: "Counted Twice",
      cat: "TRUST",
      helper: "DOCK",
      hook: "Expected and received, both in the total.",
      broken: () =>
        box(
          50,
          130,
          300,
          200,
          'fill="#FFFDF5" stroke="#8A8A8A" stroke-width="1.5"',
        ) +
        rule(170) +
        rule(200) +
        rule(230) +
        rule(260) +
        tl(
          64,
          162,
          ["expected 11,000 +", "received 5,000 = 16,000"],
          "pf-hand",
          26,
        ) +
        note(230, 300, "double", -5),
      fixed: () =>
        card(50, 130, 300, 200) +
        tl(
          72,
          170,
          ["\u20B95,000 moved from expected to cash \u00B7", "counted once"],
          "pf-sm",
          20,
        ) +
        chip(72, 240, 170, "re-import: 0 new", GRN),
    },
    {
      n: "10",
      title: "The Plan That Lied",
      cat: "TRUST",
      helper: "MEND",
      hook: "Optimism is not a rescue plan.",
      broken: () =>
        card(70, 150, 260, 160) +
        tx(92, 196, "All covered!", "pf-serif") +
        tl(
          92,
          232,
          ["\u20B933,000 gap", "options add up to \u20B930,500"],
          "pf-sm",
          20,
        ) +
        note(160, 340, "doesn't add up", -4),
      fixed: () =>
        card(50, 130, 300, 200) +
        tl(
          72,
          170,
          ["\u20B92,500 still uncovered \u00B7", "talk to Ravi before Friday"],
          "pf-mono",
          22,
        ) +
        `<g transform="rotate(-10 250 270)"><rect x="200" y="252" width="150" height="40" fill="none" stroke="${INK}" stroke-width="3"/><text x="212" y="279" class="pf-sm" fill="${INK}" font-weight="700">HONEST GAP</text></g>`,
    },
  ];
  const TOTAL = 30,
    NCASE = 10;
  const clampN = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const ss = (t) => {
    t = clampN(t);
    return t * t * (3 - 2 * t);
  };

  const wrap = $("#drying-wrap");
  const row = $("#dry-row");
  const strEl = $("#dry-string");
  const pathEl = $("#dry-path");
  const tabsEl = $("#dry-tabs");
  const capMasks = {
    title: $("#cap-title"),
    tag: $("#cap-tag"),
    hook: $("#cap-hook"),
  };

  const frontSVG = (c, scene) =>
    `<svg viewBox="0 0 400 500" aria-hidden="true" focusable="false">` +
    `<rect width="400" height="500" fill="#FBFAF6"/><rect x="18" y="18" width="364" height="422" fill="#F6EFDC"/>` +
    tx(36, 46, "Ananya Rao Photography", "pf-lock") +
    `<g>${scene()}</g>` +
    tx(
      200,
      478,
      `CASE \u2116 ${c.n} \u00B7 ${c.cat}`,
      "pf-tag",
      'text-anchor="middle"',
    ) +
    `</svg>`;
  // front carries both faces of the case: BROKEN sits under, FIXED fades in when the print is active
  const printHTML = (c) =>
    `<div class="print" role="button" tabindex="0" aria-label="Open case ${c.n}">` +
    `<div class="face front"><div class="fb">${frontSVG(c, c.broken)}</div><div class="ff">${frontSVG(c, c.fixed)}</div></div>` +
    `<div class="face back"><span class="back-n">\u2116 ${c.n} \u00B7 ${c.cat}</span><span class="back-stamp">CASHAHEAD LAB</span></div>` +
    `<svg class="peg" viewBox="0 0 34 40" aria-hidden="true">` +
    `<circle cx="17" cy="12" r="5" fill="none" stroke="#8A8F96" stroke-width="2"/>` +
    `<path class="pj-l" d="M6 16 H16 V36 Q11 38 6 34 Z" fill="#E6DCC6" stroke="#8B7A5C"/>` +
    `<path class="pj-r" d="M18 16 H28 V34 Q23 38 18 36 Z" fill="#E6DCC6" stroke="#8B7A5C"/></svg></div>`;

  // Each print shows its BROKEN or FIXED face on the front; the case pair is shown by the caption.
  const prints = [];
  for (let v = 0; v < TOTAL; v++) {
    const c = CASES[v % NCASE];
    const tpl = document.createElement("template");
    tpl.innerHTML = printHTML(c);
    const node = tpl.content.firstElementChild;
    row.appendChild(node);
    const p = { el: node, v, k: v % NCASE, hovered: false, lift: 0 };
    node.addEventListener("pointerenter", () => {
      p.hovered = true;
    });
    node.addEventListener("pointerleave", () => {
      p.hovered = false;
    });
    node.addEventListener("click", () => {
      if (Math.abs(p.r ?? 0) >= 0.5) goTo(p.k);
      else openSheet(p.k, node);
    });
    node.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;
      e.preventDefault();
      if (Math.abs(p.r ?? 0) >= 0.5) goTo(p.k);
      else openSheet(p.k, node);
    });
    prints.push(p);
  }

  let W = 0,
    H = 0,
    sag = 0,
    A = 1;
  const solveA = (half, s) => {
    let lo = 1,
      hi = 1e5;
    for (let i = 0; i < 80; i++) {
      const m = (lo + hi) / 2;
      const f = m * (Math.cosh(half / m) - 1) - s;
      if (f > 0) lo = m;
      else hi = m;
    }
    return (lo + hi) / 2;
  };
  // clothesline: ends at the top edge, centre dips by `sag`
  const yStr = (x) => sag - (A * Math.cosh(x / A) - A) + 2;
  const B = (r) =>
    Math.abs(r) < 1
      ? (r + Math.sin(Math.PI * r) / Math.PI) / 2
      : Math.sign(r) * 0.5;
  const place = (r) => {
    const w = 0.8 * H,
      g = 0.12 * H;
    return r * (0.42 * w + g) + (0.58 * w + g) * B(r);
  };
  const wrapR = (x) => ((((x + 15) % 30) + 30) % 30) - 15;

  function layout() {
    W = row.clientWidth;
    H = Math.min(
      0.43 * window.innerHeight,
      (window.innerWidth <= 820 ? 0.62 : 0.32) * window.innerWidth,
    );
    row.style.setProperty("--H", H + "px");
    row.style.setProperty("--pw", 0.8 * H + "px");
    sag = 0.03 * window.innerHeight;
    A = solveA(W / 2, sag);
    const pts = [];
    for (let i = 0; i <= 40; i++) {
      const x = -W / 2 + i * (W / 40);
      pts.push(
        `${i ? "L" : "M"}${(x + W / 2).toFixed(1)} ${yStr(x).toFixed(1)}`,
      );
    }
    pathEl.setAttribute("d", pts.join(" "));
    strEl.setAttribute("width", W);
    strEl.setAttribute("height", sag + 4);
    strEl.setAttribute("viewBox", `0 0 ${W} ${sag + 4}`);
  }

  // caption: masked lines that slide in the direction of travel
  function setCase(k, dir) {
    const c = CASES[k];
    const vals = { title: c.title, tag: c.cat, hook: c.hook };
    for (const key of Object.keys(capMasks)) {
      const mask = capMasks[key];
      const span = document.createElement("span");
      span.className = "cap-ln";
      span.textContent = vals[key];
      if (key === "tag") span.style.color = CATS[c.cat];
      mask.replaceChildren(span);
      if (!reduce) span.animate([
        {transform: "translateX("+dir*12+"px)", opacity:.4},
        {transform:"translateX(0)",opacity:1},
      ], {duration:220,easing:"ease-out"});
    }
  }

  function updateTabs(cat) {
    const btn = tabsEl.querySelector(`[data-cat="${cat}"]`);
    if (!btn) return;
    tabsEl
      .querySelectorAll(".dry-tab")
      .forEach((b) =>
        b.setAttribute("aria-current", b === btn ? "true" : "false"),
      );

  }

  function goTo(k) {
    const range = wrap.offsetHeight - window.innerHeight;
    const top =
      wrap.getBoundingClientRect().top + window.scrollY + (k / 9) * range;
    window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
  }

  tabsEl.addEventListener("click", (e) => {
    const b = e.target.closest("[data-cat]");
    if (!b) return;
    const cat = b.dataset.cat;
    goTo(cat === "ALL" ? 0 : CASES.findIndex((c) => c.cat === cat));
  });
  $("#dry-prev").addEventListener("click", () => goTo((curAct + 9) % 10));
  $("#dry-next").addEventListener("click", () => goTo((curAct + 1) % 10));

  // pointer lean for the active print
  const pt = { tY: 0, tX: 0, y: 0, x: 0 };
  row.addEventListener("pointermove", (e) => {
    const rc = row.getBoundingClientRect();
    pt.x = clampN(((e.clientX - rc.left) / rc.width) * 2 - 1, -1, 1);
    pt.y = clampN(((e.clientY - rc.top) / rc.height) * 2 - 1, -1, 1);
    pt.tY = -pt.x * 9;
    pt.tX = pt.y * 6;
  });
  row.addEventListener("pointerleave", () => {
    pt.tY = 0;
    pt.tX = 0;
  });
  let tiltY = 0,
    tiltX = 0;

  const readT = () => {
    const range = wrap.offsetHeight - window.innerHeight;
    const p = range > 0 ? clampN(-wrap.getBoundingClientRect().top / range) : 0;
    return 10 + p * 9;
  };

  let s = 10,
    last = performance.now(),
    curAct = -1;
  function frame(now) {
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    const T = readT();
    s = reduce ? T : s + (T - s) * (1 - Math.exp(-5.2 * dt));
    const act = ((Math.round(s) % NCASE) + NCASE) % NCASE;
    if (act !== curAct) {
      const dir = curAct < 0 || (act - curAct + 10) % 10 < 5 ? 1 : -1;
      if (curAct < 0) setCase(act, 1);
      else setCase(act, dir);
      updateTabs(CASES[act].cat);
      curAct = act;
    }
    const k = reduce ? 1 : 1 - Math.exp(-8 * dt);
    tiltY += (pt.tY - tiltY) * k;
    tiltX += (pt.tX - tiltX) * k;
    const sec = now / 1000;
    for (const p of prints) {
      const r = wrapR(p.v - s);
      p.r = r;
      const ar = Math.abs(r);
      const x = place(r);
      const w = 0.8 * H;
      p.el.style.visibility =
        Math.abs(x) > W / 2 + 1.5 * w ? "hidden" : "visible";
      const o = ss(1 - ar);
      const isActive = ar < 0.5;
      p.lift +=
        ((p.hovered && !isActive ? 1 : 0) - p.lift) *
        (reduce ? 1 : 1 - Math.exp(-10 * dt));
      const rotY = -Math.sign(r) * 64 * (1 - o) + tiltY * o;
      const rotX = tiltX * o;
      const tz = o * 0.18 * H;
      const ty = -p.lift * 0.04 * H;
      const sway = reduce ? 0 : 1.2 * Math.sin(1.3 * sec + r) * (1 - 0.7 * o);
      p.el.style.transform = `translate3d(${x.toFixed(2)}px, ${(yStr(x) + ty).toFixed(2)}px, ${tz.toFixed(2)}px) rotateZ(${sway.toFixed(3)}deg) rotateX(${rotX.toFixed(3)}deg) rotateY(${rotY.toFixed(3)}deg)`;
      p.el.style.zIndex = Math.round(100 - ar * 4);
      p.el.classList.toggle("sq", p.lift > 0.5);
      p.el.classList.toggle("on", isActive);
    }
  }

  // ---------- PRINT DETAIL SHEET ----------
  const SHEET_TEXT = [
    {
      wrong:
        "Bookings get confirmed in chat at midnight. The invoice never gets made, so the money never appears in any plan.",
      fix: "Enter the client, amount and due date from the chat. Save the invoice to include it in the studio ledger.",
    },
    {
      wrong:
        "Clients promise to pay 'after the festival' or 'after the album'. A promise with no date can't be planned around.",
      fix: "Ask the client for a calendar date and record the agreed amount and date on the invoice.",
    },
    {
      wrong:
        "Crew and rentals are due on the shoot day. The client's balance arrives whenever it arrives. The gap only shows up when it's too late.",
      fix: "SCOUT draws the next 30, 60 or 90 days, finds the first day a bill can't be covered, and shows what a late payment would do to it.",
    },
    {
      wrong:
        "Spreadsheets quietly treat overdue money as if it lands today, so the week looks safe when it isn't.",
      fix: "SCOUT leaves overdue money out of the forecast until you give it a date, using only dated inflows in the projection.",
    },
    {
      wrong:
        "Under pressure, people chase the biggest or the friendliest invoice, not the one that protects the next bill.",
      fix: "MEND ranks every action by how much it helps close the next short day, and tells you exactly how much to ask for and by when.",
    },
    {
      wrong:
        "When cash is short, the easiest person to delay is the one who can least afford it: your crew.",
      fix: "MEND never suggests moving a bill you've marked can't-move. It shows it as excluded, with the reason, so you see why.",
    },
    {
      wrong:
        "A part payment gets ticked off as paid, and the rest of the balance disappears from view.",
      fix: "DOCK records each payment against the invoice, marks it part-paid, and keeps the remaining balance in the forecast.",
    },
    {
      wrong:
        "Bank narrations are messy. Matching by amount alone puts money against the wrong client.",
      fix: "DOCK matches by the invoice reference first. When two clients could fit, it asks you instead of guessing.",
    },
    {
      wrong:
        "Money gets counted once when it's expected and again when it arrives, or a statement gets imported twice.",
      fix: "DOCK moves money from expected to cash exactly once and skips any transaction it has already seen.",
    },
    {
      wrong:
        "A plan that says 'all covered' when it isn't is worse than no plan: you find out on the shoot day.",
      fix: "MEND tests every combination of actions and, when none closes the gap, says how much is still uncovered and what to do next.",
    },
  ];
  // circles: [cx, cy, delay ms] for the fixed-print reveal mask
  const MASK_CIRCLES = [
    [140, 260, 0],
    [320, 440, 120],
    [240, 110, 220],
    [80, 420, 300],
    [320, 220, 360],
    [190, 470, 420],
    [210, 340, 180],
  ];
  const sheet = $("#sheet");
  const sheetTray = $("#sheet-tray");
  const sheetClose = $("#sheet-close");
  let sheetOrigin = null;

  function fillSheet(k) {
    const c = CASES[k];
    const t = SHEET_TEXT[k];
    const honest = k === NCASE - 1;
    $("#sheet-tag").textContent = `CASE \u2116 ${c.n} \u00B7 ${c.cat}`;
    $("#sheet-title").textContent = c.title;
    $("#sheet-wrong").textContent = t.wrong;
    $("#sheet-fix").textContent = t.fix;
    $("#sheet-helper").textContent = `Helper: ${c.helper}`;
    const circles = MASK_CIRCLES.map(
      ([x, y, d]) =>
        `<circle class="mk" cx="${x}" cy="${y}" r="640" style="animation-delay:${d}ms"/>`,
    ).join("");
    sheetTray.innerHTML =
      `<div class="layer">${frontSVG(c, c.broken)}</div>` +
      `<div class="layer"><svg viewBox="0 0 400 500" aria-hidden="true" focusable="false">` +
      `<defs>` +
      `<filter id="sh-warp" filterUnits="userSpaceOnUse" x="-100" y="-100" width="600" height="700">` +
      `<feTurbulence type="fractalNoise" baseFrequency=".02" numOctaves="3" seed="4" result="n"/>` +
      `<feDisplacementMap in="SourceGraphic" in2="n" scale="60" xChannelSelector="R" yChannelSelector="G"/>` +
      `</filter>` +
      `<mask id="sh-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="400" height="500">` +
      `<g filter="url(#sh-warp)">${circles}</g>` +
      `</mask>` +
      `</defs>` +
      `<g mask="url(#sh-mask)">${frontSVG(c, c.fixed)}</g>` +
      `</svg></div>` +
      `<p class="stamp ${honest ? "stamp-honest" : "stamp-fixed"}">${honest ? "HONEST GAP" : "FIXED \u2713"}</p>`;
  }

  function openSheet(k, originEl) {
    sheetOrigin = originEl || null;
    fillSheet(k);
    sheet.classList.toggle("still", reduce);
    sheet.hidden = false;
    sheet.classList.add("open");
    void sheet.offsetWidth; // commit display before the entrance transition
    sheet.classList.add("in");
    const L = window.lenis;
    if (L) L.stop();
    sheetClose.focus();
  }

  function closeSheet() {
    if (sheet.hidden) return;
    sheet.classList.remove("in", "open");
    sheet.hidden = true;
    const L = window.lenis;
    if (L) L.start();
    if (sheetOrigin && sheetOrigin.isConnected)
      sheetOrigin.focus({ preventScroll: true });
    sheetOrigin = null;
  }

  sheetClose.addEventListener("click", () => closeSheet());
  $("#sheet-desk").addEventListener("click", () => {
    closeSheet();
    $("#desk").scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !sheet.hidden) closeSheet();
  });

  wrap.classList.add("ready");
  layout();
  updateTabs("CAPTURE");
  window.addEventListener("resize", () => {
    layout();
    updateTabs(CASES[Math.max(curAct, 0)].cat);
  });
  runWhileVisible(wrap, frame);
}

// ---- feature slider ----
(function featureSlider() {
  const root = document.getElementById("slider");
  if (!root) return;
  const slides = [...root.querySelectorAll(".slide")];
  const rail = [...root.querySelectorAll("#rail button")];
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  let timer = null,
    visible = false,
    cur = 0;
  function show(i) {
    cur = i;
    slides.forEach((slide, k) => {
      slide.classList.toggle("on", k === i);
      slide.setAttribute("aria-hidden", String(k !== i));
    });
    rail.forEach((button, k) => {
      button.classList.toggle("on", k === i);
      button.setAttribute("aria-pressed", String(k === i));
    });
  }
  show(0);
  rail.forEach((b, k) => b.addEventListener("click", () => show(k)));
  function start() {
    stop();
    if (!reduceMotion && !root.contains(document.activeElement))
      timer = setInterval(() => show((cur + 1) % slides.length), 6200);
  }
  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
  }
  new IntersectionObserver((es) =>
    es.forEach((e) => {
      visible = e.isIntersecting;
      visible ? start() : stop();
    }),
  ).observe(root);
  root.addEventListener("focusin", stop);
  root.addEventListener("focusout", () => {
    if (visible) start();
  });

})();

(function arcCarousel() {
  const row = document.querySelector("#carousel .row");
  if (!row) return;
  const cards = [...row.querySelectorAll(":scope > .card")];
  const N = cards.length;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let offset = 0,
    velocity = 0,
    dragging = false,
    lastX = 0,
    lastT = 0,
    auto = !reduce;
  const SPEED = 0.0018;
  function layout() {
    const W = row.clientWidth;
    const R = Math.min(W * 0.48, 620);
    cards.forEach((c, i) => {
      const a = (i / N + offset) % 1;
      const ang = a * Math.PI * 2;
      const x = Math.sin(ang) * R;
      const depth = (1 - Math.cos(ang)) / 2;
      const y = depth * 40;
      const s = 0.72 + (1 - depth) * 0.28;
      c.style.transform =
        "translate(-50%,-50%) translate(" +
        x +
        "px," +
        y +
        "px) scale(" +
        s +
        ")";
      c.style.zIndex = String(Math.round(100 - depth * 100));
      c.style.opacity = String(0.55 + (1 - depth) * 0.45);
    });
  }
  function frame(t) {
    const dt = Math.min(0.05, (t - (lastT || t)) / 1000);
    lastT = t;
    if (!dragging) {
      if (Math.abs(velocity) > 0.00001) {
        offset += velocity * dt * 60;
        velocity *= Math.pow(0.05, dt);
      } else if (auto) {
        offset += SPEED * dt * 60;
      }
      offset = ((offset % 1) + 1) % 1;
      layout();
    }
  }
  row.addEventListener("pointerdown", (e) => {
    dragging = true;
    row.classList.add("dragging");
    lastX = e.clientX;
    velocity = 0;
    row.setPointerCapture(e.pointerId);
  });
  row.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    lastX = e.clientX;
    const delta = dx / (row.clientWidth * 0.9);
    offset += delta;
    velocity = (delta / 0.016) * 0.02;
    layout();
  });
  function end() {
    dragging = false;
    row.classList.remove("dragging");
  }
  row.addEventListener("pointerup", end);
  row.addEventListener("pointercancel", end);
  row.addEventListener("pointerleave", () => {
    if (dragging) end();
  });
  window.addEventListener("resize", layout);
  layout();
  runWhileVisible(row, frame);
})();
