import {cash,daysApart,money,outstanding,round,signed} from './ledger.js';
import {evaluateOffer,offerDefaults} from './offers.js';
import {rankRescues} from './planning.js';
import {draftLinks} from './invoiceshare.js';
import {btn,e,field,input,studioHref,title} from './views.js';

const offerCalendar=new Intl.DateTimeFormat('en-IN',{weekday:'short',day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});
const dateText=date=>offerCalendar.format(new Date(date+'T12:00:00Z'));

export function offerHref(mode,id){
  const path=studioHref(mode,'rescue');
  return path+(path.includes('?')?'&':'?')+'offer='+encodeURIComponent(id);
}

export function replyFor(invoice,q){
  const fullDate=q.first===q.total?q.firstDate:q.finalDate;
  const ask=q.first===0||q.rest===0||q.firstDate===q.finalDate
    ? money(q.total)+' by '+dateText(fullDate)
    : money(q.first)+' by '+dateText(q.firstDate)+' and the remaining '+money(q.rest)+' by '+dateText(q.finalDate);
  return 'Hi '+invoice.client+', could you confirm '+ask+' for '+invoice.job+' ('+invoice.id+')? Thank you.';
}

export function offerPage(studio,id,mode){
  const invoices=studio.invoices.filter(i=>outstanding(studio,i)>0);
  const invoice=invoices.find(i=>i.id===id);
  const back='<a class="btn" data-nav href="'+studioHref(mode,'rescue')+'">Back to rescue plan</a>';
  const heading=title('CLIENT NEGOTIATION','Can I accept this offer?',back);
  if(!invoice)return heading+'<section class="panel"><h2>This invoice has no open offer</h2><a class="textlink" data-nav href="'+studioHref(mode,'invoices')+'">Choose an unpaid invoice</a></section>';
  const defaults=offerDefaults(studio,invoice);
  const opts=invoices.map(i=>'<option value="'+e(i.id)+'" '+(i===invoice?'selected':'')+'>'+e(i.client)+' · '+e(i.id)+'</option>').join('');
  return heading+'<form id="client-offer" class="offer-layout" data-form="client-offer"><section class="panel offer-inputs"><h2>Client’s offer</h2>'+
    field('Invoice','<select name="invoiceId">'+opts+'</select>')+
    '<p>Outstanding <b>'+money(outstanding(studio,invoice))+'</b> · Due '+dateText(invoice.due)+'</p>'+
    field('First payment (₹)',input('amount',defaults.amount,'number','min="0" step="0.01" max="'+outstanding(studio,invoice)+'" required'))+
    '<div class="pair">'+field('First payment date',input('firstDate',defaults.firstDate,'date','required'))+
    field('Balance payment date',input('finalDate',defaults.finalDate,'date','required'))+'</div>'+
    '<p id="offer-balance"></p></section>'+
    '<section class="panel dark offer-verdict" aria-label="Offer forecast" id="offer-verdict" aria-live="polite"></section>'+
    '<section class="panel offer-agreement"><h2 id="offer-reply-title">Reply to the client</h2><p id="offer-reply"></p><div class="actions">'+
    btn('copy-offer','Copy reply')+'<button type="submit" class="primary">Save agreed promise</button></div><div class="actions" data-offer-drafts></div>'+ 
    '<p class="offer-note" id="offer-save-note">Saving replaces this invoice’s expected payments. Record a receipt when the money arrives.</p></section></form>'+
    '<details class="panel offer-fallback" id="offer-fallback"><summary>What if this client can’t pay?</summary><div></div></details>';
}

export function updateOffer(form,studio,invoice){
  const offer=Object.fromEntries(new FormData(form));
  const verdict=form.querySelector('#offer-verdict'),balance=form.querySelector('#offer-balance'),reply=form.querySelector('#offer-reply');
  const drafts=form.querySelector('[data-offer-drafts]');
  const copy=form.querySelector('[data-action="copy-offer"]'),save=form.querySelector('button[type="submit"]');
  const replyTitle=form.querySelector('#offer-reply-title'),saveNote=form.querySelector('#offer-save-note');
  try{
    const q=evaluateOffer(studio,invoice,offer),day=q.focus;
    const safe=q.fullFailure?'No safe date in this forecast':q.lastSafe?dateText(q.lastSafe):'No deadline within this forecast';
    const minimum=q.minimum===null?'No split covers all bills':money(q.minimum);
    const details=q.splitFailure?'Even full payment on the first date leaves a shortfall on '+dateText(q.splitFailure.date)+'.':
      q.minimum===0?'The full '+money(q.total)+' can arrive by '+dateText(q.finalDate)+'.':
      q.minimum===q.total?'The full '+money(q.total)+' is needed by '+dateText(q.firstDate)+'.':
      money(q.minimum)+' by '+dateText(q.firstDate)+' and '+money(round(q.total-q.minimum))+' by '+dateText(q.finalDate)+'.';
    balance.textContent='Remaining payment '+money(q.rest)+' on '+dateText(q.finalDate)+'.';
    verdict.innerHTML='<div class="eyebrow">OFFER FORECAST</div><h2>'+(q.firstFailure?money(q.gap)+' short on '+dateText(day.date):'Bills covered')+'</h2>'+
      '<p>Projected close on '+dateText(day.date)+' <strong>'+signed(day.close)+'</strong> · buffer '+money(studio.buffer)+'</p>'+
      (day.outflows.length?'<p>'+day.outflows.map(b=>e(b.label)+' '+money(b.amount)).join(' + ')+'</p>':'')+
      '<dl><div><dt>Last safe date for full payment</dt><dd data-offer-safe>'+safe+'</dd></div>'+
      '<div><dt>Smallest first payment for these dates</dt><dd data-offer-minimum>'+minimum+'</dd></div></dl>'+
      '<p>'+details+'</p>'+(q.minimum!==null&&q.minimum!==q.first?btn('use-split','Use smallest split','data-value="'+q.minimum+'"','light'):'')+
      '<p class="offer-note">Checked through '+dateText(q.end)+' · cash on hand '+money(cash(studio))+'. Same-day receipts cover same-day bills.</p>';
    const counter=Boolean(q.firstFailure && q.minimum!==null);
    const replyTerms=counter?{...q,first:q.minimum,rest:round(q.total-q.minimum)}:q;
    replyTitle.textContent=counter?'Counteroffer to the client':'Reply to the client';
    reply.textContent=q.minimum===null?'Change the dates or check the fallback plan before proposing terms.':replyFor(invoice,replyTerms);
    saveNote.textContent=counter?'Choose Use smallest split to apply this counteroffer before saving.':
      'Saving replaces this invoice’s expected payments. Record a receipt when the money arrives.';
    drafts.innerHTML=q.minimum===null?'':draftLinks('Payment terms · '+invoice.id,reply.textContent);
    copy.disabled=q.minimum===null;save.disabled=Boolean(q.firstFailure);
  }catch(err){
    verdict.innerHTML='<h2>Check the offer</h2><p>'+e(err.message)+'</p>';
    drafts.replaceChildren();
    balance.textContent='';reply.textContent='Complete the payment terms to draft a reply.';
    replyTitle.textContent='Reply to the client';saveNote.textContent='';copy.disabled=true;save.disabled=true;
  }
}

export function showFallback(element,studio,invoice,endDate){
  const key=invoice.client.trim().toLowerCase();
  const alternative={...studio,invoices:studio.invoices.filter(i=>i.client.trim().toLowerCase()!==key)};
  const days=Math.max(90,daysApart(studio.date,endDate)||90);
  const plan=rankRescues(alternative,Math.min(days,3650));
  const text=element.querySelector('div');
  if(!plan.day){text.textContent='The bills stay covered without incoming payments from '+invoice.client+' during this forecast.';return;}
  const summary={conservative:'These actions cover the bills at the conservative amounts.',conditional:'This plan requires full cooperation.',
    incomplete:money(plan.left)+' remains uncovered even with full cooperation.','later-risk':'A later shortfall remains. Check later bills before agreeing.'};
  text.innerHTML='<p>Excluding expected payments from '+e(invoice.client)+', the gap is '+money(plan.gap)+' on '+dateText(plan.day.date)+'.</p>'+
    (plan.chosen.length?'<ul>'+plan.chosen.map(a=>'<li>'+e(a.label)+' · '+money(plan.mode==='conservative'?a.safeGain:a.fullGain)+' by the deadline</li>').join('')+'</ul>':'')+
    '<p>'+e(summary[plan.mode])+'</p>';
}
