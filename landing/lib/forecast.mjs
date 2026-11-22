import { STUDIO } from "./sample.mjs";

export const paymentRow = Object.freeze({
  reference: "432198765012",
  invoiceId: "INV-101",
  amount: 5000,
  day: 2,
});

export function forecast(studio, overrides = {}, horizonDays = 30) {
  const income = Array(horizonDays).fill(0);
  const expenses = Array(horizonDays).fill(0);
  const paid = new Map();
  for (const row of overrides.extraPayments ?? []) {
    paid.set(row.invoiceId, (paid.get(row.invoiceId) ?? 0) + row.amount);
    if (row.day >= 0 && row.day < horizonDays) income[row.day] += row.amount;
  }
  for (const invoice of studio.invoices) {
    const day = overrides.moveInvoice?.[invoice.id] ?? invoice.day;
    if (Number.isInteger(day) && day >= 0 && day < horizonDays) {
      income[day] += Math.max(0, invoice.amount - (paid.get(invoice.id) ?? 0));
    }
  }
  for (const bill of studio.bills) {
    if (bill.day >= 0 && bill.day < horizonDays)
      expenses[bill.day] += bill.amount;
  }
  let balance = studio.cashToday;
  const series = income.map(
    (amount, day) => (balance += amount - expenses[day]),
  );
  const first = series.findIndex((value) => value < 0);
  const minimum = Math.min(...series);
  return {
    series,
    lowest: { day: series.indexOf(minimum), balance: minimum },
    firstShortDay: first < 0 ? null : first,
    billsDueOn: (day) => expenses[day] ?? 0,
  };
}

export function simulate(
  delay = 0,
  collections = 0,
  horizon = 30,
  extraInvoices = [],
) {
  const model = { ...STUDIO, invoices: [...STUDIO.invoices, ...extraInvoices] };
  const result = forecast(
    model,
    {
      moveInvoice: { "INV-104": 3 + delay },
      extraPayments: collections
        ? [{ ...paymentRow, amount: collections }]
        : [],
    },
    horizon,
  );
  return {
    series: result.series,
    lowest: result.lowest,
    firstShortDay: result.firstShortDay,
    friday: result.series[4],
    fridayBills: result.billsDueOn(4),
    remaining: STUDIO.overdue.amount - collections,
  };
}

const currency = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
export function rupees(amount, signed = false) {
  return (
    (amount < 0 ? "−" : signed && amount > 0 ? "+" : "") +
    "₹" +
    currency.format(Math.abs(amount))
  );
}
export const weekdays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
export function dayName(day) {
  return day < 7 ? weekdays[day] : "Day " + day;
}
