// Fractions of the pinned scroll distance. Gaps between takes are paper handoffs.
export const takes = [
  { start: 0.104, end: 0.242, hold: 0.231 },
  { start: 0.326, end: 0.491, hold: 0.479 },
  { start: 0.568, end: 0.735, hold: 0.724 },
  { start: 0.818, end: 0.998, hold: 0.986 },
];
export const ramp = (p, from, to) =>
  Math.max(0, Math.min(1, (p - from) / (to - from)));
export function ease(p, from, to) {
  const x = ramp(p, from, to);
  return x * x * (3 - 2 * x);
}
export function chapterAt(p) {
  return takes
    .slice(1)
    .reduce(
      (index, take, i) =>
        p >= (takes[i].end + take.start) / 2 ? i + 1 : index,
      0,
    );
}

// The forecast ticket and the face of the physical invoice change on the same frame.
export const delayMark = 0.64;
export const matchMark = 0.78;
export function jobProgress(p, i) {
  return ramp(p, takes[i].start, takes[i].end);
}

// The camera is already travelling toward Jot as its virtual near lens clears the frame.
// Match the slope at the join so the dolly keeps its speed on the other side.
export const lensExit = 0.195;
const filmAtExit = 0.061;
const afterExit = (1 - filmAtExit) / (1 - lensExit);
const approachPower = (afterExit * lensExit) / filmAtExit;
export function studioTime(scroll) {
  return scroll < lensExit
    ? filmAtExit * Math.pow(scroll / lensExit, approachPower)
    : filmAtExit + (scroll - lensExit) * afterExit;
}
export function studioScroll(time) {
  return time < filmAtExit
    ? lensExit * Math.pow(time / filmAtExit, 1 / approachPower)
    : lensExit + (time - filmAtExit) / afterExit;
}
