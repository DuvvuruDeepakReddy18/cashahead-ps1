"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Journey from "./Journey";
import { paymentRow, rupees, simulate } from "../lib/forecast.mjs";

import {
  chapterAt,
  delayMark,
  ease,
  jobProgress,
  lensExit,
  studioScroll,
  studioTime,
  matchMark,
  takes,
} from "./scene-clock.js";

const late = simulate(15);
const scenes = [
  {
    id: "booking",
    crew: "Jot",
    day: "Monday morning",
    tab: "Book",
    title: "Friday’s crew is booked.",
    text: "Jot writes up the ₹11,000 wedding invoice, due Thursday. Ananya has ₹6,000 on hand and owes her crew and lens supplier ₹10,000 on Friday.",
    label: "Friday forecast",
    value: simulate().friday,
  },
  {
    id: "delay",
    crew: "Scout",
    day: "Monday evening",
    tab: "Delay",
    title: "The client needs fifteen more days.",
    text: "Scout scans INV-104 and moves its expected receipt 15 days later. The crew and lens bills stay put. Ananya can see the ₹4,000 shortfall before the shoot.",
    label: "Friday forecast",
    value: late.friday,
  },
  {
    id: "plan",
    crew: "Mend",
    day: "Tuesday morning",
    tab: "Plan",
    title: "One follow-up could cover it.",
    text: "Kiran and Divya owe ₹8,000 from an earlier shoot. Mend pulls INV-101 from the overdue file. Collecting half by Friday would cover both bills.",
    label: "Needed by Friday",
    value: -late.friday,
  },
  {
    id: "payment",
    crew: "Dock",
    day: "Wednesday evening",
    tab: "Match",
    title: "Ananya confirms the match.",
    text: "Kiran and Divya send ₹5,000. Dock finds INV-101 in the bank reference. Ananya checks it once. Friday is covered and ₹3,000 is still due.",
    label: "Friday forecast",
    value: simulate(15, paymentRow.amount).friday,
  },
];
const clamped = (p) => Math.max(0, Math.min(1, p));

export default function Album() {
  const section = useRef(null),
    pin = useRef(null),
    host = useRef(null),
    engine = useRef(null),
    video = useRef(null),
    ready3D = useRef(false),
    backupPass = useRef(false),
    insets = useRef([0, 0]),
    playhead = useRef(0),
    scrollHead = useRef(0),
    performing = useRef(false),
    opening = useRef(null),
    mast = useRef(null),
    lensSize = useRef({ radius: 1, travel: 1 }),
    entryProgress = useRef(null);
  const [active, setActive] = useState(0),
    [live, setLive] = useState(false),
    [backup, setBackup] = useState(false),
    [videoReady, setVideoReady] = useState(false),
    [pending, setPending] = useState(false);
  const trackInvoice = useCallback((frame, layer) => {
    const useModel = ready3D.current && !backupPass.current && engine.current;
    engine.current?.setTrail(useModel ? frame : null, layer);
    if (frame)
      section.current?.style.setProperty(
        "--dock-exit",
        ease(frame.mix, 0.1, 0.55),
      );
    else section.current?.style.removeProperty("--dock-exit");
    section.current?.toggleAttribute("data-invoice-away", !!frame && !useModel);
    return !!useModel;
  }, []);
  function syncVideo() {
    const player = video.current;
    if (
      !player ||
      !Number.isFinite(player.duration) ||
      player.seeking ||
      player.readyState < 1
    )
      return;
    const target = playhead.current * Math.max(0, player.duration - 1 / 24);
    if (Math.abs(target - player.currentTime) > 0.51 / 24) {
      player.currentTime = target;
    } else if (player.readyState >= 2) setVideoReady(true);
  }
  function apply(p) {
    const value = clamped(p);
    playhead.current = value;
    section.current?.style.setProperty("--playhead", value);
    if (!backupPass.current)
      engine.current?.setProgress(value, performing.current);
    syncVideo();
    section.current?.style.setProperty("--push", ease(value, 0.008, 0.105));
    section.current.style.setProperty(
      "--fallback-blend",
      ease(value, 0.016, takes[0].start),
    );
    const chapter = chapterAt(value);
    setActive(chapter);
    setPending(
      (chapter === 1 && jobProgress(value, 1) < delayMark) ||
        (chapter === 3 && jobProgress(value, 3) < matchMark),
    );
  }
  function scrub(scroll) {
    scrollHead.current = scroll;
    const time = studioTime(scroll);
    const entry = clamped(scroll / lensExit);
    performing.current = entry > 0.9;
    if (entry > 0.08 && !ready3D.current && !backupPass.current) {
      backupPass.current = true;
      setBackup(true);
    } else if (entry < 0.012 && ready3D.current && backupPass.current) {
      backupPass.current = false;
      setLive(true);
      setBackup(false);
      setVideoReady(false);
    }
    const card = opening.current;
    if (card && entryProgress.current !== entry) {
      entryProgress.current = entry;
      const zoom = Math.pow(lensSize.current.travel, ease(entry, 0, 1));
      const iris = ease(entry, 0.095, 0.47);
      const lift = ease(entry, 0, 0.65);
      card.style.setProperty("--lens-zoom", zoom);
      card.style.setProperty(
        "--iris",
        lensSize.current.radius * iris * zoom + "px",
      );
      card.style.setProperty("--lens-y", "50%");
      card.style.setProperty("--entry", entry);
      card.dispatchEvent(new Event("cover-frame"));
      card.style.setProperty("--emblem", 1 - ease(entry, 0.014, 0.23));
      card.style.setProperty("--glass", 1 - ease(entry, 0.08, 0.38));
      card.style.setProperty("--lens-turn", 36 * lift + "deg");
      card.style.setProperty("--word", 1 - ease(entry, 0.035, 0.38));
      card.style.setProperty("--word-drift", 68 * lift + "px");
      card.style.setProperty("--word-scale", 1 + 0.17 * lift);
      card.toggleAttribute("data-flying", entry > 0.12);
      card.toggleAttribute("data-through", entry >= 1);
      card.setAttribute("data-driven", "");
    }
    const chrome = ease(time, 0.05, 0.11);
    section.current.style.setProperty("--immersive", 1 - chrome);
    if (mast.current) {
      mast.current.style.setProperty("--mast-opacity", chrome);
      mast.current.inert = chrome < 0.12;
    }
    pin.current.querySelector(".scene-tracks").inert = chrome < 0.12;
    apply(time);
  }
  function range() {
    const distance = section.current.offsetHeight - pin.current.offsetHeight;
    return distance > 2 ? distance : 0;
  }
  function jump(index) {
    const height = range(),
      p = takes[index].hold;
    if (
      !height ||
      !matchMedia(
        "(min-height:320px) and (prefers-reduced-motion:no-preference)",
      ).matches
    ) {
      apply(p);
      return;
    }
    const inset = parseFloat(getComputedStyle(pin.current).top) || 0;
    const start = scrollY + section.current.getBoundingClientRect().top - inset;
    window.scrollTo({
      top: start + studioScroll(p) * height,
      behavior: "instant",
    });
    scrub(studioScroll(p));
  }
  useEffect(() => {
    let disposed = false,
      token = 0;
    const cinematic = matchMedia(
      "(min-height:320px) and (prefers-reduced-motion:no-preference)",
    );
    opening.current = document.getElementById("studio-opening");
    mast.current = document.querySelector(".studio-mast");
    const strip = pin.current.querySelector(".story-strip");
    const tracks = pin.current.querySelector(".scene-tracks");
    const lens = opening.current.querySelector(".opening-lens");
    let lastFrame = 0,
      scrollStart = 0,
      scrollDistance = 0;
    const update = (now, immediate = false) => {
      token = 0;
      const distance = scrollDistance;
      if (cinematic.matches && distance) {
        const target = clamped((window.scrollY - scrollStart) / distance);
        if (
          !immediate &&
          target === scrollHead.current &&
          entryProgress.current !== null
        ) {
          lastFrame = 0;
          return;
        }
        const delta = target - scrollHead.current;
        // Smooth the same playhead for every station. Explicit chapter navigation
        // and restored scroll positions are applied directly.
        if (
          !immediate &&
          window.lenis?.isScrolling !== "smooth" &&
          target > 0 &&
          target < 1 &&
          Math.abs(delta) * distance > 0.2
        ) {
          const elapsed = Math.min(
            100,
            Math.max(1, now - (lastFrame || now - 16)),
          );
          scrub(scrollHead.current + delta * (1 - Math.exp(-elapsed / 57)));
          lastFrame = now;
          token = requestAnimationFrame(update);
        } else {
          scrub(target);
          lastFrame = 0;
        }
      }
    };
    const schedule = () => {
      if (!token) token = requestAnimationFrame(update);
    };
    let previousMode;
    const measure = () => {
      scrollDistance = range();
      scrollStart =
        window.scrollY +
        section.current.getBoundingClientRect().top -
        (parseFloat(getComputedStyle(pin.current).top) || 0);
      const card = opening.current;
      // Measure the untransformed lens. Only its clear bore, not its rim,
      // must cover the farthest corner at the end of the move.
      const radius = lens.offsetWidth * 0.34;
      const diagonal = Math.hypot(
        card.offsetWidth * 0.5,
        card.offsetHeight * 0.55,
      );
      lensSize.current = {
        radius,
        travel: (diagonal + 12) / Math.max(1, lens.offsetWidth * 0.315),
      };
      entryProgress.current = null;
      section.current.style.setProperty(
        "--panel-stack",
        strip.offsetHeight + tracks.offsetHeight + "px",
      );
      section.current.style.setProperty(
        "--entry-anchor",
        range() * studioScroll(takes[0].start) + "px",
      );
      if (!cinematic.matches) {
        performing.current = true;
        if (previousMode !== false) apply(takes[0].hold);
        card.removeAttribute("data-through");
        card.removeAttribute("data-flying");
        card.removeAttribute("style");
        mast.current.inert = false;
        tracks.inert = false;
        mast.current.style.removeProperty("--mast-opacity");
        section.current.style.removeProperty("--immersive");
      }
      insets.current = cinematic.matches
        ? [mast.current.offsetHeight, strip.offsetHeight + tracks.offsetHeight]
        : [0, 0];
      engine.current?.setInsets(...insets.current);
      const modeChanged = previousMode !== cinematic.matches;
      previousMode = cinematic.matches;
      if (modeChanged) {
        cancelAnimationFrame(token);
        update(performance.now(), true);
      } else schedule();
    };
    const ro = new ResizeObserver(measure);
    ro.observe(strip);
    ro.observe(tracks);
    ro.observe(opening.current);
    cinematic.addEventListener("change", measure);
    ro.observe(section.current);
    ro.observe(pin.current);
    window.addEventListener("scroll", schedule, { passive: true });
    measure();
    import("./puppet-stage")
      .then(({ mountPuppetStage }) => {
        if (disposed) return;
        engine.current = mountPuppetStage(host.current, {
          onLost: () => {
            if (disposed) return;
            ready3D.current = false;
            backupPass.current = true;
            setLive(false);
            setVideoReady(false);
            setBackup(true);
          },
          onReady: () => {
            if (disposed) return;
            ready3D.current = true;
            if (!backupPass.current) setLive(true);
          },
        });
        engine.current.setInsets(...insets.current);
        engine.current.setProgress(
          playhead.current,
          performing.current && !backupPass.current,
        );
      })
      .catch(() => {
        if (disposed) return;
        ready3D.current = false;
        backupPass.current = true;
        setBackup(true);
        setLive(false);
      });
    return () => {
      disposed = true;
      cancelAnimationFrame(token);
      window.removeEventListener("scroll", schedule);
      ro.disconnect();
      cinematic.removeEventListener("change", measure);
      mast.current.inert = false;
      mast.current.style.removeProperty("--mast-opacity");
      engine.current?.dispose();
      engine.current = null;
    };
  }, []);
  const s = scenes[active];
  const amount = pending
    ? active === 1
      ? scenes[0].value
      : late.friday
    : s.value;
  const title = pending
    ? active === 1
      ? "Scout checks Thursday’s payment."
      : "Dock checks the bank reference."
    : s.title;
  const caption = pending
    ? active === 1
      ? "Reddy–Varma asks for fifteen more days. Scout scans INV-104 to see which bills will fall due first."
      : "Kiran and Divya have sent ₹5,000. Dock lines up their bank reference with INV-101 for Ananya to review."
    : s.text;
  const still = s.id;
  return (
    <>
      <section
        id="week"
        ref={section}
        className="shoot-week"
        data-beat={s.id}
        aria-label="Ananya’s studio week"
      >
        <noscript>
          <style>
            {
              ".shoot-week{height:auto!important}.entry-waypoint{top:0!important}.shoot-pin{position:relative;top:auto;height:auto}.shoot-world{position:relative!important;inset:auto!important;height:410px}.studio-stills{inset:0!important}.scene-tracks nav,.scroll-cue{display:none}"
            }
          </style>
        </noscript>
        <span
          id="jot-desk"
          className="entry-waypoint"
          tabIndex={-1}
          aria-label="Jot’s booking desk"
        />
        <div className="shoot-pin" ref={pin}>
          <div className="shoot-world">
            <div className="halftone corner-a" aria-hidden="true" />
            <div className="halftone corner-b" aria-hidden="true" />
            <div className="sky-sun" aria-hidden="true" />
            <div className="sky-orbit" aria-hidden="true" />
            <h2 className="film-heading">The Cash Crew</h2>
            <div
              className="puppet-camera"
              role="img"
              aria-label={
                "An animated miniature photo studio. " +
                s.crew +
                " is working on the " +
                s.id +
                "."
              }
            >
              <div className={"studio-stills" + (live ? " live-stills" : "")}>
                {active === 0 && (
                  <picture className="entry-poster">
                    <source
                      media="(max-width:640px)"
                      srcSet="/images/film-opening-small.webp"
                    />
                    <img
                      className="world-poster"
                      src="/images/film-opening.webp"
                      width="1440"
                      height="560"
                      alt=""
                    />
                  </picture>
                )}
                <picture>
                  <source
                    media="(max-width:640px)"
                    srcSet={"/images/film-" + still + "-small.webp"}
                  />
                  <img
                    className={
                      "world-poster" + (active === 0 ? " booking-poster" : "")
                    }
                    src={"/images/film-" + still + ".webp"}
                    alt=""
                    width="1440"
                    height="560"
                    fetchPriority="high"
                  />
                </picture>
                {backup && (
                  <video
                    ref={video}
                    className={"backup-film" + (videoReady ? " has-frame" : "")}
                    preload="auto"
                    muted
                    playsInline
                    aria-hidden="true"
                    onLoadedData={syncVideo}
                    onSeeked={syncVideo}
                    onError={() => setVideoReady(false)}
                  >
                    <source
                      media="(orientation:portrait)"
                      src="/images/crew-tracking-portrait.mp4"
                      type="video/mp4"
                    />
                    <source
                      src="/images/crew-tracking-wide.mp4"
                      type="video/mp4"
                    />
                  </video>
                )}
                <picture className="released-desk" aria-hidden="true">
                  <source
                    media="(orientation: portrait)"
                    srcSet="/images/dock-released-portrait.webp"
                  />
                  <img
                    src="/images/dock-released-wide.webp"
                    alt=""
                    loading="lazy"
                  />
                </picture>
              </div>
              <div
                ref={host}
                className={"world-viewport" + (live ? " ready" : "")}
              />
            </div>
          </div>
          <div className="story-strip">
            <div className="strip-inner">
              <div className="beat-caption" aria-live="polite">
                <p className="scene-byline">
                  <i /> {s.day} <span> / </span> {s.crew}
                </p>
                <h2>{title}</h2>
                <p className="beat-line">{caption}</p>
              </div>
              <div
                className={
                  "forecast-ticket " +
                  (amount < 0
                    ? "overdrawn"
                    : s.id === "plan"
                      ? "proposed"
                      : "covered")
                }
                aria-live="polite"
              >
                <span>{s.label}</span>
                <strong>{rupees(amount, s.id !== "plan")}</strong>
              </div>
            </div>
          </div>
          <div className="scene-tracks">
            <div className="tracks-inner">
              <span className="scroll-cue">
                Follow the invoice <b aria-hidden="true">↓</b>
              </span>
              <nav aria-label="Studio week scenes">
                {scenes.map((scene, i) => (
                  <button
                    key={scene.id}
                    type="button"
                    aria-pressed={i === active}
                    onClick={() => jump(i)}
                  >
                    <i aria-hidden="true" />
                    {scene.tab}
                  </button>
                ))}
              </nav>
              <a href="#desk">
                Rescue desk <span aria-hidden="true">↘</span>
              </a>
            </div>
          </div>
        </div>
        <noscript>
          <ol className="static-story">
            {scenes.slice(1).map((scene) => (
              <li key={scene.id}>
                <strong>{scene.title}</strong> {scene.text}
              </li>
            ))}
          </ol>
        </noscript>
      </section>
      <Journey stage={host} onTrack={trackInvoice} live={live} />
    </>
  );
}
