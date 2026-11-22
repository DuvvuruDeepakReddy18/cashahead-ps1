import {addDays,amountValue,daysApart,forecast,incomeSchedule,outstanding,paidFor,round,validDate} from './ledger.js';

function readOffer(studio,invoice,offer){
  const total=outstanding(studio,invoice);
  if(total<=0)throw Error('Select an invoice with an outstanding balance.');
  const {firstDate,finalDate}=offer;
  const earliest=invoice.earliest>studio.date ? invoice.earliest : studio.date;
  if(!validDate(firstDate)||!validDate(finalDate))throw Error('Enter both payment dates.');
  if(firstDate<earliest)throw Error('The first date must be on or after '+earliest+'.');
  if(finalDate<firstDate)throw Error('The balance date must be on or after the first payment.');
  if(daysApart(studio.date,finalDate)>3650)throw Error('Choose payment dates within ten years.');
  const first=amountValue(offer.amount,{zero:true});
  if(first>total)throw Error('The first payment exceeds the outstanding balance.');
  return {total,first,rest:round(total-first),firstDate,finalDate,earliest};
}

// Price dates against a single forecast with this invoice removed.
// Receipts already received still count in cash; a proposed schedule replaces every old inflow for this invoice.
export function evaluateOffer(studio,invoice,offer){
  const terms=readOffer(studio,invoice,offer);
  const {total,first,firstDate,finalDate,earliest}=terms;
  const horizon=Math.max(90,daysApart(studio.date,finalDate));
  const baseline=forecast({...studio,invoices:studio.invoices.filter(i=>i.id!==invoice.id)},horizon);
  let firstNeed=null,fullFailure=null,firstFailure=null,splitFailure=null,minimum=0;
  const projected=baseline.map(day=>{
    const need=Math.max(0,round(studio.buffer-day.close));
    if(need>0&&!firstNeed)firstNeed=day;
    if(need>(day.date>=earliest?total:0)&&!fullFailure)fullFailure=day;
    if(need>(day.date>=firstDate?total:0)&&!splitFailure)splitFailure=day;
    if(day.date>=firstDate && day.date<finalDate)minimum=Math.max(minimum,need);
    const received=day.date>=finalDate?total:day.date>=firstDate?first:0;
    const projectedDay={...day,close:round(day.close+received)};
    if(projectedDay.close<studio.buffer&&!firstFailure)firstFailure=projectedDay;
    return projectedDay;
  });
  const end=baseline[horizon].date;
  const focus=firstFailure || projected.find(d=>d.date===firstNeed?.date) || projected.find(d=>d.outflows.length) || projected[0];
  return {...terms,end,focus,firstFailure,fullFailure,splitFailure,
    gap:firstFailure?round(studio.buffer-firstFailure.close):0,
    minimum:splitFailure?null:minimum,
    lastSafe:firstNeed&&!fullFailure?firstNeed.date:null,
    needsPayment:Boolean(firstNeed)};
}

export function saveOffer(studio,id,offer,expectedBalance,previousPromise){
  const invoice=studio.invoices.find(i=>i.id===id);
  if(!invoice||outstanding(studio,invoice)!==expectedBalance||JSON.stringify(invoice.promise)!==previousPromise)
    throw Error('This invoice changed. Reopen the offer to check its current terms.');
  const {total,first,rest,firstDate,finalDate}=readOffer(studio,invoice,offer);
  let installments=[{date:firstDate,amount:first},{date:finalDate,amount:rest}].filter(p=>p.amount>0);
  if(firstDate===finalDate)installments=[{date:firstDate,amount:total}];
  const promise={installments,alreadyApplied:paidFor(studio,id)};
  return {...studio,invoices:studio.invoices.map(i=>i.id===id?{...i,promise}:i)};
}

export function offerDefaults(studio,invoice){
  const today=studio.date;
  const weekday=new Date(today+'T00:00:00Z').getUTCDay();
  if(invoice.promise?.installments){
    const parts=incomeSchedule(studio,invoice);
    if(parts.length){
      const last=parts[parts.length-1];
      return {amount:parts.length===1?0:parts[0].amount,firstDate:parts[0].date,finalDate:last.date};
    }
  }
  const friday=addDays(today,(5-weekday+7)%7);
  const firstDate=invoice.earliest>friday?invoice.earliest:friday;
  return {amount:0,firstDate,finalDate:addDays(firstDate,1)};
}

