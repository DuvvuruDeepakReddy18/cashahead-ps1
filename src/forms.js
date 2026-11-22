import {e,field,input,btn,badge,title,judgeEntry} from './views.js';
import {money,signed,paidFor,outstanding,addDays,dateText,incomeSchedule,daysApart,blankStudio} from './ledger.js';
import {depositQuote} from './planning.js';
export const amountInput=(name,value='',min='0.01')=>input(name,value,'number','required min="'+min+'" step="0.01"');
export const dateInput=(name,value)=>input(name,value,'date','required');
export function invoiceDetail(s,id){
  const i=s.invoices.find(i=>i.id===id);if(!i)throw Error('Invoice not found.');
  const due=outstanding(s,i),payments=s.receipts.filter(r=>r.invoiceId===id),flows=incomeSchedule(s,i);
  return '<div class="eyebrow">'+e(i.id)+' · '+e(i.kind)+'</div><h2>'+e(i.client)+'</h2><p>'+e(i.job)+' · due '+dateText(i.due)+'</p><div class="sheetmoney">'+money(due)+'<small> outstanding of '+money(i.amount)+'</small></div>'+
  (due?'<div class="actions">'+btn('payment','Record payment','data-id="'+e(id)+'"','primary')+btn('reminder','Draft reminder','data-id="'+e(id)+'"')+btn('promise','Record promise','data-id="'+e(id)+'"')+btn('test-offer','Test a client offer','data-id="'+e(id)+'"')+btn('preview','Preview late payment','data-id="'+e(id)+'"')+'</div>':'')+
  '<div class="actions">'+btn('invoice-pdf','Download PDF','data-id="'+e(id)+'"')+btn('share-invoice','Share invoice','data-id="'+e(id)+'"')+'</div>'+
  '<h3>Expected receipts</h3>'+(flows.length?flows.map(f=>'<div class="line"><span>'+dateText(f.date)+'</span><b>'+money(f.amount)+'</b></div>').join(''):'<p>No dated inflow.</p>')+
  '<h3>Payment history</h3>'+(payments.length?payments.map(r=>'<div class="line"><div>'+dateText(r.date)+'<small>'+e(r.bankKey?'Bank confirmed':'Manually recorded')+'</small></div><div>'+money(r.amount)+(r.amount>r.applied?'<small>'+money(r.amount-r.applied)+' unapplied</small>':'')+'</div></div>').join(''):'<p>No payments recorded yet.</p>')+
  s.reminders.filter(r=>r.id===id).map(r=>'<small>Follow-up logged '+dateText(r.date)+'</small>').join('')+btn('edit-invoice','Edit invoice','data-id="'+e(id)+'"');
}
export function invoiceForm(s,i){
  return '<h2>'+(i?'Edit invoice':'New invoice')+'</h2><form data-form="invoice" data-id="'+e(i?.id||'')+'">'+field('Client',input('client',i?.client||'','text','required'))+field('Shoot or service',input('job',i?.job||'','text','required'))+field('Invoice amount',amountInput('amount',i?.amount||''))+field('Contractual due date',dateInput('due',i?.due||s.date))+field('Earliest possible receipt (optional)',input('earliest',i?.earliest||'','date'))+field('Invoice type','<select name="kind"><option value="balance">Final balance</option><option value="deposit" '+(i?.kind==='deposit'?'selected':'')+'>Booking deposit</option></select>')+'<button class="primary">Save invoice</button></form>';
}
export function billForm(s,b){
  return '<h2>'+(b?'Edit bill':'New bill')+'</h2><form data-form="bill" data-id="'+e(b?.id||'')+'">'+field('Bill name',input('label',b?.label||'','text','required'))+field('Bill amount',amountInput('amount',b?.amount||''))+field('Bill due date',dateInput('date',b?.date||s.date))+field('Days vendor may allow for deferral',input('moveDays',b?.moveDays||0,'number','min="0" max="365" step="1" required'))+'<p>Use 0 for a fixed payment such as crew wages.</p><button class="primary">Save bill</button></form>';
}
export function paymentForm(s,id){
  const i=s.invoices.find(i=>i.id===id);
  return '<h2>Record payment</h2><p>'+e(id)+' · '+e(i.client)+' · '+money(outstanding(s,i))+' outstanding</p><form data-form="payment" data-id="'+e(id)+'" data-token="'+crypto.randomUUID()+'">'+field('Amount received',amountInput('amount'))+field('Received date',input('date',s.date,'date','required max="'+s.date+'"'))+field('Bank reference (optional)',input('reference'))+'<button class="primary">Confirm payment</button></form>';
}
export function previewForm(s,id){
  const open=s.invoices.filter(i=>outstanding(s,i)>0);
  if(!open.length)return '<h2>Late payment preview</h2><p>Create an open invoice first.</p>'+btn('new-invoice','New invoice');
  const i=open.find(i=>i.id===id)||open.filter(i=>i.due>=s.date&&i.kind!=='deposit').sort((a,b)=>a.due.localeCompare(b.due))[0]||open[0];
  return '<h2>Late payment preview</h2><form data-form="preview">'+field('Invoice','<select name="invoiceId">'+open.map(row=>'<option value="'+e(row.id)+'" '+(row.id===i.id?'selected':'')+'>'+e(row.id)+' · '+e(row.client)+'</option>').join('')+'</select>')+field('Days after contractual due date',input('delay',15,'number','step="1" min="0" max="3650" required'))+'<div class="result" id="scenario-result"></div><div class="actions"><button class="primary">Confirm expected date</button>'+btn('close','Cancel preview')+'</div></form>';
}
export const bookingTemplate=s=>({client:'',job:'Wedding shoot',price:30000,buffer:s.buffer,finalDate:addDays(s.date,14),costs:[{label:'Shoot costs',amount:10000,date:addDays(s.date,4)}]});
export function bookingPage(s,example,b){
  const costRows=b.costs.map((c,n)=>'<div class="costrow">'+field('Cost '+(n+1),input('costLabel',c.label,'text','required'))+field('Cost amount',amountInput('costAmount',c.amount,'0'))+field('Cost date',dateInput('costDate',c.date))+(b.costs.length>1?btn('remove-cost','Remove','data-index="'+n+'"','textlink'):'')+'</div>').join('');
  return title('BOOKING PREVIEW','What deposit should I ask for?')+'<div class="twocol booking"><form id="booking" class="panel" data-form="booking"><div class="panelhead"><h2>Booking details</h2>'+btn('example',example?'Use my studio':'Try worked example','','textlink')+'</div><p>'+ (example?'Independent example · ₹6,000 available · no existing commitments.':'Uses your current studio cash and existing commitments.')+'</p>'+field('Client',input('client',b.client))+field('Shoot',input('job',b.job))+'<div class="pair">'+field('Booking price',amountInput('price',b.price))+field('Desired buffer',amountInput('buffer',b.buffer,'0'))+'</div>'+field('Final payment date',dateInput('finalDate',b.finalDate))+'<h3>Dated shoot costs</h3>'+costRows+btn('add-cost','+ Add cost','','textlink')+(example?'':'<div class="actions"><button class="primary">Save booking</button></div>')+'</form><section class="panel dark quote" id="deposit-result" aria-live="polite"></section></div>';
}
export function quoteHtml(s,example,b){
  let studio=s;if(example)studio={...blankStudio(s.date),opening:6000};
  const q=depositQuote(studio,b);
  return '<div class="eyebrow">MINIMUM BOOKING DEPOSIT</div><div class="bignum" data-stat="deposit">'+money(q.amount)+'</div><p>'+(q.uncovered?money(q.uncovered)+' still uncovered even at the best deposit.':q.deadline?'Receive by '+dateText(q.deadline)+'.':'No advance required for this buffer.')+'</p><div class="line"><span>Final balance</span><b>'+money(q.remainder)+'</b></div><div class="line"><span>Cash buffer</span><b>'+money(b.buffer)+'</b></div><p>'+ (q.driver?'Lowest relevant day · '+dateText(q.driver.date)+' · '+e(q.driver.outflows.map(o=>o.label).join(', ')||'existing commitments')+'. ':'')+'Receipts are available for bills on the same day. Uses daily closing cash over '+q.horizon+' days.</p>';
}
export function settings(s,mode){
  if(mode==='judge')return title('JUDGE DEMO','Studio settings')+
    '<section class="panel"><h2>Friday shortfall scenario</h2><p>This tab keeps your demo payments and reminders until you restart the scenario.</p><div class="actions"><a class="primary" data-nav href="'+judgeEntry+'">Restart judge demo</a><a class="btn" data-nav href="/app">Open sample studio</a></div></section>';
  return title('WORKSPACE','Studio settings')+'<section class="panel"><form data-form="settings">'+field('Studio name',input('name',s.name,'text','required'))+'<div class="pair">'+field('Opening cash',amountInput('opening',s.opening,'0'))+field('Safety buffer',amountInput('buffer',s.buffer,'0'))+'</div><button class="primary">Save settings</button></form></section><section class="panel"><h2>'+(mode==='sample'?'Sample studio':'My studio')+'</h2><p>'+(mode==='sample'?'The sample clock starts Monday, 23 November 2026. Reset restores Ananya’s invoices, bills and payments.':'Your studio uses today’s local date and saves in this browser.')+'</p><div class="actions">'+(mode==='sample'?btn('reset','Reset sample studio'):'')+'<a data-nav class="btn" href="'+(mode==='sample'?'/mine':'/app')+'">'+(mode==='sample'?'Open my studio':'Open sample studio')+'</a></div></section>';
}
