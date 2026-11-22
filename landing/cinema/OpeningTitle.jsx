"use client";
import { useEffect, useRef } from "react";
export default function OpeningTitle() {
  const card = useRef(null),
    host = useRef(null);
  useEffect(() => {
    const el = card.current,
      media = matchMedia("(prefers-reduced-motion:reduce)");
    let engine,
      closed = false,
      generation = 0;
    const update = () =>
      engine?.set({
        zoom: parseFloat(el.style.getPropertyValue("--lens-zoom")) || 1,
        y: (parseFloat(el.style.getPropertyValue("--lens-y")) || 50) / 100,
        progress: parseFloat(el.style.getPropertyValue("--entry")) || 0,
      });
    async function load() {
      const version = ++generation;
      engine?.dispose();
      engine = null;
      el.removeAttribute("data-model");
      if (media.matches) return;
      try {
        const { mountCover } = await import("./cover-set");
        if (closed || version !== generation) return;
        engine = mountCover(host.current, {
          ready: () => el.setAttribute("data-model", ""),
          lost: () => el.removeAttribute("data-model"),
        });
        update();
      } catch {
        el.removeAttribute("data-model");
      }
    }
    el.addEventListener("cover-frame", update);
    media.addEventListener("change", load);
    load();
    return () => {
      closed = true;
      el.removeEventListener("cover-frame", update);
      media.removeEventListener("change", load);
      engine?.dispose();
    };
  }, []);
  return (
    <section
      ref={card}
      id="studio-opening"
      className="brand-opening"
      aria-label="CashAhead introduction"
    >
      <div className="lens-backdrop">
        <div className="brand-lockup">
          <h1 className="opening-word">
            CashAhead<span>.</span>
          </h1>
        </div>
        <img
          className="cover-sheet"
          src="/images/opening-atelier.webp"
          width="1320"
          height="660"
          alt=""
          fetchPriority="high"
        />
        <div className="cover-surface" ref={host} aria-hidden="true" />
      </div>
      <div className="opening-lens" aria-hidden="true" />
      <div className="cover-nav">
        <a href="/" aria-label="CashAhead home">
          <img src="/mark.svg" width="32" height="32" alt="" /> CashAhead
        </a>
        <nav className="cover-actions" aria-label="Enter CashAhead">
          <a className="sample-door" href="/app" aria-label="Try the sample studio">Sample studio</a>
          <a className="cover-studio judge-door" href="/?demo=friday">
            Try the judge demo <span aria-hidden="true">↗</span>
          </a>
        </nav>
      </div>
      <div className="cover-intro">
        <h2>Know your Friday.</h2>
        <p>
          A cash forecast for independent photographers. Follow one invoice
          through the studio.
        </p>
      </div>
      <div className="cover-ledger">
        <span>Monday’s opening cash</span>
        <strong>₹6,000</strong>
        <div>
          <i /> Crew &amp; lens bill <b>₹10,000 · Fri</b>
        </div>
      </div>
      <a
        className="opening-cue"
        href="#jot-desk"
        aria-label="Scroll into the studio"
      >
        <span aria-hidden="true">↓</span> Scroll through the lens
      </a>
      <noscript>
        <style>
          {
            ".brand-opening{position:relative!important}.brand-opening .opening-cue{opacity:1}"
          }
        </style>
      </noscript>
    </section>
  );
}
