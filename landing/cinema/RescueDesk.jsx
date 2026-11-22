"use client";
import { useState } from "react";
import { forecast, paymentRow, rupees, weekdays } from "../lib/forecast.mjs";
import { STUDIO } from "../lib/sample.mjs";

const late = { "INV-104": 18 };
const largerCrew = {
  ...STUDIO,
  bills: STUDIO.bills.map((b) =>
    b.label === "Ravi crew" ? { ...b, amount: 35000 } : b,
  ),
};
const negotiated = {
  ...largerCrew,
  bills: largerCrew.bills.map((b) =>
    b.label === "LensHub" ? { ...b, day: b.day + b.movable } : b,
  ),
};
const cases = [
  {
    label: "Late invoice",
    title: "The wedding balance slips.",
    before: forecast(STUDIO, { moveInvoice: late }),
    after: forecast(STUDIO, { moveInvoice: late, extraPayments: [paymentRow] }),
    lead: "₹11,000 moves fifteen days later. Friday’s crew and lens rental are still due.",
    action: "Confirm sample payment",
    reset: "Undo sample match",
    plan: "Kiran and Divya owe ₹8,000 from an earlier shoot. Even half would cover Friday’s gap. In this example a ₹5,000 bank payment is ready to review.",
    result:
      "Ananya matched the ₹5,000 bank entry to INV-101. Both Friday bills are covered and ₹3,000 remains on the invoice.",
    line: "INV-101 · Kiran & Divya",
    value: "₹5,000 received",
    afterLine: "INV-101 · Still due",
    afterValue: "₹3,000",
  },
  {
    label: "Dated promise",
    title: "A client names a day.",
    before: forecast(STUDIO),
    after: forecast(STUDIO, {
      extraPayments: [{ ...paymentRow, day: 7, amount: STUDIO.overdue.amount }],
    }),
    lead: "Thursday’s wedding balance is on time. Kiran and Divya say they can settle their older invoice next Monday.",
    action: "Model the promise",
    reset: "Remove the promise",
    plan: "Add the promised date to see where the money would land. It’s a projection until Ananya checks the bank.",
    result:
      "The promised date falls after Friday. It leaves this week unchanged and improves the projected balance on day 21.",
    line: "INV-101 · Next Monday",
    value: "₹8,000 promised",
    afterLine: "INV-101 · Next Monday",
    afterValue: "Awaiting payment",
  },
  {
    label: "Larger crew bill",
    title: "The three-day shoot costs more.",
    before: forecast(largerCrew, { moveInvoice: late }),
    after: forecast(negotiated, {
      moveInvoice: { ...late, "INV-105": 2, "INV-102": 3 },
      extraPayments: [{ ...paymentRow, amount: STUDIO.overdue.amount }],
    }),
    lead: "Ravi’s bill is ₹35,000 for a three-day wedding, and the ₹11,000 client balance is delayed.",
    action: "Test all four options",
    reset: "Reset the estimate",
    plan: "Try collecting ₹8,000 overdue, bringing forward a ₹15,000 deposit and ₹3,500 invoice, and moving the ₹4,000 lens bill to next week.",
    result:
      "Even if everyone agrees, ₹2,500 is still missing. Ananya needs to speak to Ravi before Friday. The figures here are a what-if estimate.",
    line: "Available if all four agree",
    value: "₹30,500",
    afterLine: "Still to negotiate",
    afterValue: "₹2,500",
  },
];

function WeekChart({ values }) {
  const week = values.slice(0, 5);
  const high = Math.max(...week, 0),
    low = Math.min(...week, 0);
  const scale = Math.max(high - low, 1);
  const zero = 9 + 80 * (-low / scale);
  return (
    <figure className="week-chart">
      <figcaption>Closing cash each day</figcaption>
      <div className="cash-bars" style={{ "--zero": zero + "%" }}>
        {week.map((amount, i) => (
          <div className="cash-day" key={i}>
            <div className="cash-track">
              <i
                className={amount < 0 ? "negative" : ""}
                style={{
                  height: (Math.abs(amount) / scale) * 80 + "%",
                  bottom:
                    (amount < 0 ? zero + (amount / scale) * 80 : zero) + "%",
                }}
              />
            </div>
            <span>{weekdays[i].slice(0, 3)}</span>
            <strong className={amount < 0 ? "negative" : ""}>
              {rupees(amount)}
            </strong>
          </div>
        ))}
      </div>
    </figure>
  );
}

export default function RescueDesk() {
  const [active, setActive] = useState(0);
  const [tested, setTested] = useState(false);
  const item = cases[active];
  const output = tested ? item.after : item.before;
  const friday = output.series[4];
  const helper =
    active === 0 && tested ? "dock" : active === 1 ? "scout" : "mend";
  return (
    <section
      id="desk"
      className="rescue-chapter"
      aria-labelledby="rescue-heading"
    >
      <div className="chapter-inner">
        <div className="rescue-intro">
          <div>
            <p className="desk-kicker">The rescue desk</p>
            <h2 id="rescue-heading">
              Can she cover <em>Friday?</em>
            </h2>
          </div>
          <p>
            Change one part of Ananya’s week. See what it costs and which
            payment is worth a follow-up.
          </p>
        </div>
        <div
          className="case-switch"
          aria-label="Forecast scenarios"
          role="group"
        >
          {cases.map((c, i) => (
            <button
              key={c.label}
              aria-pressed={i === active}
              onClick={() => {
                if (i !== active) {
                  setActive(i);
                  setTested(false);
                }
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="rescue-spread">
          <div className="ledger-page">
            <div className="ledger-summary">
              <div>
                <p className="ledger-label">Friday closing balance</p>
                <output
                  aria-live="polite"
                  className={friday < 0 ? "negative" : "positive"}
                >
                  {rupees(friday, true)}
                </output>
              </div>
              <p className="ledger-due">
                Friday bills<strong>{rupees(output.billsDueOn(4))}</strong>
              </p>
            </div>
            <WeekChart values={output.series} />
            {active === 1 && (
              <p className="promise-detail">
                Projected cash on day 21{" "}
                <strong>{rupees(output.series[21])}</strong>
              </p>
            )}
          </div>
          <aside className="desk-decision" aria-live="polite">
            <div className="decision-author">
              <img
                src={"/images/cast-" + helper + ".webp"}
                alt=""
                width="48"
                height="48"
                loading="lazy"
              />
              <p className="desk-kicker">
                {helper} /{" "}
                {active === 0 && tested
                  ? "Payment matched"
                  : "Ananya’s next move"}
              </p>
            </div>
            <h3>{item.title}</h3>
            <p className="case-lead">{item.lead}</p>
            <div className="decision-rule" />
            <p>{tested ? item.result : item.plan}</p>
            <div
              key={item.label + tested}
              className={"case-entry" + (tested ? " result-entry" : "")}
            >
              <span>{tested ? item.afterLine : item.line}</span>
              <b>{tested ? item.afterValue : item.value}</b>
            </div>
            <button onClick={() => setTested(!tested)}>
              {tested ? item.reset : item.action}{" "}
              <span aria-hidden="true">{tested ? "↶" : "→"}</span>
            </button>
          </aside>
        </div>
      </div>
    </section>
  );
}
