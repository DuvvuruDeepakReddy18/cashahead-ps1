"use client";
import { useEffect } from "react";
import Lenis from "lenis";

export default function Projector() {
  useEffect(() => {
    void import("./projection");
    const reduced = matchMedia("(prefers-reduced-motion:reduce)");
    let wheel = null,
      frame = 0,
      last = 0,
      playTime = 0;
    function tick(now) {
      frame = 0;
      playTime += last ? Math.min(64, now - last) : 16.67;
      last = now;
      wheel?.raf(playTime);
      if (wheel?.isScrolling === "smooth") wake();
      else last = 0;
    }
    function wake() {
      if (wheel && !frame && !document.hidden)
        frame = requestAnimationFrame(tick);
    }
    function release() {
      if (wheel?.isScrolling === "smooth")
        wheel.scrollTo(window.scrollY, { immediate: true, force: true });
    }
    function key(event) {
      if (
        [
          "ArrowDown",
          "ArrowUp",
          "PageDown",
          "PageUp",
          "Home",
          "End",
          "Tab",
          " ",
        ].includes(event.key)
      )
        release();
    }
    function configure() {
      cancelAnimationFrame(frame);
      frame = 0;
      last = 0;
      playTime = 0;
      wheel?.destroy();
      wheel = null;
      delete window.lenis;
      if (reduced.matches) return;
      wheel = new Lenis({
        lerp: 0.105,
        wheelMultiplier: 0.94,
        smoothWheel: true,
        syncTouch: false,
        prevent: (node) =>
          node.matches?.(
            "input,select,textarea,[role=dialog],[data-lenis-prevent]",
          ),
      });
      window.lenis = wheel;
    }
    configure();
    reduced.addEventListener("change", configure);
    window.addEventListener("wheel", wake, { passive: true });
    window.addEventListener("keydown", key, true);
    window.addEventListener("pointerdown", release, true);
    return () => {
      reduced.removeEventListener("change", configure);
      window.removeEventListener("wheel", wake);
      window.removeEventListener("keydown", key, true);
      window.removeEventListener("pointerdown", release, true);
      cancelAnimationFrame(frame);
      wheel?.destroy();
      delete window.lenis;
    };
  }, []);
  return null;
}
