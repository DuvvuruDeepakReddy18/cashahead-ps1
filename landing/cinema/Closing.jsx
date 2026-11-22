export default function Closing() {
  return (
    <section id="cta" aria-label="Get started">
      <h2>
        Know your Friday
        <br />
        before it arrives.
      </h2>
      <p className="line">Start on Ananya’s Overview. See who owes her money, then find a way to cover Friday’s bills.</p>
      <div className="btns">
        <a className="primary" href="/?demo=friday&start=overview">
          Start the full demo <span aria-hidden="true">↗</span>
        </a>
        <a className="studio-link" href="/mine">Open my studio</a>
      </div>
      <div className="crew-line" aria-label="The crew">
        <div className="crew-slot">
          <img className="crew-badge" src="/images/cast-jot.webp" alt="" />
          <span>JOT</span>
        </div>
        <div className="crew-slot">
          <img className="crew-badge" src="/images/cast-scout.webp" alt="" />
          <span>SCOUT</span>
        </div>
        <div className="crew-slot">
          <img className="crew-badge" src="/images/cast-mend.webp" alt="" />
          <span>MEND</span>
        </div>
        <div className="crew-slot">
          <img className="crew-badge" src="/images/cast-dock.webp" alt="" />
          <span>DOCK</span>
        </div>
        <div className="crew-slot">
          <span className="crew-badge ana">A</span>
          <span>Ananya · Studio owner</span>
        </div>
      </div>
    </section>
  );
}
