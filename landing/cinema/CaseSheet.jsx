export default function CaseSheet() {
  return (
    <div
      className="sheet"
      id="sheet"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sheet-title"
      hidden
    >
      <button
        type="button"
        className="sheet-close"
        id="sheet-close"
        aria-label="Close case"
      >
        Close
      </button>
      <div className="sheet-grid">
        <div className="sheet-left">
          <p className="sheet-tag" id="sheet-tag"></p>
          <h2 className="sheet-title" id="sheet-title"></h2>
          <h3 className="sheet-label">WHAT GOES WRONG</h3>
          <p className="sheet-p" id="sheet-wrong"></p>
          <h3 className="sheet-label">WHAT CASHAHEAD DOES</h3>
          <p className="sheet-p" id="sheet-fix"></p>
          <p className="sheet-chip" id="sheet-helper"></p>
          <button type="button" className="btn-marigold-line" id="sheet-desk">
            See it on the rescue desk ↓
          </button>
        </div>
        <div className="tray" id="sheet-tray"></div>
      </div>
    </div>
  );
}
