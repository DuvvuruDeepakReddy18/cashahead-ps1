"use client";
import { useEffect, useRef, useState } from "react";

const assistants = [
  {
    id: "jot",
    name: "Jot",
    role: "Bookkeeper",
    heading: "Start with the booking note.",
    text: "A wedding date, an amount and a client name belong together. Jot helps Ananya turn the details in her notebook into an invoice she can review.",
    entry: "Reddy–Varma · INV-104",
    detail: "₹11,000 due Thursday",
  },
  {
    id: "scout",
    name: "Scout",
    role: "Forecaster",
    heading: "See the short day coming.",
    text: "Scout moves the wedding payment fifteen days forward and checks every bill along the way. Friday turns red first, giving Ananya time to call the right client.",
    entry: "Ravi and LensHub · Friday",
    detail: "₹4,000 short",
  },
  {
    id: "mend",
    name: "Mend",
    role: "Planner",
    heading: "Give the follow-up a purpose.",
    text: "Mend checks the older invoices against Friday’s gap. Even half of Kiran and Divya’s ₹8,000 balance would cover the crew and rental.",
    entry: "Kiran & Divya · INV-101",
    detail: "₹4,000 would close the gap",
  },
  {
    id: "dock",
    name: "Dock",
    role: "Payment matcher",
    heading: "Put the receipt on the right invoice.",
    text: "Dock finds the invoice number in the bank reference. Ananya confirms the ₹5,000 part-payment once, leaving a clear record of the ₹3,000 still due.",
    entry: "Confirmed against INV-101",
    detail: "₹3,000 outstanding",
  },
];

export default function Story() {
  const [index, setIndex] = useState(0);
  const [inspect, setInspect] = useState(false);
  const [status, setStatus] = useState("portrait");
  const drag = useRef(null);
  const host = useRef(null),
    engine = useRef(null),
    current = useRef(assistants[0].id);
  const member = assistants[index];
  useEffect(() => {
    if (!inspect) return;
    let closed = false;
    import("./puppet-stage")
      .then(({ mountPuppetStage }) => {
        if (closed) return;
        engine.current = mountPuppetStage(host.current, {
          mode: "single",
          initial: current.current,
          onReady: () => {
            if (!closed) setStatus("live");
          },
          onLost: () => {
            if (!closed) setStatus("unavailable");
          },
        });
      })
      .catch(() => {
        if (!closed) setStatus("unavailable");
      });
    return () => {
      closed = true;
      engine.current?.dispose();
      engine.current = null;
    };
  }, [inspect]);
  function choose(i) {
    current.current = assistants[i].id;
    setIndex(i);
    engine.current?.select(current.current);
  }
  function switchView() {
    setStatus(inspect ? "portrait" : "loading");
    setInspect(!inspect);
  }
  return (
    <section
      id="story"
      className="staff-chapter"
      aria-labelledby="staff-heading"
    >
      <div className="chapter-inner">
        <p className="desk-kicker">Inside the studio</p>
        <h2 id="staff-heading">Meet the studio crew.</h2>
        <div className="staff-spread">
          <div className={"staff-figure cast-bed-" + member.id}>
            {status !== "live" && (
              <img
                src={"/images/cast-" + member.id + ".webp"}
                width="760"
                height="600"
                loading="lazy"
                alt={
                  member.name +
                  ", the animated " +
                  [
                    "pocket camera",
                    "viewfinder",
                    "calculator",
                    "receipt printer",
                  ][index]
                }
              />
            )}
            {inspect && (
              <div
                ref={host}
                onPointerDown={(e) => {
                  if (e.button === 0) {
                    e.currentTarget.setPointerCapture(e.pointerId);
                    drag.current = [e.clientX, e.clientY];
                  }
                }}
                onPointerMove={(e) => {
                  if (
                    !drag.current ||
                    !e.currentTarget.hasPointerCapture(e.pointerId)
                  )
                    return;
                  engine.current?.orbit(
                    (drag.current[0] - e.clientX) * 0.014,
                    (e.clientY - drag.current[1]) * 0.008,
                  );
                  drag.current = [e.clientX, e.clientY];
                }}
                onLostPointerCapture={() => {
                  drag.current = null;
                }}
                onKeyDown={(e) => {
                  const offsets = {
                    ArrowLeft: [-0.25, 0],
                    ArrowRight: [0.25, 0],
                    ArrowUp: [0, 0.1],
                    ArrowDown: [0, -0.1],
                  };
                  if (offsets[e.key]) {
                    e.preventDefault();
                    engine.current?.orbit(...offsets[e.key]);
                  }
                }}
                className={"staff-model " + (status === "live" ? "live" : "")}
                role="group"
                tabIndex={status === "live" ? 0 : -1}
                aria-label={
                  member.name + " in 3D. Drag or use arrow keys to rotate."
                }
              />
            )}
            {status === "live" && (
              <span className="model-hint">Drag to rotate</span>
            )}
          </div>
          <div className="staff-text">
            <div
              className="staff-tabs"
              role="group"
              aria-label="Studio assistants"
            >
              {assistants.map((c, i) => (
                <button
                  key={c.id}
                  aria-pressed={i === index}
                  onClick={() => choose(i)}
                >
                  <img
                    src={"/images/cast-" + c.id + ".webp"}
                    alt=""
                    width="34"
                    height="30"
                  />
                  {c.name}
                </button>
              ))}
            </div>
            <div key={member.id} className="staff-profile" aria-live="polite">
              <p className="staff-role">
                {member.name} / {member.role}
              </p>
              <h3>{member.heading}</h3>
              <p>{member.text}</p>
              <div className="staff-entry">
                <span>{member.entry}</span>
                <strong>{member.detail}</strong>
              </div>
            </div>
            <button className="staff-inspect" onClick={switchView}>
              {inspect ? "View portrait" : "Inspect in 3D"}{" "}
              <span aria-hidden="true">↗</span>
            </button>
            <span role="status" className="staff-status">
              {status === "loading"
                ? "Loading model…"
                : status === "unavailable"
                  ? "3D is unavailable on this device. Showing the studio portrait."
                  : ""}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
