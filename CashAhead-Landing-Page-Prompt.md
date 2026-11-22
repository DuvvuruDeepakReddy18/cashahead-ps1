# CashAhead landing-page build prompt | The Cash Crew camera studio

Build the public home page for CashAhead, a cash planner for Ananya Rao, an independent wedding photographer in Vijayawada. Use the camera-studio tour supplied in `CashAhead-Camera-Studio.zip`. In the integrated repository the editable components are in `landing/cinema/`, the isolated tour examples in `landing/lib/`, and the production artwork and films in `images/`. Preserve the camera artwork, cast, interactions and section order when working in this repository. Use the existing workspace behind the cover links.

## Give visitors two decisions on the first screen

Open on the large **CashAhead.** wordmark and miniature camera set, with **Know your Friday.**, the scroll-through-the-lens cue and the studio’s ₹6,000 starting cash. Put the following real links in the interface.

| Visible control | Destination | Why it is there |
|---|---|---|
| **Try the judge demo** on the camera cover | `/?demo=friday` | A first-time judge can reach the ₹4,000 Friday gap in one click. The app opens its isolated rescue workspace at 50%. |
| **Sample studio** on the cover | `/app` | Ananya’s original ledger lets a visitor build the late-payment scenario themselves. Its accessible label is **Try the sample studio**. |
| **My studio** in the masthead and a personal studio link at the end | `/mine` | Gives an owner a separate workspace with their own ledger and local calendar date. |
| **Scroll through the lens** | First studio station | Visitors who prefer a guided story can follow the invoice before opening the app. |

## Build the tour in this order

1. **Through the lens.** Scrubbing forwards and backwards moves from the cover camera to Monday’s booking, the delayed invoice, the collection plan and the confirmed payment. Retain the chapter controls. Show Ananya’s ₹11,000 wedding balance due Thursday, ₹6,000 opening cash and ₹10,000 of Friday bills. Friday moves from +₹7,000 on time to −₹4,000 with a fifteen-day delay.
2. **The payment journey.** Follow overdue INV-101, owed by Kiran & Divya. Half of ₹8,000 could cover the gap. A confirmed ₹5,000 receipt actually leaves ₹3,000 due and Friday at +₹1,000. Show the human confirmation and the duplicate statement entry that adds zero. The late wedding balance is a different invoice, INV-104.
3. **Rescue desk.** Offer the three interactive cases **Late invoice**, **Dated promise** and **Larger crew bill**. Change the chart and its explanation when the visitor tries or undoes an action. The first case moves from −₹4,000 to +₹1,000 on confirmation. In the third case, all four attempted actions still leave ₹2,500 uncovered. Keep these tour experiments isolated from every saved ledger.
4. **Meet the studio crew.** Jot is the pocket-camera bookkeeper, Scout the viewfinder forecaster, Mend the calculator planner, and Dock the receipt-printer payment matcher. Selecting a crew member changes the portrait, explanation and example. Keep the optional 3D inspection, drag and keyboard rotation, and the portrait fallback.
5. **Case prints.** Hang the ten studio mistakes on the drying line. Keep category selection, previous/next controls, and a detail sheet showing the mistake and the correction. Support closing the sheet and returning to the rescue desk.
6. **Toolkit and week calculator.** Pair the four crew roles with invoice entry, forecasting, collections and bank matching. Let visitors edit cash, bill amount and day, client payment and day, and days late. Recompute each day’s closing balance and let the visitor inspect one day. With ₹6,000 opening cash and ₹10,000 of Friday bills, a late ₹11,000 payment leaves Friday ₹4,000 short.
7. **Reminders and close.** Show example reminder drafts, a recorded promise, an invoice PDF and a bank-match example. Make the owner’s role clear: they review, send and confirm. Keep sample multilingual copy within the tour. Finish with the Friday rescue link and routes to the sample and personal studios.

## Carry the camera studio into the workspace

Use Bricolage Grotesque for the wordmark and interface, Fraunces for editorial headings, and IBM Plex Mono for small labels. Use the warm paper background, dark ink, amber shutter mark, sage surfaces and orange camera accent from the supplied artwork. Reflect the relevant crew member beside workspace headings. Keep money, dates, form labels, focus indicators and risk states readable on a phone. Preserve the existing labels and paths for all eight workspace screens.

## Build and test it as a static site

Use the existing React tour, esbuild entry points and lazily loaded Three.js scenes. Keep the HTML cover available as the tour initializes. Serve fonts, posters and the portrait and landscape films from the app’s own origin. Respect reduced motion and let people navigate with ordinary links and buttons. Keep both the gallery artwork and direct app entry usable when live 3D is unavailable. The static host must serve real assets and fall back to `index.html` on workspace routes.

Run `npm ci`, `npm run build` and `npm run test:demo`. Check the camera cover at desktop width and 390 pixels. Check both cover links, personal studio entry, the three rescue cases, crew selection, week calculation and reduced-motion controls. Confirm the live judge workflow can start directly from the cover, switch collection percentages, save an agreement and open an invoice PDF.

For the financial rules and workspace build use the [full feature prompt](./CashAhead-IDE-Update-Prompt.md). For the submission recording use the [three-minute walkthrough](./CashAhead-3-Minute-Judge-Walkthrough.md).
