"use client";
import { useState } from "react";
import { forecast, rupees, weekdays } from "../lib/forecast.mjs";

const sample = {
  cash: "6000",
  bill: "10000",
  billDay: "4",
  pay: "11000",
  payDay: "3",
  late: "15",
};
const fields = [
  ["cash", "Cash today"],
  ["bill", "Bill amount"],
  ["billDay", "Bill due"],
  ["pay", "Client payment"],
  ["payDay", "Payment due"],
  ["late", "Days late"],
];
function validAmount(value) {
  return (
    value.trim() !== "" &&
    Number.isSafeInteger(Number(value)) &&
    Number(value) >= 0 &&
    Number(value) <= 999999999
  );
}
export default function WeekCheck() {
  const [inputs, setInputs] = useState(sample);
  const [selected, select] = useState(4);
  const valid =
    ["cash", "bill", "pay", "late"].every((key) => validAmount(inputs[key])) &&
    Number(inputs.late) <= 30;
  const billDay = Number(inputs.billDay),
    arrival = Number(inputs.payDay) + Number(inputs.late);
  const result = valid
    ? forecast(
        {
          cashToday: Number(inputs.cash),
          bills: [{ day: billDay, amount: Number(inputs.bill) }],
          invoices: [
            { id: "client", day: arrival, amount: Number(inputs.pay) },
          ],
        },
        {},
        7,
      )
    : null;
  const balance = result?.series[billDay];
  function change(key, value) {
    setInputs((old) => ({ ...old, [key]: value }));
    if (key === "billDay") select(Number(value));
  }
  return (
    <section
      className="what week-check"
      id="whatif"
      aria-labelledby="week-check-title"
    >
      <header>
        <h3 id="week-check-title">Try your own week.</h3>
        <p>
          Change a payment or bill to see your closing balance for each day.
        </p>
      </header>
      <div className="week-fields">
        {fields.map(([key, label]) => {
          const isDay = key.endsWith("Day"),
            isMoney = ["cash", "bill", "pay"].includes(key);
          return (
            <label key={key} htmlFor={"wf-" + key.toLowerCase()}>
              {label}
              <span className="week-field">
                {isMoney && <span aria-hidden="true">₹</span>}
                {isDay ? (
                  <select
                    id={"wf-" + key.toLowerCase()}
                    value={inputs[key]}
                    onChange={(e) => change(key, e.target.value)}
                  >
                    {weekdays.map((d, i) => (
                      <option key={d} value={i}>
                        {d}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={"wf-" + key.toLowerCase()}
                    type="number"
                    min="0"
                    max={key === "late" ? 30 : 999999999}
                    step="1"
                    required
                    value={inputs[key]}
                    onChange={(e) => change(key, e.target.value)}
                  />
                )}
              </span>
            </label>
          );
        })}
      </div>
      <p
        id="wf-res"
        className={"week-result " + (valid && balance < 0 ? "short" : "")}
        aria-live="polite"
      >
        {!valid
          ? "Enter whole rupee amounts from 0 to 99,99,99,999 and a delay of 0 to 30 days."
          : balance < 0
            ? weekdays[billDay] +
              " is short by " +
              rupees(-balance) +
              " after the bill."
            : weekdays[billDay] +
              "’s bill is covered. " +
              rupees(balance) +
              " remains."}
      </p>
      {result && (
        <>
          <div
            id="wf-strip"
            className="week-days"
            role="group"
            aria-label="Inspect a day"
          >
            {weekdays.map((name, i) => (
              <button
                type="button"
                key={name}
                onClick={() => select(i)}
                aria-pressed={selected === i}
                aria-label={
                  name + ", closing balance " + rupees(result.series[i])
                }
                data-negative={result.series[i] < 0}
              >
                <span>{name.slice(0, 3)}</span>
                <strong>{rupees(result.series[i])}</strong>
              </button>
            ))}
          </div>
          <div className="week-detail" aria-live="polite">
            <strong>{weekdays[selected]}</strong>
            <span>
              Opening{" "}
              {rupees(
                selected === 0
                  ? Number(inputs.cash)
                  : result.series[selected - 1],
              )}
            </span>
            <span>
              Received {rupees(selected === arrival ? Number(inputs.pay) : 0)}
            </span>
            <span>
              Bills {rupees(selected === billDay ? Number(inputs.bill) : 0)}
            </span>
            <b>Closing {rupees(result.series[selected])}</b>
          </div>
          {arrival > 6 && Number(inputs.pay) > 0 && (
            <p className="beyond-week">
              The {rupees(Number(inputs.pay))} payment falls {arrival - 6}{" "}
              {arrival === 7 ? "day" : "days"} after Sunday.
            </p>
          )}
        </>
      )}
    </section>
  );
}
