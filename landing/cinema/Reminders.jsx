export default function Reminders() {
  return (
    <section id="carousel" aria-label="Chase politely">
      <h2>
        Chase politely.
        <br />
        Get paid properly.
      </h2>
      <div className="row">
        <article className="card">
          <span className="tag">Friendly · EN</span>
          <p>
            Hi Lakshmi &amp; Arjun, a gentle reminder that your booking deposit
            of ₹15,000 is due on Sunday. Could you confirm the date for INV-105? –
            Ananya
          </p>
          <span className="draft">✎ DRAFT · YOU SEND</span>
        </article>
        <article className="card">
          <span className="tag">Firm · TE</span>
          <p>
            నమస్కారం కిరణ్ గారు, ఎంగేజ్‌మెంట్ షూట్ బ్యాలెన్స్ ₹8,000 ఇంకా
            రావాలి. చెల్లింపు తేదీని తెలియజేయండి (INV-101). ధన్యవాదాలు! – అనన్య
          </p>
          <span className="draft">✎ DRAFT · YOU SEND</span>
        </article>
        <article className="card">
          <span className="tag">Final · EN</span>
          <p>
            Hi Sai Teja, the ₹3,500 for the birthday shoot was promised for
            Saturday and is still pending. Could you confirm your payment date?
            (INV-102).
          </p>
          <span className="draft">✎ DRAFT · YOU SEND</span>
        </article>
        <article className="card">
          <span className="tag">Friendly · HI</span>
          <p>
            नमस्ते दिव्या जी, एंगेजमेंट शूट का ₹8,000 बाकी है। कृपया भुगतान की तारीख
            बता दें (INV-101)। धन्यवाद! – अनन्या
          </p>
          <span className="draft">✎ DRAFT · YOU SEND</span>
        </article>
        <article className="card">
          <span className="tag">Invoice PDF</span>
          <p>
            INV-101 · ₹8,000 invoiced. The client’s PDF includes each receipt,
            the remaining balance and agreed payment dates.
          </p>
          <span className="draft">✎ DRAFT · YOU SEND</span>
        </article>
        <article className="card">
          <span className="tag">Bank match</span>
          <p>
            UPI/CR/432198765012/KIRAN KUMAR/okicici/INV-101 · ₹5,000 → INV-101 ·
            Kiran &amp; Divya
          </p>
          <span className="ok">✓ MATCHED BY REFERENCE</span>
        </article>
        <article className="card">
          <span className="tag">Promise</span>
          <p>
            Reddy–Varma · ₹4,000 on Friday and ₹7,000 on Saturday. Ananya
            records both dates after the client agrees.
          </p>
          <span className="draft">✎ AGREED DATES</span>
        </article>
        <article className="card">
          <span className="tag">Today</span>
          <p>
            Chase Kiran &amp; Divya today: ₹4,000 by Friday covers Friday's
            crew and lens rental.
          </p>
          <span className="draft">✎ DRAFT · YOU SEND</span>
        </article>
        <article className="card">
          <span className="tag">Rescue</span>
          <p>Even if they pay half, Friday is covered.</p>
          <span className="ok">✓ COVERED</span>
        </article>
        <article className="card">
          <span className="tag">Duplicate import</span>
          <p>INV-101 · ₹5,000 credit already confirmed · ₹0 added on re-import</p>
          <span className="ok">✓ COUNTED ONCE</span>
        </article>
      </div>
      <p className="note">nothing sends on its own</p>
      <div className="wrap">
        <a className="btn" href="/app/invoices">
          Open sample invoices
        </a>
      </div>
    </section>
  );
}
