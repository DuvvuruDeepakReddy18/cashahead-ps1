# CashAhead

A cash planner for independent photography studios. Ananya has ₹6,000 on hand, a client paying late and ₹10,000 in crew and rental bills due Friday. CashAhead shows the ₹4,000 gap, identifies which invoice could cover it and recalculates the forecast when a payment arrives.

**[Open the deployed app](https://cashahead-ps1.vercel.app/) · [Start the full demo on Overview](https://cashahead-ps1.vercel.app/?demo=friday&start=overview)**

Both links work without a login. The demo uses fictional studio records and keeps changes in the current browser tab. Opening the full demo link again starts a fresh run.

## Try it as a judge

1. On **Overview**, check who owes money, how long each invoice has been overdue and what Friday’s balance will be. Select **Review rescue plan**.
2. Change Kiran & Divya’s expected payment from **50%** to **25%**. At 50%, collecting ₹4,000 covers Friday. At 25%, the plan switches to requesting an early deposit from Lakshmi & Arjun.
3. Select **Test a client offer**. Try ₹3,000 on Friday and the rest on Saturday. **Use smallest split** shows how ₹4,000 Friday and ₹7,000 Saturday would cover the bills. Saving a promise updates the forecast. Recording a receipt updates cash.
4. Open the invoice to download a PDF showing payments, the remaining balance and agreed dates. In **Booking deposit**, select **Try worked example** and raise the early cost from ₹10,000 to ₹12,000. The minimum deposit rises from ₹7,000 to ₹9,000.

For the exact three-minute presentation, use the [judge walkthrough](./CashAhead-3-Minute-Judge-Walkthrough.md). To try bank reconciliation, [download the four sample statements](./demo/CashAhead-Judge-Demo-Files.zip), then upload one in **Bank import**. A [sample client invoice](./demo/CashAhead-INV-104.pdf) is also available.

## Codebenders IDE usage and iterations

The development environment is **Codebenders IDE**. The submission was published from its Git Source Control view. GitHub hosts the source and Vercel deploys the `main` branch.

| Iteration | Key prompt or refinement | Result |
|---|---|---|
| Invoice tracking | Show who owes how much and since when. Let the owner choose the invoice for an amount-only bank match. | Overview shows overdue balances, due dates and reminder drafts. Partial receipts and repeat imports reconcile correctly. |
| Forecast and rescue | Rank the clients to chase and let the judge switch between 50% and 25%. | The recommendation changes with the amount each client could pay before Friday. |
| Negotiation and deposits | Let judges try their own amounts and dates, find the last safe date and get the smallest split that works. | The offer screen tests the terms before a promise is saved. The booking calculator finds the minimum deposit that protects costs. |
| Client handoff | Put partial payments, remaining balance and agreed dates on a shareable invoice. | A client-ready PDF and editable WhatsApp and Gmail drafts use the same invoice and receipt history. |
| Landing and judge entry | Keep the camera-studio theme and highlight the demo from the beginning. | **Start the full demo** at the end opens Overview. The cover shortcut opens the Friday rescue plan for the timed walkthrough. |

The [feature build prompt](./CashAhead-IDE-Update-Prompt.md) contains the financial rules and acceptance tests. The [landing page prompt](./CashAhead-Landing-Page-Prompt.md) covers the studio artwork, interactive scenes and demo entry points.

## Run and test

Use Node.js 20 or later and open the repository in Codebenders IDE.

```sh
npm ci
npm start
```

Open [the local app](http://127.0.0.1:4317/). The sample studio uses a fixed November 2026 calendar. **My studio** uses today’s date and stores its ledger separately in the browser.

```sh
npm test
npm run build
npm run test:demo
```

The build writes the static site to `dist/`. The browser suite exercises the camera tour, desktop and mobile judge entries, bank import, negotiation, invoice PDFs and the deposit calculator. It uses installed Chromium or Microsoft Edge. To install the matching Chromium build, run `npx playwright-core install chromium`. To test an existing deployment, set `CASHAHEAD_DEMO_URL` to its HTTPS origin before running `npm run test:demo`.
