# CashAhead

CashAhead helps an independent wedding photographer answer three questions. Will I have enough cash to pay the crew? Which payment can I collect before their bill is due? What deposit should I request for my next booking?

## Try CashAhead

[Open the deployed application](https://cashahead-ps1.vercel.app/) or [start the full demo on Overview](https://cashahead-ps1.vercel.app/?demo=friday&start=overview). No account is required. Start with Ananya’s ₹6,000 in cash and overdue invoices, then choose **Review rescue plan** to address the ₹4,000 Friday shortfall. Changes stay in your browser tab.

To replay the three-minute presentation, follow the [judge walkthrough](./CashAhead-3-Minute-Judge-Walkthrough.md). For the bank-import exercise, [download the four sample statements](./demo/CashAhead-Judge-Demo-Files.zip).

## Codebenders usage, prompts and iterations

The CashAhead project folder was opened in Codebenders IDE. Its Source Control view was used to push `main` to GitHub, which triggers the production build on Vercel.

| Iteration | Prompt goal | What a judge can try |
|---|---|---|
| Invoice tracking and reconciliation | Show who owes what and since when. Let the owner choose the invoice when a bank transfer matches only by amount. | Draft a reminder from Overview, then import a sample CSV and confirm a partial receipt. |
| Forecast and recovery | Change the expected payment from 50% to 25% and show who to chase. | Watch the first recommendation switch from Kiran & Divya to Lakshmi & Arjun. |
| Negotiation, payment and pricing | Find the smallest split that covers bills. Put the receipt, balance and agreed dates on the invoice PDF. Calculate the minimum booking deposit. | Test an offer, save it, record a payment and download the PDF. Raise a booking cost and watch the deposit change. |
| Camera landing and demo entry | Introduce the studio through the camera tour and give first-time visitors a clear starting point. | **Start the full demo** at the end opens Overview. **Try the judge demo** on the cover jumps to the Friday rescue plan shown in the recording. |

Read the [full feature build prompt](./CashAhead-IDE-Update-Prompt.md) and the [camera landing prompt](./CashAhead-Landing-Page-Prompt.md) for the build instructions and acceptance checks.

## Run locally

Use Node.js 20 or newer. From this folder run:

```powershell
npm install
npm start
```

Open [CashAhead on your computer](http://127.0.0.1:4317). Choose **Try the judge demo** to open the ₹4,000 Friday shortfall, **Try the sample studio** for the original forecast, or **My studio** for your own ledger. The [direct judge demo link](http://127.0.0.1:4317/?demo=friday) starts a fresh run. Judge changes last for the current tab and survive a refresh. The app runs on this computer. Data is stored in the current browser profile for this origin. The sample uses Monday, 23 November 2026. Your own studio uses your local calendar date. To reset the regular sample, open **Studio settings → Reset sample studio → Restore sample**.

## Camera studio tour

The home page opens the Cash Crew camera tour. Scroll through the lens, compare the three rescue scenarios, inspect the crew or test your own week. **Try the judge demo** on the cover opens the working Friday rescue plan immediately. **Sample studio** opens Ananya’s original ledger. The tour uses isolated examples. The interactive studio keeps its own saved data. The production build includes the tour code, fonts, images and films in `dist/`.

## Alternative two-minute bank-import demo

| Time | Click | Say or show |
|---|---|---|
| 0:00–0:15 | **Try the judge demo**. Point to the Friday shortfall and the two bills under **Recommended plan**. | “Ananya has ₹6,000. On Friday she owes her second shooter ₹6,000 and the lens rental shop ₹4,000. She needs to find ₹4,000.” |
| 0:15–0:32 | Show **How much will the client pay?** with **50%** selected. | “The ₹11,000 wedding balance will arrive 15 days late. Kiran & Divya owe ₹8,000. Collect half by Friday and the crew and rental are covered.” |
| 0:32–0:55 | **Rescue plan**. Under **How much will the client pay?**, switch Kiran & Divya from **50%** to **25%**, then back to **50%**. Open their **Draft reminder** and select **Mark followed up**. | “Half of their ₹8,000 covers Friday. A quarter leaves us ₹2,000 short, so CashAhead switches to asking Lakshmi & Arjun for an early deposit. At half, Kiran & Divya are the first call again.” |
| 0:55–1:22 | **Bank import → Download sample CSV**. Upload that file through **Statement CSV**. In the **₹5,000 / DEMO-KD-5000** card, confirm **INV-101**. Open **Overview**, then **Invoices → Overdue → Kiran & Divya**. | “The reference identifies the invoice even though the amount is only a part-payment. Cash is now ₹11,000, Friday closes at ₹1,000 and ₹3,000 remains overdue.” |
| 1:22–1:35 | Close the invoice, return to **Bank import**, and upload the same file again. | “The confirmed transfer is already processed. The unrelated credit can still be reviewed. Re-importing does not add the ₹5,000 again.” |
| 1:35–2:00 | **Booking deposit → Try worked example**. Change **Cost amount** from **10000** to **12000**. | “For a ₹30,000 booking, the photographer has ₹6,000 available and wants to keep ₹3,000. A ₹10,000 early cost needs a ₹7,000 deposit. Raise the cost by ₹2,000 and the minimum deposit becomes ₹9,000. The final balance becomes ₹21,000.” |

**Let the judge negotiate.** Open the [fresh offer demo](https://cashahead-ps1.vercel.app/?demo=friday&offer=INV-104) or choose **Try the judge demo → Test a client offer**. Then change Reddy–Varma’s first payment to ₹3,000 on Friday, 27 November, with the rest on Saturday. Friday still needs ₹1,000. Choose **Use smallest split** to try ₹4,000 on Friday and ₹7,000 on Saturday. The screen shows the last safe date for the full payment, a reply to copy, and a fallback if the client cannot pay. Only **Save agreed promise** changes the saved forecast. Restart the judge demo before the ordinary bank-import walkthrough.

**Show the client’s copy.** After saving the ₹4,000 / ₹7,000 agreement, go to **Invoices → Reddy–Varma → Record payment** and enter **1000**. Reopen the invoice and select **Download PDF**. It shows ₹11,000 invoiced, ₹1,000 paid and ₹10,000 remaining. The original due date is 26 November. Of the agreement, ₹3,000 remains due on 27 November and ₹7,000 on 28 November. **Share invoice** offers file sharing on supported devices or a download to attach to a WhatsApp or Gmail draft. **Draft reminder** lets you edit the agreed amounts and dates before opening either service. Only mark a follow-up after you have made it.

The worked example uses a separate preview. Choose **Use my studio** to calculate against real studio commitments. Enter a client and select **Save booking** to create the deposit, balance invoice and dated costs together.

To challenge the rescue with a different receipt, choose **Studio settings → Restart judge demo**, then open **Invoices → Kiran & Divya → Record payment**. Enter **2000**. Cash is ₹8,000, INV-101 has ₹6,000 due, and Friday is still ₹2,000 short.

## Verification

```powershell
npm test
npm run build
npm run test:demo
```

The Node tests cover the ledger, promises, bank matching, duplicates, excess receipts, conservative rescue ranking, deadlines, later shortfalls and deposit calculations. The Playwright demo test builds the production site and uses a temporary server and a clean browser profile. It exercises real navigation, CSV download/upload, saved payments, reload, sample reset, a new invoice, booking creation and a 390-pixel mobile viewport.

For browser testing, install Chromium with `npx playwright-core install chromium`, use installed Microsoft Edge on Windows, or set `CHROMIUM_PATH` to the browser executable. The static build includes pdfmake and its Roboto fonts, loaded on demand from the app’s own origin. To deploy, run `npm ci` and `npm run build`, publish `dist/` over HTTPS, and configure a fallback to `index.html` for studio routes such as `/app/rescue`. The judge entry uses `/?demo=friday`. To serve the production bundle run `npm start -- --production` after the build. The server defaults to loopback port 4317. Pass `--port 4318` to use another port.

## How the numbers work

- **Cash and receivables.** Opening cash plus confirmed receipts minus paid bills gives current cash. Every receipt tracks its full value and the portion allocated to an invoice. Excess appears under unapplied credits. A promise or a draft changes no cash.
- **Forecast.** Each daily closing balance includes that day’s inflows and bills. A dated partial promise contributes only its remaining promised amount. Undated overdue income stays out. A late unpaid bill is due today. The forecast and quote share this daily model.
- **Rescue ranking.** The planner evaluates actions by the earliest short day. An overdue collection normally assumes half the ask arrives. On the rescue screen, the 25% / 50% toggle previews how much one overdue invoice could contribute. It recalculates the recommended plan using the other actions’ existing assumptions. Leaving the screen clears the preview. An early deposit requires cooperation. Moving a vendor bill requires agreement. Fixed bills are excluded. Each plan is checked across the selected horizon, with conservative and full-recovery results shown separately.
- **Booking deposits.** The largest deficit below the chosen buffer before final payment determines the smallest whole-rupee deposit. The first such deficit gives its latest arrival date. The final invoice falls by the same amount. Later deficits can make the booking infeasible even if the whole price is collected upfront.
- **Persistence.** Each workspace uses its own browser storage key. A confirmed change writes a complete ledger snapshot. Browser locks serialize writes across tabs where supported. The demo uses synthetic records and a sample statement, with manual confirmation for every bank allocation.

## Project files

| Files | Purpose |
|---|---|
| `index.html`, `styles.css`, `mark.svg` | Landing page entry, responsive studio styling and app icon |
| `src/ledger.js` | Invoices, bills, receipts, promises, daily forecast and sample records |
| `src/bank.js`, `src/planning.js` | CSV import, reconciliation, rescue ranking, booking quotes and saved bookings |
| `src/offers.js`, `src/offerui.js` | Client offer calculations, dated promises, counteroffers and fallback view |
| `src/clientinvoice.js`, `src/invoicepdf.js`, `src/invoiceshare.js` | Client statements, PDF generation and draft handoffs |
| `src/storage.js` | Separate judge, sample and personal workspaces |
| `src/app.js`, `src/views.js`, `src/forms.js` | Navigation, dashboard, forecast, editing and confirmation controls |
| `tools/`, `tests/` | Production build, loopback server, unit tests and browser demo |
| `CashAhead-IDE-Update-Prompt.md` | The supplied implementation specification |
