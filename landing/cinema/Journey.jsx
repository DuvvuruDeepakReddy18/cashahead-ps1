"use client";
import { useEffect, useRef } from "react";

import { ease } from "./scene-clock.js";
import frames from "./invoice-frames.json";

const entries = [
  [
    "Mon 09:10",
    "Jot",
    "Notebook entered",
    "Ananya enters a booking from her notebook. One payment still needs a date.",
  ],
  [
    "Mon 18:10",
    "Scout",
    "A gap on Friday",
    "If Reddy–Varma pays 15 days late, Friday falls ₹4,000 short.",
  ],
  [
    "Tue 09:12",
    "Mend",
    "An earlier invoice",
    "Kiran and Divya owe ₹8,000 on INV-101. Half would cover the gap.",
  ],
  [
    "Tue 09:15",
    "Ananya",
    "Reminder sent",
    "Ananya reviews the reminder for INV-101 and sends it to the client.",
  ],
  [
    "Wed 16:02",
    "Bank",
    "₹5,000 arrives",
    "The bank credits ₹5,000. The UPI reference includes INV-101.",
  ],
  [
    "Wed 20:30",
    "Dock",
    "Payment matched",
    "Dock pairs the bank entry with INV-101. Ananya confirms.",
  ],
  [
    "Wed 20:30",
    "Scout",
    "Friday is covered",
    "Friday’s forecast rises to +₹1,000. The invoice still has ₹3,000 due.",
  ],
  [
    "Wed 20:31",
    "Dock",
    "Counted once",
    "Ananya imports the statement again. Dock recognises the same payment and adds zero new entries.",
  ],
];
const crew = new Set(["Jot", "Scout", "Mend", "Dock"]);

function ribbon(points, turn = 0.58) {
  return points.reduce((d, point, i) => {
    if (!i) return "M " + point.x + " " + point.y;
    const last = points[i - 1];
    const bend = (point.y - last.y) * turn;
    return (
      d +
      " C " +
      last.x +
      " " +
      (last.y + bend) +
      ", " +
      point.x +
      " " +
      (point.y - bend) +
      ", " +
      point.x +
      " " +
      point.y
    );
  }, "");
}
const fallback = ribbon(
  entries.map((_, i) => ({ x: i % 2 ? 530 : 470, y: 65 + i * 150 })),
);

export default function Journey({ stage, onTrack, live }) {
  const route = useRef(null),
    overlay = useRef(null),
    print = useRef(null);
  useEffect(() => {
    const el = route.current,
      layer = overlay.current,
      sheet = print.current;
    const svg = el.querySelector(".trail-map"),
      ink = svg.querySelector(".trail-ink");
    const lead = layer.querySelector(".invoice-thread path");
    const nodes = [...el.querySelectorAll(".trail-node")],
      origin = el.querySelector(".trail-origin");
    const motion = matchMedia(
      "(min-height:320px) and (prefers-reduced-motion:no-preference)",
    );
    const portrait = matchMedia("(orientation:portrait)");
    let length = 0,
      samples = [],
      stops = [],
      raf = 0,
      released = false;
    function clear() {
      if (released) onTrack(null, layer);
      released = false;
      layer.removeAttribute("data-following");
      sheet.hidden = true;
    }
    function thread(frame, area) {
      const endX = area.left + samples[0].x,
        endY = area.top + samples[0].y;
      const distance = endY - frame.edgeY;
      if (!(distance > 0) || frame.mix < 0.15) {
        lead.removeAttribute("d");
        return;
      }
      const bend = distance * 0.45;
      lead.setAttribute(
        "d",
        "M " +
          frame.edgeX +
          " " +
          frame.edgeY +
          " C " +
          frame.edgeX +
          " " +
          (frame.edgeY + bend) +
          ", " +
          endX +
          " " +
          (endY - bend) +
          ", " +
          endX +
          " " +
          endY,
      );
      lead.style.opacity = ease(frame.mix, 0.15, 0.55);
    }
    function update() {
      raf = 0;
      if (!length || !stage.current) return;
      const area = el.getBoundingClientRect(),
        view = stage.current.getBoundingClientRect();
      const eye = innerHeight * 0.53,
        y = eye - area.top;
      let lo = 0,
        hi = samples.length - 1;
      while (lo + 1 < hi) {
        const mid = (lo + hi) >> 1;
        if (samples[mid].y < y) lo = mid;
        else hi = mid;
      }
      const a = samples[lo],
        b = samples[hi];
      const t = Math.max(0, Math.min(1, (y - a.y) / (b.y - a.y || 1)));
      const dist = a.at + (b.at - a.at) * t;
      ink.style.strokeDashoffset = String(motion.matches ? length - dist : 0);
      stops.forEach((pt, i) =>
        nodes[i].parentElement.toggleAttribute(
          "data-passed",
          !motion.matches || y >= pt.y - 1,
        ),
      );
      if (!motion.matches || view.top >= -0.1 || area.bottom < -100) {
        clear();
        return;
      }
      const tip = ink.getPointAtLength(dist),
        last = stops[stops.length - 1];
      const mix = ease(-view.top, 0, innerHeight * 0.66),
        narrow = innerWidth <= 760;
      const frame = {
        offset: view.top,
        mix,
        x: area.left + tip.x,
        y: Math.min(eye, area.top + last.y),
        size: narrow ? 43 : 63,
        lean: Math.atan2(b.x - a.x, b.y - a.y) * 0.47,
      };
      released = true;
      layer.setAttribute("data-following", "");
      if (onTrack(frame, layer)) {
        sheet.hidden = true;
        thread(frame, area);
        return;
      }
      // In the filmed version take the sheet out of the exact last frame.
      const rect = stage.current.parentElement
        .querySelector(".studio-stills")
        .getBoundingClientRect();
      const orientation = portrait.matches ? "portrait" : "wide",
        meta = frames[orientation];
      const scale = Math.min(
        rect.width / meta.width,
        rect.height / meta.height,
      );
      const sx =
        rect.left + (rect.width - meta.width * scale) / 2 + meta.x * scale;
      const sy =
        rect.top + (rect.height - meta.height * scale) / 2 + meta.y * scale;
      sheet.hidden = false;
      if (sheet.dataset.format !== orientation) {
        sheet.src = "/images/invoice-matched-" + orientation + ".webp";
        sheet.dataset.format = orientation;
      }
      const h = meta.paperHeight * scale * (1 - mix) + frame.size * mix;
      frame.edgeX = sx + (frame.x - sx) * mix;
      frame.edgeY = sy + (frame.y - sy) * mix + h * 0.49;
      thread(frame, area);
      sheet.style.width = (h * meta.paperWidth) / meta.paperHeight + "px";
      sheet.style.transform =
        "translate3d(" +
        (sx + (frame.x - sx) * mix) +
        "px," +
        (sy + (frame.y - sy) * mix) +
        "px,0) translate(-50%,-50%) rotate(" +
        frame.lean * mix +
        "rad)";
    }
    function schedule() {
      if (!raf) raf = requestAnimationFrame(update);
    }
    function measure() {
      const bounds = el.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      const center = (node) => {
        const b = node.getBoundingClientRect();
        return {
          x: b.left + b.width / 2 - bounds.left,
          y: b.top + b.height / 2 - bounds.top,
        };
      };
      stops = nodes.map(center);
      svg.setAttribute("viewBox", "0 0 " + bounds.width + " " + bounds.height);
      const d = ribbon([center(origin), ...stops], 0.44);
      svg.querySelectorAll("path").forEach((path) => path.setAttribute("d", d));
      length = ink.getTotalLength();
      samples = Array.from({ length: 321 }, (_, i) => {
        const at = (length * i) / 320,
          pt = ink.getPointAtLength(at);
        return { at, x: pt.x, y: pt.y };
      });
      ink.style.strokeDasharray = String(length);
      update();
    }
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    ro.observe(stage.current);
    motion.addEventListener("change", measure);
    window.addEventListener("scroll", schedule, { passive: true });
    measure();
    return () => {
      clear();
      ro.disconnect();
      cancelAnimationFrame(raf);
      motion.removeEventListener("change", measure);
      window.removeEventListener("scroll", schedule);
    };
  }, [stage, onTrack, live]);
  return (
    <>
      <div ref={overlay} className="invoice-flight" aria-hidden="true">
        <svg className="invoice-thread" aria-hidden="true">
          <path fill="none" />
        </svg>
        <img ref={print} hidden alt="" />
      </div>
      <section id="journey" aria-labelledby="journey-title">
        <div className="payment-trail" ref={route}>
          <i className="trail-origin" aria-hidden="true" />
          <svg
            className="trail-map"
            viewBox="0 0 1000 1180"
            preserveAspectRatio="none"
            fill="none"
            aria-hidden="true"
          >
            <path className="trail-depth" d={fallback} />
            <path className="trail-track" d={fallback} />
            <path className="trail-ink" d={fallback} />
          </svg>
          <header className="trail-title">
            <span className="label">Ananya’s payment record · INV-101</span>
            <h2 id="journey-title">
              Every rupee has <em>one story.</em>
            </h2>
          </header>
          <ol className="trail-events">
            {entries.map(([time, who, title, detail]) => (
              <li className="trail-event" key={title}>
                <i className="trail-node" aria-hidden="true" />
                <article className="trail-card">
                  <div className="trail-meta">
                    {crew.has(who) && (
                      <img
                        src={"/images/cast-" + who.toLowerCase() + ".webp"}
                        width="30"
                        height="30"
                        alt=""
                        loading="lazy"
                      />
                    )}
                    <strong>{who}</strong>
                    <span>{time}</span>
                  </div>
                  <h3>{title}</h3>
                  <p>{detail}</p>
                </article>
              </li>
            ))}
          </ol>
        </div>
        <p className="end">
          CashAhead drafts the reminder and suggests a match. Ananya sends the
          message and confirms the payment.
        </p>
      </section>
    </>
  );
}
