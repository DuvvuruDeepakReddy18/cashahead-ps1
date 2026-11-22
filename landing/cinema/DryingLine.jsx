export default function DryingLine() {
  return (
    <section id="drying" aria-label="The drying line">
      <div className="drying-wrap" id="drying-wrap">
        <div className="drying-stage">
          <header className="dry-head">
            <p className="dry-kick">
              <svg
                width="12"
                height="12"
                viewBox="0 0 16 16"
                aria-hidden="true"
              >
                <circle
                  cx="8"
                  cy="8"
                  r="6.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                ></circle>
                <path
                  d="M8 1.5 L12.5 9.5 M8 14.5 L3.5 6.5 M1.5 8 L9.5 3.5 M14.5 8 L6.5 12.5"
                  stroke="currentColor"
                  strokeWidth="1"
                ></path>
              </svg>
              ANANYA’S CASE FILES
            </p>
          </header>
          <h2 className="dry-title">
            Ten small money mistakes. One crew that catches them.
          </h2>
          <figure className="first-print">
            <img
              src="/images/cast-jot.webp"
              width="768"
              height="512"
              alt="Jot, the camera-shaped bookkeeper"
            />
            <figcaption>
              A wedding booked in chat still needs an invoice. Jot brings the
              amount and due date into Ananya’s ledger for review.
            </figcaption>
          </figure>
          <div
            className="dry-tabs"
            id="dry-tabs"
            role="group"
            aria-label="Jump to a case category"
          >
            <button type="button" className="dry-tab" data-cat="ALL">
              ALL
            </button>
            <button type="button" className="dry-tab" data-cat="CAPTURE">
              CAPTURE
            </button>
            <button type="button" className="dry-tab" data-cat="FORECAST">
              FORECAST
            </button>
            <button type="button" className="dry-tab" data-cat="RESCUE">
              RESCUE
            </button>
            <button type="button" className="dry-tab" data-cat="PAYMENTS">
              PAYMENTS
            </button>
            <button type="button" className="dry-tab" data-cat="TRUST">
              TRUST
            </button>
          </div>
          <div className="dry-row" id="dry-row">
            <svg
              className="dry-string"
              id="dry-string"
              aria-hidden="true"
              focusable="false"
            >
              <path
                id="dry-path"
                fill="none"
                stroke="#15130F"
                strokeWidth="1.5"
                strokeOpacity=".6"
              ></path>
            </svg>
          </div>
          <div className="dry-cap">
            <button
              type="button"
              className="dry-arrow"
              id="dry-prev"
              aria-label="Previous case"
            >
              ←
            </button>
            <div className="dry-capbox" aria-live="polite">
              <div className="cap-mask cap-title-mask" id="cap-title"></div>
              <div className="cap-mask cap-tag-mask" id="cap-tag"></div>
              <div className="cap-mask cap-hook-mask" id="cap-hook"></div>
            </div>
            <button
              type="button"
              className="dry-arrow"
              id="dry-next"
              aria-label="Next case"
            >
              →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
