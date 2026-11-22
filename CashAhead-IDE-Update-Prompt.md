# CashAhead build prompt for Codebenders PS1

Build CashAhead for “The One-Person Back Office” directly in `C:\Users\duvvu\Desktop\CB_code`. This prompt is the complete brief for a fresh build. If the current CashAhead project is already present there, inspect it first, keep its working implementation and saved studio data, and implement only missing behavior. Use the supplied Camera Studio frontend and keep new workspace implementation in this project. The older `CB` financial application is outside this build.

Build for Ananya Rao, an independent wedding photographer in Vijayawada who needs to know whom to chase before Friday’s crew and rental bills. Use a mobile-friendly HTML, CSS and browser JavaScript app with ES modules, INR currency formatting, a small local Node.js 20+ server, Node’s test runner and a Chromium browser walkthrough. The app must run locally with the bundled sample records and CSVs.

Provide these eight workspace screens. Include **Overview**, **Invoices**, **Bills**, **Forecast**, **Rescue plan**, **Bank import**, **Booking deposit** and **Studio settings**. On Invoices, support creating and editing client, shoot, invoice type, amount, contractual due date and optional earliest receipt date. Provide All, Overdue and Paid filters, payment history, promises, and reminder drafting, copying and logging. In Studio settings, let the owner set the studio name, opening cash and safety buffer. On Bills, let the owner create and edit unpaid bills, confirm an agreed deferral and mark a bill paid. On Forecast, show daily closing cash for 30, 60 and 90 days, dated inflows and outflows, and a clickable day breakdown. On Overview, link a projected shortfall to its rescue plan.

Use the supplied Camera Studio landing page for the public home page. Preserve its camera opening, scroll-through studio, four crew members, rescue scenarios, case prints, week calculator, static portraits and reduced-motion behavior. The opening must link directly to the Friday judge demo and the sample ledger. Keep a personal studio entry. Use the tour’s Bricolage Grotesque, Fraunces and IBM Plex Mono, warm paper, ink, amber shutter icon and crew art across the workspace. Serve all assets locally and test the tour and existing judge flow from a static production build.

## What the owner gets from each feature

Use the PS1 brief, *The One-Person Back Office*, for the five required outcomes. One independent photographer should be able to do all five in the same studio.

| PS1 requirement | What to build and why |
|---|---|
| Invoice creation → payment tracking → assisted follow-up | Store the client, shoot, contractual due date and invoice amount. Keep a receipt history and recalculate the amount due after every payment. Draft the next reminder from that invoice so the owner never chases money already received. |
| Dashboard answering who owes what and since when | Put each overdue client’s balance, invoice, original due date, days late and reminder action on Overview. A partial receipt reduces the amount while the original due date remains visible. |
| 30–90 day forecast from invoices and bills | Project daily closing cash at 30, 60 and 90 days. Let the owner open a day to see the particular receipt or crew, rental or supplier bill behind it. |
| At least one what-if | Preview an invoice arriving fifteen days late. Show the resulting Friday balance before the owner chooses to save or cancel. |
| Alerts leading to a clear next action | Link the earliest projected shortfall to a plan naming whom to chase, for how much and by when. Open a reminder for that client and invoice. |

| Additional capability | What the owner gains |
|---|---|
| Collection ranking with 25% and 50% assumptions | Compare the gap that each realistic collection can cover, change the first call when the assumption changes, and protect fixed crew bills. Display any shortfall that survives the plan. |
| Client negotiation and fallback | Test a proposed amount and two dates, calculate the last safe full-payment date and smallest workable split, draft a counteroffer, or recompute the plan if that client cannot pay. Save only accepted terms. |
| Client invoice PDF and sharing | Generate a dated statement reconciling the invoice, actual receipts, unapplied credit and each outstanding installment. Offer a file download, native file sharing when supported, and editable WhatsApp or Gmail reminder drafts. |
| Confirmed bank matching | Suggest invoice references even when a transfer is partial. Require explicit selection for ambiguous or amount-only matches, link existing manual receipts, and prevent duplicate imports from inflating cash. |
| Minimum booking deposit | Price the advance needed before dated shoot costs while preserving a chosen cash buffer. Show the payment deadline, remaining final balance and any amount that remains uncovered. A saved booking creates the split invoices and costs together. |
| Owner controls and isolated demos | Let the owner maintain invoices, bills, received payments, promises, opening cash, studio name and buffer. Keep the personal ledger, reusable sample and restartable judge scenario separate. Ship downloadable CSV examples for independent testing. |
| Camera studio tour | Let visitors try the fictional week before entering the planner. Give judges a one-click route into the live Friday rescue and use the same visual theme throughout the workspace. |

The companion [camera landing prompt](./CashAhead-Landing-Page-Prompt.md) specifies the presentation and controls. The [three-minute judge walkthrough](./CashAhead-3-Minute-Judge-Walkthrough.md) gives the exact recording and manual test path.

## 1. Make partial payments work throughout the app

Give each invoice a payment history. Derive its outstanding balance from the invoice total minus confirmed allocations. Support several receipts against one invoice. A partially paid, overdue invoice must still appear in the overdue dashboard with its remaining amount and original contractual due date.

On Overview, list every overdue invoice with its client, invoice ID, remaining balance, original due date, days late and a **Draft reminder** button. Order the list by oldest due date first. Each button opens that invoice’s reminder using its current balance. Partial payments reduce the row in place when Overview is rendered again. Full payment removes the row. Show an empty state when there are no overdue invoices and a link to all invoices.

Use the same payment-recording path for manual entry and confirmed bank imports. Recording a receipt increases cash once, reduces the invoice balance by the allocated amount, and recalculates the forecast. Only the unpaid remainder can appear as a future inflow, and only when it has a supported expected date. If a client promises ₹3,000 against ₹8,000, forecast ₹3,000 on the promised date. Keep the other ₹5,000 outstanding. Drafting a reminder, copying it or recording a promise must never increase cash received.

Update the CSV importer to accept the sample statement that the app downloads, including Date, Narration, Ref No, Withdrawal, Deposit and Balance. Preserve formats the app already supports. An exact invoice reference must allow a ₹5,000 credit to be suggested against an ₹8,000 outstanding invoice. Show the amount, invoice and remaining balance before the owner confirms. An invoice ID in the narration or a uniquely identified payer with one open invoice may suggest a match. When the only evidence is an equal amount, show the possible client and invoice as a hint, leave **Allocate transfer** empty, and keep **Confirm selection** disabled until the owner chooses an invoice, a matching existing receipt, or Ignore. Conflicting evidence and ambiguous matches also require explicit review. Skip debit rows and identify invalid rows without losing valid credits. Keep excess money visible as unapplied credit. Use stable transaction identifiers so re-importing the same statement cannot post the payment twice. If a likely matching manual receipt already exists, let the owner link the bank row to it. Two separate transfers of the same amount with different references must remain distinguishable.

## 2. Rank rescue actions by the bill they can actually protect

Start from the earliest forecast date below the owner’s safety buffer. Show the date, the bills due, the projected closing balance and the gap. Generate candidate actions from eligible overdue balances, deposits that could reasonably be requested early and bills the owner has marked movable. Keep crew payments marked fixed out of deferral options.

For each candidate, run the existing forecast with that action applied to a copy of the data. Show how much it recovers by the deadline, the assumptions behind it and whether it creates another gap later in the selected horizon. An amount arriving after the bill is due contributes zero toward that bill. Avoid counting two actions against the same money twice.

Use half the outstanding amount as the default conservative assumption for an eligible overdue collection, and half for an early deposit due within three days after the cash deadline. Treat an existing promise after the deadline as requiring new client agreement to bring it forward. Model an eligible bill deferral at its full amount and check the new due date. Prefer a normal collection over asking for an early deposit or vendor deferral when they cover the same gap. Among equally low-friction successful plans, prefer the one recovering more by the deadline.

Prefer the lowest-friction plan that closes the gap under its stated conservative assumptions without creating another shortfall. If only a full-payment scenario works, label that dependency. If none works, show the best available plan and the exact amount still uncovered. A what-if may change the preview. Only explicit confirmations change saved promises, bill dates or cash.

In the sample case, Kiran and Divya owe ₹8,000 and the gap is ₹4,000. The recommendation should explain in plain language that asking for ₹8,000 covers the gap even if half arrives before the crew bill. Offer **Draft reminder** on the matching client action under **Compare actions**. Compute the recommendation from the records so editing a date or amount can change the answer.

On Rescue plan, offer **25%** and **50%** for each adjustable overdue collection. The judge demo starts at 50% for Kiran & Divya. At 50%, collecting ₹4,000 from INV-101 covers Friday. At 25%, their ₹2,000 contribution leaves ₹2,000 to find. The preferred action should switch to an early deposit from Lakshmi & Arjun on INV-105, with ₹7,500 conservatively available. Switching back must restore Kiran & Divya as the first call. Recalculate just that invoice’s assumption, leave saved ledger data intact and reset the toggle when leaving Rescue plan. Support keyboard and touch selection and expose the active percentage to assistive technology.

## 3. Add “What deposit should I ask for?” to the booking or forecast flow

The photographer enters the booking price, dated shoot costs, expected final-payment date and desired cash buffer. Use current studio cash and existing commitments from the same forecast engine. Return the smallest whole-rupee deposit that keeps the projected balance at or above the buffer, and the latest date it must arrive. Show which expense or date drives the answer. Treat the deposit as part of the booking price, so the final payment decreases by the same amount.

Make this a preview until the owner explicitly saves. If no deposit is needed, show ₹0. If even the full booking price cannot cover the gap, show the amount still uncovered. Treat receipts as available for bills on the same day. Allow adding and removing dated costs. Provide **Try worked example** as an isolated preview and **Use my studio** for live commitments. **Save booking** creates the deposit invoice if needed, the remaining balance invoice if due, and the dated costs once. Prevent saving a booking that still leaves an uncovered gap.

Use this independent calculator example. A ₹30,000 booking has ₹10,000 in early costs, ₹6,000 available, a ₹3,000 buffer, and no other cash flows before those costs. The final balance arrives later. The minimum deposit is ₹7,000, leaving ₹23,000 due later. A ₹6,000 deposit misses the buffer by ₹1,000. Raising the rental cost to ₹12,000 increases the minimum deposit to ₹9,000 and reduces the final balance to ₹21,000.

### Let a client negotiate on one screen

On **Rescue plan**, including the one-click Friday judge demo, and on each unpaid invoice, offer **Test a client offer**. Support a direct fresh judge entry at `/?demo=friday&offer=INV-104`. Open **Can I accept this offer?** with a selectable invoice, first-payment amount, first date and balance date. Start the judge on Reddy–Varma’s INV-104 with zero on Friday and the full ₹11,000 on Saturday. Update the outcome as the judge types.

Remove the selected invoice’s old expected inflows from a forecast copy and substitute the two offered receipts once. Keep every other invoice, bill, actual receipt and the studio buffer. Test daily closing cash from today through at least 90 days, extending through the later payment date. Calculate the last safe day for one full payment and the smallest first payment for the two entered dates, to the paise. Distinguish an unnecessary advance, an infeasible split, and a horizon with no payment deadline. Respect earliest possible receipt dates. Show the affected day, relevant bills, projected closing cash and horizon.

For INV-104, full payment on Friday covers the bills. Payment on Saturday leaves Friday ₹4,000 short. ₹2,000 on Friday leaves ₹2,000 short. **Use smallest split** should set ₹4,000 on Friday and ₹7,000 on Saturday. Provide a copyable reply naming the client, invoice, amounts and dates. When the offer is short, draft the feasible counteroffer automatically and require the user to apply it before saving. If no split works on the entered dates, offer date changes or the fallback plan. **Save agreed promise** is the explicit ledger action. It replaces old expectations on that invoice, preserves the contractual due date and leaves cash unchanged. Apply subsequent receipts to the earliest outstanding installment first. Existing single-payment promises must still work.

Include a collapsed **What if this client can’t pay?** comparison on the same screen. Exclude this client’s incoming invoices for the window, retain cash already received, and use the ordinary rescue ranking and fixed-bill restrictions to show the alternative or the residual gap.

### Client invoice PDFs and payment drafts

On every invoice, including paid invoices, provide **Download PDF** and **Share invoice**. Generate a client-ready A4 PDF in the browser using locally bundled fonts with a rupee glyph. Show the studio, client, service, invoice number and type, original due date, balance as of date, invoice total, paid amount and remaining balance. Itemize each confirmed receipt with its received date, amount applied and any excess credit. Show each recorded payment agreement with its date, original installment amount and amount still due. Apply receipts to installments in order, counting only new allocations after the agreement. Preserve dates after payment and past dates on unpaid installments. Saving a later forecast estimate must preserve previously accepted client terms in exports and reminders. Keep forecast assumptions, draft offers, other clients, bank references, bills and studio cash private. Older single dates of uncertain origin belong only in the forecast until the owner confirms them.

Use a native file share action where the device can share PDFs. Elsewhere provide a download plus WhatsApp and Gmail drafts with the invoice summary. Explain that the owner chooses the recipient and attaches the downloaded PDF in a web draft. Add the same draft destinations to editable reminders and valid negotiation replies. A reminder for an agreed split uses its remaining amounts and dates. A rescue reminder uses the selected action’s ask and deadline. Opening a draft, sharing or cancelling makes no ledger change. Keep **Mark followed up** explicit. Bundle the PDF engine into the static build and load it only when needed.

## 4. Reproduce the sample and judge workspaces

The landing page has three entry points.

- **Try the sample studio** opens Ananya Rao Photography at `/app` with the original forecast. Use Monday, 23 November 2026 as D+0 for all sample dates. Opening cash is ₹6,000 and the safety buffer is ₹0. Settings can restore this sample.
- **Try the judge demo** and `/?demo=friday` start a fresh, isolated run on Rescue plan at `/app/rescue?demo=friday`. Seed the regular sample, then apply the same confirmed 15-day delay to INV-104 that the owner can enter on Forecast. Open directly at the ₹4,000 Friday shortfall with 50% selected. Keep demo mode across navigation, preserve confirmed changes on refresh within the tab, and make **Studio settings → Restart judge demo** start fresh.
- **My studio** opens `/mine` with the owner’s own data and local calendar date. Keep sample and personal ledgers in separate local storage keys and the judge ledger in session storage. Resetting either demo must preserve the personal ledger.

Seed these invoices. Day offsets are relative to the sample Monday.

| Invoice | Client | Shoot | Type | Amount | Due |
|---|---|---|---|---:|---:|
| INV-101 | Kiran & Divya | Engagement shoot | Balance | ₹8,000 | D−12 |
| INV-102 | Sai Teja | Birthday shoot | Balance | ₹3,500 | D−5 |
| INV-103 | Mehta Infotech | Team headshots | Balance | ₹6,000 | D+10 |
| INV-104 | Reddy–Varma | Wedding photography | Balance | ₹11,000 | D+3 |
| INV-105 | Lakshmi & Arjun | December wedding | Deposit | ₹15,000 | D+6 |
| INV-106 | Lakshmi & Arjun | December wedding | Balance | ₹35,000 | D+40 |
| INV-108 | Meghana & Rohit | January wedding | Deposit | ₹20,000 | D+30 |
| INV-109 | Meghana & Rohit | January wedding | Balance | ₹45,000 | D+75 |

INV-101 has no dated promise. Sai Teja has promised ₹3,500 on D+12, with zero conservative recovery before Friday. On D+4, Ravi’s fixed second-shooter bill is ₹6,000 and LensHub’s lens rental is ₹4,000, movable by up to seven days with approval. Include the later bills used by the 30/60/90-day forecast. Include camera EMI ₹7,500 on D+8, D+38 and D+68, editing ₹5,000 on D+15 (movable five days), storage ₹1,500 on D+20, D+50 and D+80, wedding crew ₹12,000 on D+21 and ₹14,000 on D+60, and album printing ₹9,000 on D+35 (movable ten days). Keep the other dated bills fixed.

## 5. Supply the downloadable judge files

Under **Bank import**, make **Download sample CSV** available. In judge mode expose the three alternatives under **Download more demo statements**. Supply the same four CSVs and a short `START-HERE.md` in `demo/CashAhead-Judge-Demo-Files.zip`. The guide should explain extracting the ZIP, uploading an individual CSV, restarting before each alternative, and how to demo invoice entry, a late payment, vendor agreement and a booking quote through the forms. Use synthetic records dated to the judge clock.

| CSV | Contents and expected behavior from a fresh judge demo |
|---|---|
| CashAhead-sample-statement.csv | ₹5,000 with bank reference DEMO-KD-5000 and INV-101 in the narration, an unidentified ₹3,500 credit (DEMO-REVIEW), and a debit. Confirm only the ₹5,000 row in the main demo. |
| CashAhead-small-payment.csv | Confirm JUDGE-KD-2000 against INV-101. Cash becomes ₹8,000, Friday closes at −₹2,000 and ₹6,000 remains due. |
| CashAhead-review.csv | JUDGE-CONFLICT names Mehta Infotech but references INV-101. Keep it pending. Let the owner ignore JUDGE-IGNORE, skip the debit and report the invalid date. Cash remains ₹6,000. |
| CashAhead-overpayment.csv | Confirm JUDGE-KD-10000 against INV-101. Cash becomes ₹16,000, Friday closes at +₹6,000, the invoice is paid and ₹2,000 is unapplied. |

## 6. Verify the full demo

Add automated tests for the following sequence, including at least one browser-level test through the normal user interface. Reuse the project’s existing test framework where possible.

A. Open the sample from the landing page. Friday closes at +₹7,000. Open Friday and verify that both bills are named.

B. Preview INV-104 arriving 15 days late, on D+18. Friday changes to −₹4,000. Cancel the preview and verify that the saved forecast still shows +₹7,000.

C. Confirm the revised expected date. Friday is now −₹4,000 in the saved forecast. Open the rescue recommendation and draft the collection reminder. Cash remains ₹6,000.

D. Download the sample CSV and upload it through the app. Review and confirm a ₹5,000 credit received today with bank reference DEMO-KD-5000 and INV-101 in the narration. Cash becomes ₹11,000, Friday becomes +₹1,000, and INV-101 remains overdue and part-paid with ₹3,000 outstanding.

E. Refresh the app, then re-import the same file. The confirmed payment survives refresh. No new receipt is created and all three amounts stay the same.

F. Reset the sample, repeat the delay, and enter a ₹2,000 payment instead. Cash becomes ₹8,000, Friday remains −₹2,000, and INV-101 has ₹6,000 outstanding. The rescue recommendation updates to the remaining gap.

G. Create a fresh invoice through the UI and partially pay it. Verify the same behavior on that new invoice so the demo cannot pass through special cases for INV-101.

H. Add focused tests for an ambiguous bank row, a manual receipt later linked to an import, a partial promise, two genuine equal-amount transfers, a larger invoice collectible only after Friday, a bill move that creates a later shortfall, and a rescue that cannot close the gap. Test the deposit example, the zero-deposit case and the full-price-insufficient case.

I. Launch the judge demo from the landing page and the direct link. Verify the Friday gap, 50% → 25% → 50% rankings and the invoice in each reminder. Navigate away, refresh, and restart. Check isolation from sample and personal data. Include touch interaction at a 390-pixel viewport.

J. On Overview, verify INV-101 is ₹8,000 and 12 days late and INV-102 is ₹3,500 and 5 days late. Open a reminder from each row. After the main import, check that INV-101’s row and reminder both say ₹3,000 and its due date is unchanged. On the unidentified ₹3,500 row, confirm that amount-only evidence leaves selection empty, including after re-import. Explicitly choose INV-102 in a separate test step. Cash becomes ₹14,500, Friday closes at +₹4,500, and the paid invoice leaves Overview.

K. Download and upload all four files through the browser. Check explicit allocation, duplicates, manual linking, conflicting evidence, ignore and excess credit. Compare the packaged CSV bytes with the downloads. Complete the booking calculator example and save a feasible booking to verify its split invoices and costs. Run the desktop and mobile walkthrough against the production build.

L. From the judge entry and an invoice, test the client offer screen on desktop and mobile. Change the amount and both dates, cross the exact buffer boundary, try an impossible split and apply the minimum. Verify the draft, fallback and cash isolation before saving. Save, reload and record a partial receipt. Check that the forecast consumes each installment once. Cover positive buffers, fractional rupees, same-day payments, insufficient balances and later bills in a longer forecast.

M. From a fresh Friday judge demo, save the ₹4,000 Friday / ₹7,000 Saturday split for INV-104. Record ₹1,000 received on 23 November. Download the PDF and verify the ₹11,000 invoice, ₹1,000 paid, ₹10,000 remaining, original 26 November due date, ₹3,000 still due on 27 November and ₹7,000 on 28 November. Check native PDF sharing, cancellation, a download fallback and edited WhatsApp/Gmail drafts. Record a further ₹10,500, then verify ₹0 due and ₹500 unapplied. Verify both transfers appear and the invoice records ₹11,000 applied. Run the earlier full judge flow too.

Keep the app mobile-friendly and use the existing visual style. Prioritize the working financial flow over new landing-page animations or unrelated features. Sample data is sufficient. The demo should work without live banking, WhatsApp delivery or external AI credentials.

Provide `npm start` for the local server on port 4317, `npm test` for the ledger and planning tests, `npm run build` for the static production files in `dist`, and `npm run test:demo` for the browser walkthrough. Before finishing, run the tests and the production build. Fix failures caused by the changes. Report the exact commands and results, the files changed, how to open and reset the sample, and the three-minute camera-to-calculator walkthrough in `CashAhead-3-Minute-Judge-Walkthrough.md`. Identify anything you could not verify.
