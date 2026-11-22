import test from 'node:test';
import assert from 'node:assert/strict';
import {judgeStudio,receipt,promise,forecast} from '../src/ledger.js';
import {saveOffer} from '../src/offers.js';
import {invoiceStatement,invoiceMessage,reminderMessage,draftUrls} from '../src/clientinvoice.js';
import {invoiceDocument} from '../src/invoicepdf.js';

const id='INV-104';
const invoice=s=>s.invoices.find(i=>i.id===id);
const model=s=>invoiceStatement(s,invoice(s));
const pay=(s,amount,key='one')=>receipt(s,{id:key,invoiceId:id,amount,date:s.date,reference:'PRIVATE-BANK-REFERENCE'});
const split=s=>saveOffer(s,id,{amount:4000,firstDate:'2026-11-27',finalDate:'2026-11-28'},model(s).balance,JSON.stringify(invoice(s).promise));

test('forecast delays and ambiguous legacy dates never appear as client agreements',()=>{
  const s=judgeStudio(),m=model(s);
  assert.equal(m.due,'2026-11-26');assert.deepEqual(m.agreed,[]);assert.equal(m.balance,11000);assert.deepEqual(m.receipts,[]);
  assert.ok(!JSON.stringify(invoiceDocument(m)).includes('11 Dec'));
  const legacy=structuredClone(s);delete invoice(legacy).promise.source;
  assert.deepEqual(model(legacy).agreed,[]);assert.deepEqual(forecast(legacy),forecast(s));
});
test('export allocates receipts after the agreement once even after an installment date passes',()=>{
  let s=pay(judgeStudio(),2000);s=split(s);s=pay(s,1000,'two');
  s=receipt(s,{id:'other',invoiceId:'INV-101',amount:8000,date:s.date});
  s={...s,date:'2026-11-28'};
  const m=model(s);
  assert.equal(m.paid,3000);assert.equal(m.balance,8000);assert.equal(m.receipts.length,2);
  assert.deepEqual(m.agreed,[{date:'2026-11-27',amount:4000,remaining:3000},{date:'2026-11-28',amount:5000,remaining:5000}]);
  assert.match(invoiceMessage(m),/₹3,000 by 27 Nov 2026 and ₹5,000 by 28 Nov 2026/);
  assert.doesNotMatch(JSON.stringify(m),/PRIVATE-BANK|Kiran|cash on hand/i);
  assert.equal(forecast(s)[0].inflows.filter(f=>f.label.includes(id))[0].amount,5000);
});
test('paid invoices show each receipt, zero due, the original agreed amounts and excess credit separately',()=>{
  let s=split(judgeStudio());s=pay(s,3999.99);s=pay(s,7500.01,'two');
  const m=model(s);
  assert.equal(m.balance,0);assert.equal(m.paid,11000);
  assert.equal(m.receipts[1].applied,7000.01);assert.equal(m.receipts[1].credit,500);
  assert.deepEqual(m.agreed.map(p=>p.remaining),[0,0]);assert.match(JSON.stringify(invoiceDocument(m)),/Paid in full/);
  assert.doesNotMatch(invoiceMessage(m),/still due:/);
});
test('saving a private date after negotiation preserves the client agreement and its subsequent payments',()=>{
  const original=split(judgeStudio());
  const expected=promise(original,id,11000,'2026-12-20','forecast');
  const paid=pay(expected,1000);
  assert.deepEqual(model(paid).agreed.map(p=>[p.date,p.remaining]),[['2026-11-27',3000],['2026-11-28',7000]]);
  assert.equal(forecast(paid)[27].inflows.find(f=>f.label.includes(id)).amount,10000);
  assert.doesNotMatch(invoiceMessage(model(paid)),/20 Dec/);
  const revised=promise(paid,id,10000,'2026-11-30');
  assert.deepEqual(model(revised).agreed.map(p=>p.date),['2026-11-30']);
});
test('a single recorded promise covers only its own amount and an explicit rescue ask retains its deadline',()=>{
  const m=model(pay(promise(judgeStudio(),id,2500,'2026-11-29'),500));
  assert.match(reminderMessage(m),/₹2,000 by 29 Nov 2026/);assert.match(reminderMessage(m),/outstanding balance is ₹10,500/);
  assert.match(reminderMessage(m,'2026-11-27',3000),/₹3,000.*INV-104.*27 Nov 2026/);
  assert.match(JSON.stringify(invoiceDocument(m)),/₹8,500 of the balance has no separately agreed payment date/);
});
test('draft links preserve edited punctuation, rupees and newlines and leave the recipient open',()=>{
  const body='Hi Kiran & Divya,\n₹1,000 + ₹500? #INV-101',subject='Invoice & reminder';
  const links=draftUrls(subject,body),wa=new URL(links.whatsapp),gmail=new URL(links.gmail);
  assert.equal(wa.origin,'https://wa.me');assert.equal(wa.searchParams.get('text'),body);assert.equal(wa.pathname,'/');
  assert.equal(gmail.origin,'https://mail.google.com');assert.equal(gmail.searchParams.get('body'),body);
  assert.equal(gmail.searchParams.get('su'),subject);assert.equal(gmail.searchParams.has('to'),false);
});
