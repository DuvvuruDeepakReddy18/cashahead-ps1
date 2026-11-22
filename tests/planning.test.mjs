import test from 'node:test';
import assert from 'node:assert/strict';
import {sampleStudio,judgeStudio,blankStudio,addInvoice,promise,receipt,forecast,addDays,DEMO_DAY} from '../src/ledger.js';
import {evaluateOffer,saveOffer} from '../src/offers.js';
import {cash,incomeSchedule,outstanding} from '../src/ledger.js';
import {rankRescues,depositQuote,saveBooking} from '../src/planning.js';
const s0=()=>({...blankStudio(DEMO_DAY),opening:6000});
const b=()=>({client:'New client',job:'Wedding',price:30000,buffer:3000,finalDate:addDays(DEMO_DAY,14),costs:[{label:'Rental',amount:10000,date:addDays(DEMO_DAY,4)}]});
const late=()=>promise(sampleStudio(),'INV-104',11000,addDays(DEMO_DAY,18),'forecast');
test('judge demo starts from a fresh sample with the same delayed invoice as the forecast workflow',()=>{
  const studio=judgeStudio();
  assert.deepEqual(studio,late());
  assert.equal(forecast(studio)[4].close,-4000);
  assert.equal(forecast(sampleStudio())[4].close,7000);
  studio.bills[0].amount=1;
  assert.deepEqual(judgeStudio(),late());
});
test('rescue ranking ties money to the deadline, protects crew and prefers a conservative collection',()=>{
  const s=late(),p=rankRescues(s);assert.equal(p.gap,4000);assert.equal(p.mode,'conservative');assert.deepEqual(p.chosen.map(a=>a.id),['INV-101']);
  assert.equal(p.chosen[0].safeGain,4000);assert.equal(p.chosen[0].fullGain,8000);assert.ok(p.excluded.some(v=>v.includes('Ravi')));
  assert.equal(p.actions.some(a=>a.id==='INV-103'),false);assert.equal(forecast(s)[4].close,-4000);
  const little=receipt(s,{id:'manual',invoiceId:'INV-101',amount:2000,date:s.date});assert.equal(rankRescues(little).gap,2000);
});
test('changing one collection assumption switches who to chase without posting a payment',()=>{
  const studio=late(),original=structuredClone(studio);
  const planAt=rate=>rankRescues(studio,30,new Map([['INV-101',rate]]));
  const half=planAt(0.5),quarter=planAt(0.25);
  const kiran=plan=>plan.actions.find(a=>a.id==='INV-101');
  assert.equal(half.gap,4000);assert.equal(quarter.gap,4000);
  assert.equal(kiran(half).safeGain,4000);assert.equal(kiran(quarter).safeGain,2000);
  assert.equal(kiran(quarter).fullGain,8000);
  assert.deepEqual(half.chosen.map(a=>a.id),['INV-101']);
  assert.deepEqual(quarter.chosen.map(a=>a.id),['INV-105']);
  assert.equal(quarter.chosen[0].safeGain,7500);
  assert.deepEqual(planAt(0.5),half);
  assert.deepEqual(half,rankRescues(studio));
  assert.deepEqual(studio,original);
});

test('collection overrides respect a later promise, early-deposit terms and vendor terms',()=>{
  const studio=late();
  const base=rankRescues(studio);
  const unsupported=new Map([['INV-102',0.5],['INV-105',0.25],['B-2',0.25],['INV-101',1]]);
  assert.deepEqual(rankRescues(studio,30,unsupported),base);
  const paid=receipt(studio,{id:'partial',invoiceId:'INV-101',amount:2000,date:studio.date});
  const plan=rankRescues(paid,30,new Map([['INV-101',0.25]]));
  const action=plan.actions.find(a=>a.id==='INV-101');
  assert.equal(action.ask,6000);assert.equal(action.safeGain,1500);assert.equal(plan.gap,2000);
});

test('large overdue invoice with known late availability cannot beat a smaller timely receipt',()=>{
  let s=late();s=addInvoice(s,{id:'INV-999',client:'Big client',job:'Work',amount:100000,due:addDays(s.date,-4),earliest:addDays(s.date,5)});
  const p=rankRescues(s);assert.ok(!p.actions.some(a=>a.id==='INV-999'));assert.equal(p.chosen[0].id,'INV-101');
});
test('optimistic-only and genuinely uncovered results are distinguished',()=>{
  const s=late();s.bills[0].amount=35000;
  const p=rankRescues(s);assert.equal(p.gap,33000);assert.equal(p.mode,'incomplete');assert.equal(p.left,2500);
  s.bills=s.bills.filter(b=>b.id==='B-1');s.bills[0].amount=12500;s.invoices=s.invoices.filter(i=>['INV-101','INV-104'].includes(i.id));
  assert.equal(rankRescues(s).mode,'conditional');
});
test('a deferral that creates a new later shortfall is reported',()=>{
  let s={...blankStudio(DEMO_DAY),opening:100};const d=n=>addDays(s.date,n);
  s=addInvoice(s,{client:'Late fee',job:'Sale',amount:60,due:d(1)});
  s.bills=[{id:'move',label:'Rental',amount:150,date:d(0),moveDays:3},{id:'fixed',label:'Crew',amount:80,date:d(2),moveDays:0}];
  const p=rankRescues(s);assert.equal(p.actions[0].full[3],0);assert.equal(p.actions[0].later,d(3));assert.equal(p.mode,'later-risk');assert.equal(p.actions[0].fullGain,150);
});
test('minimum deposit, date, independent example and changed rental cost',()=>{
  const s=s0(),q=depositQuote(s,b());assert.equal(q.amount,7000);assert.equal(q.remainder,23000);assert.equal(q.deadline,addDays(s.date,4));
  const book=b();book.costs[0].amount=12000;assert.equal(depositQuote(s,book).amount,9000);
});
test('minimum deposit accounts for all commitments, first deadline, zero deposit and insufficient price',()=>{
  let s=s0(),book=b();s.opening=20000;assert.equal(depositQuote(s,book).amount,0);
  s=s0();book.price=4000;assert.equal(depositQuote(s,book).uncovered,3000);
  book=b();s.bills=[{id:'crew',label:'Other shoot',date:addDays(s.date,1),amount:5000,moveDays:0}];
  let q=depositQuote(s,book);assert.equal(q.amount,12000);assert.equal(q.deadline,addDays(s.date,1));
  book.costs.push({label:'Editing',date:addDays(s.date,18),amount:50000});q=depositQuote(s,book);assert.ok(q.uncovered>0);
});
test('saving a booking splits the price exactly once and preview leaves the ledger unchanged',()=>{
  const s=s0(),book=b();depositQuote(s,book);assert.equal(s.invoices.length,0);
  const saved=saveBooking(s,book,'one');assert.equal(saved.invoices.reduce((a,i)=>a+i.amount,0),book.price);
  assert.equal(saved.bills.length,1);assert.equal(forecast(saved)[4].close,3000);assert.deepEqual(saveBooking(saved,book,'one'),saved);
});

const terms=(amount,first=4,last=5)=>({amount,firstDate:addDays(DEMO_DAY,first),finalDate:addDays(DEMO_DAY,last)});
test('negotiating replaces the old invoice forecast and finds the exact boundary and minimum',()=>{
  const s=judgeStudio(),original=structuredClone(s),i=s.invoices.find(i=>i.id==='INV-104');
  for(const [amount,gap] of [[0,4000],[2000,2000],[3999.99,0.01],[4000,0],[11000,0]]){
    const q=evaluateOffer(s,i,terms(amount));
    assert.equal(q.gap,gap);assert.equal(q.minimum,4000);assert.equal(q.lastSafe,addDays(s.date,4));
    assert.equal(q.focus.close,(Math.round(amount*100)-400000)/100);assert.equal(q.rest,(1100000-Math.round(amount*100))/100);
  }
  assert.equal(evaluateOffer(s,i,terms(0,4,4)).minimum,0);
  const later=evaluateOffer(s,i,terms(11000,5,6));
  assert.equal(later.minimum,null);assert.equal(later.splitFailure.date,addDays(s.date,4));
  assert.equal(later.lastSafe,addDays(s.date,4));
  assert.deepEqual(s,original);
});
test('offer math checks all dates, the buffer, invoice constraints and uncovered or unnecessary payments',()=>{
  let s={...blankStudio(DEMO_DAY),opening:100,buffer:10.25};
  s=addInvoice(s,{id:'X',amount:100,client:'A',job:'Portrait',due:s.date});
  const i=s.invoices[0];assert.equal(evaluateOffer(s,i,terms(0)).needsPayment,false);
  s.bills=[{id:'a',label:'First bill',amount:100,date:addDays(s.date,2)},{id:'b',label:'Later bill',amount:50,date:addDays(s.date,3)}];
  let q=evaluateOffer(s,i,terms(10.25,1,5));assert.equal(q.lastSafe,addDays(s.date,2));assert.equal(q.minimum,60.25);
  assert.equal(q.firstFailure.date,addDays(s.date,3));assert.equal(q.gap,50);
  assert.equal(evaluateOffer(s,i,terms(60.24,1,5)).gap,0.01);
  assert.equal(evaluateOffer(s,i,terms(60.25,1,5)).gap,0);
  const restricted={...i,earliest:addDays(s.date,3)};
  assert.throws(()=>evaluateOffer(s,restricted,terms(10,1,5)));
  q=evaluateOffer(s,restricted,terms(50,3,5));assert.equal(q.lastSafe,null);assert.ok(q.fullFailure);
  s.bills.push({id:'c',label:'Long-term cost',amount:500,date:addDays(s.date,120)});
  q=evaluateOffer(s,i,terms(100,0,125));assert.equal(q.minimum,null);assert.equal(q.lastSafe,null);assert.equal(q.end,addDays(s.date,125));
  for(const o of [terms('',1,5),terms(101,1,5),terms(-1,1,5),terms(1,5,4),terms(1,-1,5),{...terms(1),finalDate:'bad'}])assert.throws(()=>evaluateOffer(s,i,o));
});
test('an agreed split survives reload, replaces legacy promises, and only receipts move cash',()=>{
  const s=judgeStudio(),id='INV-104',invoice=s.invoices.find(i=>i.id===id);
  let next=saveOffer(s,id,terms(4000),11000,JSON.stringify(invoice.promise));
  assert.equal(cash(next),6000);assert.equal(forecast(next)[4].close,0);
  const parts=()=>incomeSchedule(next,next.invoices.find(i=>i.id===id)).map(({date,amount})=>[date,amount]);
  assert.deepEqual(parts(),[[addDays(s.date,4),4000],[addDays(s.date,5),7000]]);
  assert.throws(()=>saveOffer(next,id,terms(2000),11000,JSON.stringify(invoice.promise)),/changed/);
  next=JSON.parse(JSON.stringify(next));
  next=receipt(next,{id:'part1',invoiceId:id,amount:5000,date:s.date});
  assert.equal(cash(next),11000);assert.deepEqual(parts(),[[addDays(s.date,5),6000]]);assert.equal(forecast(next)[4].close,1000);
  const current=next.invoices.find(i=>i.id===id);
  assert.throws(()=>saveOffer(next,id,terms(2000),11000,JSON.stringify(current.promise)),/changed/);
  next=saveOffer(next,id,terms(2000,3,3),6000,JSON.stringify(current.promise));
  assert.deepEqual(parts(),[[addDays(s.date,3),6000]]);
  next=receipt(next,{id:'part2',invoiceId:id,amount:6000,date:s.date});
  assert.equal(outstanding(next,current),0);assert.deepEqual(parts(),[]);
});

