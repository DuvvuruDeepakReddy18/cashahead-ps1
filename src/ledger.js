export const DEMO_DAY = '2026-11-23';
export const round = value => Math.round((value + Number.EPSILON) * 100) / 100;
export const money = value => (value < 0 ? '−₹' : '₹') + Math.abs(value).toLocaleString('en-IN', {maximumFractionDigits: 2});
export const signed = value => (value > 0 ? '+' : '') + money(value);
export const todayLocal = () => {
  const d = new Date();
  return [d.getFullYear(), String(d.getMonth()+1).padStart(2,'0'), String(d.getDate()).padStart(2,'0')].join('-');
};
export function validDate(s) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const stamp = Date.parse(s+'T00:00:00Z');
  return Number.isFinite(stamp) && new Date(stamp).toISOString().slice(0,10)===s;
}
export const addDays = (s,n) => new Date(Date.parse(s+'T00:00:00Z')+n*86400000).toISOString().slice(0,10);
export const daysApart = (a,b) => Math.round((Date.parse(b)-Date.parse(a))/86400000);
export const dateText = s => new Date(s+'T12:00:00Z').toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short',timeZone:'UTC'});
export function amountValue(v,{zero=false}={}) {
  const n = Number(v);
  if (v==='' || !Number.isFinite(n) || !Number.isSafeInteger(Math.round(n*100)) || round(n)!==n || (zero ? n<0 : n<=0)) throw Error('Enter a valid rupee amount with up to two decimal places.');
  return n;
}
export function blankStudio(date=todayLocal()) {
  return {version:1, name:'My studio', date, opening:0, buffer:0, invoices:[], bills:[], receipts:[], reminders:[], ignored:[]};
}
export function addInvoice(studio,entry) {
  if (!entry.client.trim() || !entry.job.trim() || !validDate(entry.due)) throw Error('Enter a client, shoot and valid due date.');
  let sequence = 101;
  while(studio.invoices.some(i=>i.id==='INV-'+sequence)) sequence++;
  const id=entry.id || 'INV-'+sequence;
  if(studio.invoices.some(i=>i.id===id)) throw Error('This invoice reference already exists.');
  const invoice={...entry,id,client:entry.client.trim(),job:entry.job.trim(),amount:amountValue(entry.amount),kind:entry.kind||'balance'};
  return {...studio,invoices:[...studio.invoices,invoice]};
}
export function addBill(studio,entry) {
  if(!entry.label.trim() || !validDate(entry.date) || !Number.isInteger(entry.moveDays) || entry.moveDays<0) throw Error('Check the bill name, due date and deferral period.');
  if(studio.bills.some(b=>b.id===entry.id))return studio;
  return {...studio,bills:[...studio.bills,{...entry,amount:amountValue(entry.amount)}]};
}
export function sampleStudio() {
  let s={...blankStudio(DEMO_DAY),name:'Ananya Rao Photography',opening:6000};
  const date=n=>addDays(DEMO_DAY,n);
  const rows=[
    ['101','Kiran & Divya','Engagement shoot',8000,-12,'balance'],
    ['102','Sai Teja','Birthday shoot',3500,-5,'balance'],
    ['103','Mehta Infotech','Team headshots',6000,10,'balance'],
    ['104','Reddy–Varma','Wedding photography',11000,3,'balance'],
    ['105','Lakshmi & Arjun','December wedding',15000,6,'deposit'],
    ['106','Lakshmi & Arjun','December wedding',35000,40,'balance'],
    ['108','Meghana & Rohit','January wedding',20000,30,'deposit'],
    ['109','Meghana & Rohit','January wedding',45000,75,'balance']];
  for(const [n,client,job,amount,d,kind] of rows) s=addInvoice(s,{id:'INV-'+n,client,job,amount,due:date(d),kind});
  s.invoices[1].promise={date:date(12),amount:3500,alreadyApplied:0,source:'agreed'};s.invoices[1].recovery=0;
  const commitments=[['Ravi · second shooter',6000,4,0],['LensHub · lens rental',4000,4,7],['Camera EMI',7500,8,0],['Kavya · editing',5000,15,5],['Cloud storage',1500,20,0],['Wedding crew',12000,21,0],['Album printing',9000,35,10],['Camera EMI',7500,38,0],['Cloud storage',1500,50,0],['Wedding crew',14000,60,0],['Camera EMI',7500,68,0],['Cloud storage',1500,80,0]];
  s.bills=commitments.map(([label,amount,d,moveDays],n)=>({id:'B-'+(n+1),label,amount,date:date(d),moveDays}));
  return s;
}
// Start the judge at the same saved promise an owner can enter in Forecast.
export function judgeStudio() {
  const studio=sampleStudio();
  const delayed=studio.invoices.find(invoice=>invoice.id==='INV-104');
  return promise(studio,delayed.id,outstanding(studio,delayed),addDays(delayed.due,15),'forecast');
}
export const paidFor=(s,id)=>round(s.receipts.filter(r=>r.invoiceId===id).reduce((a,r)=>a+r.applied,0));
export const outstanding=(s,i)=>round(i.amount-paidFor(s,i.id));
export const cash=s=>round(s.opening+s.receipts.reduce((a,r)=>a+r.amount,0)-s.bills.filter(b=>b.paid).reduce((a,b)=>a+b.amount,0));
export function receipt(s,{id,invoiceId,amount,date,bankKey='',reference=''}) {
  if(s.receipts.some(r=>r.id===id || (bankKey && r.bankKey===bankKey)))return s;
  const inv=s.invoices.find(i=>i.id===invoiceId);
  if(!inv || outstanding(s,inv)<=0)throw Error('Select an invoice with a balance due.');
  if(!validDate(date)||date>s.date)throw Error('The received date must be today or earlier.');
  amount=amountValue(amount);
  return {...s,receipts:[...s.receipts,{id,invoiceId,amount,applied:Math.min(amount,outstanding(s,inv)),date,bankKey,reference}]};
}
// The forecast can move a receipt without renegotiating the terms the client accepted.
export function confirmedAgreement(invoice) {
  const p=invoice.promise;
  return p?.source==='agreed'||p?.installments ? p : invoice.savedAgreement;
}
export function promise(s,id,amount,date,source='agreed') {
  const i=s.invoices.find(i=>i.id===id);
  if(!i || !validDate(date)||date<s.date||(i.earliest&&date<i.earliest)||amountValue(amount)>outstanding(s,i))throw Error('Check the promise amount and future date.');
  const next={...i,promise:{amount:Number(amount),date,source,alreadyApplied:paidFor(s,id)}};
  const agreement=confirmedAgreement(i);
  if(source==='forecast' && agreement)next.savedAgreement=agreement;
  else delete next.savedAgreement;
  return {...s,invoices:s.invoices.map(row=>row.id===id?next:row)};
}
export function installmentBalances(s,i,p=i.promise) {
  if(!p)return [];
  let applied=Math.max(0,round(paidFor(s,i.id)-(p.alreadyApplied??0)));
  let balance=outstanding(s,i);
  return (p.installments||[p]).map(part=>{
    const used=Math.min(part.amount,applied);
    applied=round(applied-used);
    const remaining=Math.min(balance,round(part.amount-used));
    balance=round(balance-remaining);
    return {date:part.date,amount:part.amount,remaining};
  });
}
export function incomeSchedule(s,i) {
  let remainder=outstanding(s,i);
  const flows=[];
  for(const part of installmentBalances(s,i)){
    if(part.remaining>0 && part.date>=s.date){
      const date=i.earliest && part.date<i.earliest ? i.earliest : part.date;
      flows.push({date,amount:part.remaining,label:i.client+' · '+i.id});
    }
    remainder=round(remainder-part.remaining);
  }
  const original=i.expected||i.due;
  const date=original>=s.date && i.earliest && original<i.earliest?i.earliest:original;
  if(remainder>0 && date>=s.date)flows.push({date,amount:remainder,label:i.client+' · '+i.id});
  return flows;
}
export function forecast(s,horizon=30) {
  const days=Array.from({length:horizon+1},(_,n)=>({date:addDays(s.date,n),inflows:[],outflows:[],close:0}));
  const map=new Map(days.map(d=>[d.date,d]));
  for(const i of s.invoices)for(const f of incomeSchedule(s,i))map.get(f.date)?.inflows.push(f);
  for(const b of s.bills.filter(b=>!b.paid))map.get(b.date<s.date?s.date:b.date)?.outflows.push({label:b.label,amount:b.amount,id:b.id});
  let balance=cash(s);
  for(const day of days){
    balance=round(balance+day.inflows.reduce((a,f)=>a+f.amount,0)-day.outflows.reduce((a,f)=>a+f.amount,0));
    day.close=balance;
  }
  return days;
}
