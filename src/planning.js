import {forecast, outstanding, incomeSchedule, amountValue, daysApart, addDays, validDate, round, addInvoice, addBill} from './ledger.js';

export function rankRescues(s,horizon=30,collectionRates=new Map()) {
  const base=forecast(s,horizon), at=base.findIndex(d=>d.close<s.buffer);
  if(at<0)return {day:null,gap:0,actions:[],chosen:[],excluded:[],mode:'covered',left:0};
  const day=base[at],gap=round(s.buffer-day.close),actions=[],excluded=[];
  function add(spec,project){
    function simulate(rate){
      const changes=project(rate);
      let gain=0;
      return base.map(d=>{gain=round(gain+(changes.get(d.date)||0));return gain;});
    }
    const safe=simulate(spec.rate),full=spec.rate===1?safe:simulate(1);
    if(full[at]<=0)return;
    const futureRisk=delta=>base.find((d,n)=>n>at && round(d.close+delta[n])<s.buffer)?.date||'';
    actions.push({...spec,safe,full,safeGain:safe[at],fullGain:full[at],later:futureRisk(safe),fullLater:futureRisk(full)});
  }
  for(const i of s.invoices){
    const amount=outstanding(s,i);if(!amount)continue;
    if(i.earliest && i.earliest>day.date){excluded.push(i.client+' · funds available after the deadline');continue;}
    const late=i.due<s.date;
    const advancePromise=late && i.promise && (i.promise.installments || [i.promise]).some(part=>part.date>day.date);
    if(!late && !(i.kind==='deposit' && i.due>day.date && daysApart(day.date,i.due)<=3))continue;
    const flows=incomeSchedule(s,i).sort((a,b)=>a.date.localeCompare(b.date));
    const byDeadline=flows.filter(f=>f.date<=day.date).reduce((a,f)=>a+f.amount,0);
    const ask=round(amount-byDeadline);
    if(ask<=0)continue;
    const adjustable=late && !advancePromise;
    const preview=adjustable ? collectionRates.get(i.id) : undefined;
    const defaultRate=advancePromise ? 0 : (i.recovery??0.5);
    const rate=preview===0.25 || preview===0.5 ? preview : defaultRate;
    add({id:i.id,client:i.client,adjustable,kind:late?'collect':'early',label:(advancePromise?'Request an earlier payment from ':late?'Collect from ':'Request an early deposit from ')+i.client,ask,rate,friction:advancePromise?3:late?1:2,deadline:day.date},rate=>{
      const early=round(ask*rate),changes=new Map([[day.date,early]]);
      let rest=early;
      // Remove the portion pulled forward from its old scheduled date, exactly once.
      for(const f of flows.filter(f=>f.date>day.date)){const moved=Math.min(rest,f.amount);changes.set(f.date,round((changes.get(f.date)||0)-moved));rest=round(rest-moved);}
      return changes;
    });
  }
  for(const b of s.bills.filter(b=>!b.paid && b.date<=day.date)){
    if(!b.moveDays){excluded.push(b.label+' · fixed payment');continue;}
    const newDate=addDays(b.date,b.moveDays);if(newDate<=day.date)continue;
    add({id:b.id,kind:'move',label:'Move '+b.label,ask:b.amount,rate:1,friction:2,deadline:newDate},()=>new Map([[b.date<s.date?s.date:b.date,b.amount],[newDate,-b.amount]]));
  }
  actions.sort((a,b)=>Math.min(gap,b.safeGain)-Math.min(gap,a.safeGain)||a.friction-b.friction||b.safeGain-a.safeGain||b.fullGain-a.fullGain);
  // One candidate per obligation. Prune branches whose remaining recovery cannot cover the gap.
  function choose(key){
    let best=null,bestCost=Infinity,bestRecovery=-Infinity;
    const suffix=new Array(actions.length+1).fill(0),delta=base.map(()=>0),picked=[];
    for(let n=actions.length-1;n>=0;n--)suffix[n]=round(suffix[n+1]+actions[n][key][at]);
    function search(n,cost){
      if(delta[at]>=gap && base.every((d,k)=>k<=at||round(d.close+delta[k])>=s.buffer)){
        if(cost<bestCost || (cost===bestCost && delta[at]>bestRecovery)){best=picked.slice();bestCost=cost;bestRecovery=delta[at];}
        return;
      }
      if(n===actions.length || cost>=bestCost || round(delta[at]+suffix[n])<gap)return;
      const action=actions[n];
      if(action[key][at]>0){
        picked.push(action);
        for(let k=at;k<delta.length;k++)delta[k]=round(delta[k]+action[key][k]);
        search(n+1,cost+action.friction);
        for(let k=at;k<delta.length;k++)delta[k]=round(delta[k]-action[key][k]);
        picked.pop();
      }
      search(n+1,cost);
    }
    search(0,0);return best;
  }
  const conservative=choose('safe'),cooperative=conservative?null:choose('full');
  const chosen=conservative||cooperative||actions;
  const left=Math.max(0,round(gap-chosen.reduce((a,x)=>a+(conservative?x.safeGain:x.fullGain),0)));
  return {day,gap,actions,excluded,chosen,left,mode:conservative?'conservative':cooperative?'conditional':left?'incomplete':'later-risk'};
}

export function depositQuote(s,booking) {
  const {price,buffer,finalDate,costs}=booking;
  amountValue(price); amountValue(buffer,{zero:true});
  if(!Number.isSafeInteger(price)||!validDate(finalDate)||finalDate<s.date || !costs.length)throw Error('Enter a whole-rupee price, final payment date and at least one cost.');
  for(const c of costs){amountValue(c.amount,{zero:true});if(!c.label.trim()||!validDate(c.date)||c.date<s.date)throw Error('Check each shoot cost and date.');}
  const horizon=Math.max(90,...[finalDate,...costs.map(c=>c.date)].map(d=>daysApart(s.date,d)));
  if(horizon>3660)throw Error('Choose a booking within ten years.');
  let trial={...s,bills:[...s.bills,...costs.map((c,n)=>({...c,id:'quote-'+n,moveDays:0}))]};
  trial=addInvoice(trial,{client:'Booking preview',job:'Final payment',amount:price,due:finalDate});
  const path=forecast(trial,horizon),before=path.filter(d=>d.date<finalDate),after=path.filter(d=>d.date>=finalDate);
  const low=list=>list.reduce((a,d)=>!a||d.close<a.close?d:a,null);
  const earlyLow=low(before),lateLow=low(after);
  const required=earlyLow?Math.max(0,Math.ceil(round(buffer-earlyLow.close))):0;
  const amount=Math.min(required,price),afterGap=Math.max(0,round(buffer-lateLow.close));
  const beforeGap=earlyLow?Math.max(0,round(buffer-(earlyLow.close+amount))):0;
  const driver=afterGap>beforeGap&&afterGap>0?lateLow:earlyLow;
  return {amount, remainder:price-amount, deadline:before.find(d=>d.close<buffer)?.date||null,
    uncovered:Math.max(beforeGap,afterGap),driver,horizon};
}
export function saveBooking(s,b,id){
  if(s.invoices.some(i=>i.bookingId===id))return s;
  const quote=depositQuote(s,b);if(quote.uncovered)throw Error('Resolve the uncovered balance before saving.');
  if(!b.client.trim()||!b.job.trim())throw Error('Add the client and shoot name.');
  const entry={client:b.client,job:b.job,bookingId:id};
  let next=s;
  if(quote.amount)next=addInvoice(next,{...entry,kind:'deposit',amount:quote.amount,due:quote.deadline});
  if(quote.remainder)next=addInvoice(next,{...entry,kind:'balance',amount:quote.remainder,due:b.finalDate});
  for(const [n,c] of b.costs.entries())if(c.amount)next=addBill(next,{...c,id:id+'-'+n,moveDays:0});
  return next;
}

