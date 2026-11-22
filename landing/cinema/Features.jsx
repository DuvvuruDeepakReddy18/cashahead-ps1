import WeekCheck from "./WeekCheck";
const features = [
  [
    "jot",
    "Capture a booking.",
    "Ananya enters the client, amount and due date from her studio note, then saves the invoice.",
  ],
  [
    "scout",
    "Forecast the week.",
    "Scout lines up receipts and bills over 30, 60 or 90 days. Moving one payday shows exactly when cash runs short.",
  ],
  [
    "mend",
    "Find the next call.",
    "Mend checks which overdue invoice could cover the gap, and shows how much would still be missing.",
  ],
  [
    "dock",
    "Match the payment.",
    "A bank reference connects a receipt to its invoice. Ananya confirms the match and the remaining balance updates.",
  ],
];
export default function Features() {
  return (
    <section id="feature" aria-label="CashAhead tools">
      <div className="sl" id="slider">
        <div className="feature-reel">
          {features.map(([id, title, body], i) => (
            <article
              key={id}
              className={"slide cast-bed-" + id + (i === 0 ? " on" : "")}
              data-i={i}
            >
              <div className="feature-ink">
                <p className="desk-kicker">The studio toolkit / {id}</p>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
              <img
                src={"/images/cast-" + id + ".webp"}
                alt=""
                width="760"
                height="600"
                loading="lazy"
              />
            </article>
          ))}
          <div className="wipe" id="wipe" aria-hidden="true"></div>
        </div>
        <nav className="rail" id="rail" aria-label="Studio tools">
          {features.map(([id, title], i) => (
            <button
              key={id}
              data-go={i}
              className={i === 0 ? "on" : ""}
              aria-label={title}
            >
              {id}
            </button>
          ))}
        </nav>
        <WeekCheck />
      </div>
    </section>
  );
}
