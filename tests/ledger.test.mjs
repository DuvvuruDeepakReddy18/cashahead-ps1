import test from 'node:test';
import assert from 'node:assert/strict';
import {sampleStudio,blankStudio,addInvoice,receipt,paidFor,outstanding,promise,cash,forecast,addDays,DEMO_DAY} from '../src/ledger.js';
import {parseStatement,review,confirmBank,sampleCSV} from '../src/bank.js';
const row=(s,id)=>s.invoices.find(i=>i.id===id);
const pay=(s,id,amount,token,ref='')=>receipt(s,{id:token,invoiceId:id,amount,date:s.date,reference:ref});
const delay=s=>promise(s,'INV-104',11000,addDays(s.date,18));
test('Monday sample and 30/60/90-day baseline reconcile',()=>{
  const s=sampleStudio();assert.equal(new Date(s.date).getUTCDay(),1);
  for(const span of [30,60,90]){const path=forecast(s,span);assert.equal(path.length,span+1);assert.equal(path[4].close,7000);assert.deepEqual(path[4].outflows.map(x=>x.amount),[6000,4000]);assert.ok(path.every(d=>d.close>=0));}
  assert.equal(Math.min(...forecast(s,30).map(d=>d.close)),5500);assert.equal(s.invoices.reduce((a,i)=>a+outstanding(s,i),0),143500);
});
test('sample import, confirmed partial receipt, retries and alternative payment',()=>{
  const baseline=sampleStudio(),s=delay(baseline);assert.equal(forecast(baseline)[4].close,7000);assert.equal(forecast(s)[4].close,-4000);
  const result=parseStatement(sampleCSV(s));assert.equal(result.debits,1);assert.equal(result.errors.length,0);
  const bank=result.rows[0];assert.equal(review(s,bank).suggestion,'INV-101');
  const paid=confirmBank(s,bank,'INV-101');assert.equal(cash(paid),11000);assert.equal(forecast(paid)[4].close,1000);
  assert.equal(outstanding(paid,row(paid,'INV-101')),3000);assert.equal(row(paid,'INV-101').due,addDays(DEMO_DAY,-12));
  assert.deepEqual(confirmBank(paid,bank,'INV-101'),paid);
  const small=pay(s,'INV-101',2000,'manual');assert.equal(forecast(small)[4].close,-2000);assert.equal(cash(small),8000);
});
test('partial promise only forecasts what was promised and consumes confirmed receipts once',()=>{
  let s=promise(sampleStudio(),'INV-101',3000,addDays(DEMO_DAY,2));
  assert.equal(forecast(s)[2].close,9000);
  s=pay(s,'INV-101',1000,'first');assert.equal(forecast(s)[2].close,9000);
  s=pay(s,'INV-101',2000,'second');assert.equal(forecast(s)[2].close,9000);assert.equal(outstanding(s,row(s,'INV-101')),5000);
});
test('manual entry, a later bank link, distinct references and excess cash',()=>{
  let s=pay(sampleStudio(),'INV-101',5000,'manual');const bank=parseStatement(sampleCSV(s)).rows[0];
  assert.equal(review(s,bank).manual.length,1);s=confirmBank(s,bank,'link:manual');assert.equal(cash(s),11000);assert.equal(s.receipts.length,1);
  const second={...bank,key:'ref:A-SECOND-TRANSFER',reference:'A-SECOND-TRANSFER'};assert.equal(review(s,second).duplicate,false);
  s=confirmBank(s,second,'INV-101');assert.equal(s.receipts.length,2);assert.equal(cash(s),16000);assert.equal(outstanding(s,row(s,'INV-101')),0);
  assert.equal(s.receipts[1].amount-s.receipts[1].applied,2000);
});
test('a matching amount offers a hint and requires the owner to choose the allocation',()=>{
  const studio=sampleStudio();
  const [identified,unidentified]=parseStatement(sampleCSV(studio)).rows;
  const match=review(studio,unidentified);
  assert.equal(match.suggestion,'');
  assert.equal(match.amountHint.id,'INV-102');
  assert.throws(()=>confirmBank(studio,unidentified,''),/Choose an invoice/);
  assert.equal(cash(studio),6000);
  const chosen=confirmBank(studio,unidentified,'INV-101');
  assert.equal(outstanding(chosen,row(chosen,'INV-101')),4500);
  assert.equal(outstanding(chosen,row(chosen,'INV-102')),3500);
  assert.equal(review(studio,identified).suggestion,'INV-101');
  assert.equal(review(studio,{...unidentified,description:'Transfer from Sai Teja'}).suggestion,'INV-102');
});
test('ambiguous amounts, unknown and conflicting evidence require an explicit choice',()=>{
  let s=addInvoice(sampleStudio(),{client:'Other studio',job:'Portrait',amount:3500,due:DEMO_DAY});
  const check=description=>review(s,{date:s.date,amount:3500,description,key:'row',reference:''});
  assert.equal(check('Transfer').amountHint,null);assert.equal(check('INV-999').amountHint,null);
  assert.equal(check('Transfer').suggestion,'');assert.equal(check('INV-101 Mehta Infotech').conflict,true);
  assert.equal(check('INV-999').suggestion,'');assert.equal(check('INV-101 INV-102').suggestion,'');
});
test('CSV supports quoting, several headers, alternative dates, debit filtering and row errors',()=>{
  const parsed=parseStatement('Date,Description,Amount\n23/11/26,"work, phase 1","1,234.50"\n2026-11-23,withdrawal,-20\n31/02/26,bad,200');
  assert.equal(parsed.rows[0].amount,1234.5);assert.equal(parsed.rows[0].date,DEMO_DAY);assert.equal(parsed.debits,1);assert.equal(parsed.errors.length,1);
  assert.equal(parseStatement('Date,Details,Credit\n23-11-26,Work,20').rows.length,1);
  assert.throws(()=>parseStatement('date,other\n2026-11-23,4'));
});
test('future and invalid receipts are rejected and identical manual request is idempotent',()=>{
  const s=sampleStudio(),i=pay(s,'INV-104',1000,'token');assert.equal(pay(i,'INV-104',1000,'token'),i);
  assert.throws(()=>receipt(s,{id:'future',invoiceId:'INV-101',amount:100,date:addDays(s.date,2)}));
  for(const a of [0,-2,NaN,Infinity,2.334])assert.throws(()=>pay(s,'INV-101',a,'bad'));
  assert.equal(forecast(i)[3].close,forecast(s)[3].close);assert.equal(paidFor(s,'INV-104'),0);
});
test('fresh invoice and arbitrary receipt have the same accounting',()=>{
  let s=addInvoice(blankStudio(DEMO_DAY),{client:'New client',job:'Album',amount:9000,due:DEMO_DAY});const i=s.invoices[0];
  s=pay(s,i.id,2200,'r');assert.equal(outstanding(s,i),6800);assert.equal(cash(s),2200);assert.equal(forecast(s)[0].close,9000);
});
