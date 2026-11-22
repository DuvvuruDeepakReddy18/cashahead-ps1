import {sampleStudio,addDays,daysApart,validDate,cash,money,signed,dateText,outstanding,paidFor,addInvoice,addBill,receipt,promise,forecast,amountValue} from './ledger.js';
import {invoiceStatement,reminderMessage} from './clientinvoice.js';
import {downloadFile,invoiceFile} from './invoicepdf.js';
import {draftLinks,showInvoiceShare} from './invoiceshare.js';
import {read,update,restartJudgeDemo} from './storage.js';
import {parseStatement,sampleCSV,review,confirmBank} from './bank.js';
import {saveBooking} from './planning.js';
import {evaluateOffer,saveOffer} from './offers.js';
import {offerHref,offerPage,showFallback,updateOffer} from './offerui.js';
import {e,btn,field,input,badge,title,shell,studioHref,overview,invoiceTable,forecastView,rescueView,bankView,friday,tabs} from './views.js';
import {invoiceDetail,invoiceForm,billForm,paymentForm,previewForm,bookingPage,bookingTemplate,quoteHtml,dateInput,amountInput,settings} from './forms.js';

const app=document.querySelector('#app'),panel=document.querySelector('#panel'),notice=document.querySelector('#notice');
let mode='sample',view='home',s,range=30,filter='all',parsed=null,example=false,booking=null,bookingToken='',timer;
// Collection percentages are a preview scoped to the current visit to the rescue screen.
const collectionRates=new Map();
const studioPage=view=>studioHref(mode,view);
const offerId=()=>view==='rescue'?new URLSearchParams(location.search).get('offer'):null;
const byId=id=>s.invoices.find(i=>i.id===id);
function tell(message){
  notice.textContent=message;notice.classList.add('show');clearTimeout(timer);timer=setTimeout(()=>notice.classList.remove('show'),4800);
}
function open(html){
  panel.innerHTML='<div class="dialogbody"><button type="button" data-action="close" class="close" aria-label="Close dialog">×</button>'+html+'<p class="form-error" role="alert"></p></div>';
  const h=panel.querySelector('h2');if(h){h.id='dialog-title';panel.setAttribute('aria-labelledby',h.id);}
  if(!panel.open)panel.showModal();
}
function close(){if(panel.open)panel.close();}
function fail(err){const text=err?.message||'Could not complete the action.';const error=panel.open&&panel.querySelector('.form-error');if(error)error.textContent=text;else tell(text);}
function go(url){history.pushState({},'',url);route();window.scrollTo(0,0);}
function route(){
  collectionRates.clear();
  close();
  const isJudge=new URLSearchParams(location.search).get('demo')==='friday';
  const launching=isJudge && location.pathname==='/';
  if(launching){
    restartJudgeDemo();
    const requestedOffer=new URLSearchParams(location.search).get('offer');
    history.replaceState({},'',requestedOffer?offerHref('judge',requestedOffer):studioHref('judge','rescue'));
  }
  const path=location.pathname.split('/').filter(Boolean);
  if(!path.length){location.reload();return;}
  const nextMode=path[0]==='mine'?'own':isJudge?'judge':'sample';
  if(launching || nextMode!==mode){parsed=null;booking=null;example=false;filter='all';range=30;}
  mode=nextMode;view=tabs.some(t=>t[0]===path[1])?path[1]:'home';s=read(mode);render();
}
function render(){
  let html;
  switch(view){
    case 'invoices':{
      const rows=s.invoices.filter(i=>filter==='all'||(filter==='overdue'?i.due<s.date&&outstanding(s,i)>0:outstanding(s,i)===0));
      html=title('MONEY IN','Invoices',btn('new-invoice','+ New invoice','','primary'))+'<section class="panel"><div class="panelhead"><h2>Receivables</h2><div class="segments">'+['all','overdue','paid'].map(k=>btn('filter',k[0].toUpperCase()+k.slice(1),'data-value="'+k+'" aria-pressed="'+(k===filter)+'"','')).join('')+'</div></div>'+invoiceTable(s,rows)+'</section>';break;
    }
    case 'bills':html=title('MONEY OUT','Studio bills',btn('new-bill','+ New bill','','primary'))+'<section class="panel"><h2>Payment schedule</h2>'+s.bills.slice().sort((a,b)=>a.date.localeCompare(b.date)).map(b=>'<div class="choice"><div><h3>'+e(b.label)+'</h3><p>'+dateText(b.date)+' · '+money(b.amount)+' · '+(b.paid?'Paid':b.moveDays?'Movable up to '+b.moveDays+' days':'Fixed date')+'</p></div><div class="actions">'+(!b.paid?btn('edit-bill','Edit','data-id="'+e(b.id)+'"')+btn('pay-bill','Mark paid','data-id="'+e(b.id)+'"'):'')+'</div></div>').join('')+(s.bills.length?'':'<p>Add a crew, rental or studio bill.</p>')+'</section>';break;
    case 'forecast':html=forecastView(s,range,null);break;
    case 'rescue':html=offerId()?offerPage(s,offerId(),mode):rescueView(s,range,collectionRates,mode==='judge');break;
    case 'bank':html=bankView(s,parsed,mode==='judge');break;
    case 'deposit':if(!booking){booking=bookingTemplate(s);bookingToken=crypto.randomUUID();}html=bookingPage(s,example,booking);break;
    case 'settings':html=settings(s,mode);break;
    default:html=overview(s,mode);
  }
  app.innerHTML=shell(s,mode,view,html);document.title=(tabs.find(t=>t[0]===view)?.[1]||'Studio')+' · CashAhead';
  const offerForm=document.querySelector('#client-offer');
  if(offerForm){
    document.title='Client offer · CashAhead';
    updateOffer(offerForm,s,byId(offerId()));
    const fallback=document.querySelector('#offer-fallback');
    fallback.addEventListener('toggle',()=>{
      if(fallback.open)showFallback(fallback,s,byId(offerId()),offerForm.elements.finalDate.value);
    });
  }
  if(view==='deposit')updateQuote();
  if(view==='bank')document.querySelectorAll('[data-form="bank"]').forEach(allocation);
}
function formValues(form){return Object.fromEntries(new FormData(form));}
function readBooking(){
  const form=document.querySelector('#booking'),data=new FormData(form);
  return {client:data.get('client'),job:data.get('job'),price:Number(data.get('price')),buffer:Number(data.get('buffer')),finalDate:data.get('finalDate'),
    costs:data.getAll('costLabel').map((label,n)=>({label,amount:Number(data.getAll('costAmount')[n]),date:data.getAll('costDate')[n]}))};
}
function updateQuote(){booking=readBooking();const box=document.querySelector('#deposit-result');try{box.innerHTML=quoteHtml(s,example,booking);}catch(err){box.textContent=err.message;}}
function allocation(form){
  const row=parsed.rows[Number(form.dataset.index)],choice=form.elements.selection.value,inv=byId(choice);
  form.querySelector('button[type="submit"]').disabled=!choice;
  form.querySelector('.allocation').textContent=inv?money(row.amount)+' received · '+money(Math.max(0,outstanding(s,inv)-row.amount))+' still due'+(row.amount>outstanding(s,inv)?' · '+money(row.amount-outstanding(s,inv))+' unapplied':''):choice.startsWith('link:')?'Links this bank row to an existing receipt. Cash stays the same.':choice==='ignore'?'Skip this credit in future imports.':'Select a match to see the remaining balance.';
}
function previewValues(form){
  const {invoiceId,delay}=formValues(form),i=byId(invoiceId),days=Number(delay);
  if(delay===''||!Number.isInteger(days)||days<0||days>3650)throw Error('Choose a delay between 0 and 3,650 days.');
  const date=addDays(i.due,days);if(date<s.date)throw Error('Choose an expected date on or after today.');
  const trial=promise(s,i.id,outstanding(s,i),date);return {id:i.id,date,trial};
}
function updatePreview(form){
  const box=form.querySelector('#scenario-result');try{
    const {date,trial}=previewValues(form),n=friday(s);const a=forecast(s,range)[n],b=forecast(trial,range)[n];
    box.innerHTML='<small>FRIDAY CLOSING BALANCE</small><strong>'+signed(a.close)+' → '+signed(b.close)+'</strong><p>Expected '+dateText(date)+' · '+e(b.outflows.map(x=>x.label+' '+money(x.amount)).join(' + '))+'</p>';
  }catch(err){box.textContent=err.message;}
}
function editPromise(id){const i=byId(id);open('<h2>Record a promise</h2><p>'+e(i.client)+' · '+money(outstanding(s,i))+' outstanding</p><form data-form="promise" data-id="'+e(id)+'">'+field('Promised amount',amountInput('amount',outstanding(s,i)))+field('Promised date',dateInput('date',addDays(s.date,1)))+'<button class="primary">Save promise</button></form>');}
function draft(id,date,ask){
  const model=invoiceStatement(s,byId(id));
  const msg=reminderMessage(model,date,ask);
  open('<h2>Reminder draft</h2><p>'+e(id)+' · cash on hand '+money(cash(s))+'</p><form data-form="reminder" data-id="'+e(id)+'">'+field('Message','<textarea name="text" rows="5" required>'+e(msg)+'</textarea>')+
    '<div class="actions" data-drafts>'+draftLinks('Payment reminder · '+id,msg)+'</div><div class="actions">'+btn('copy','Copy reminder')+'<button class="primary">Mark followed up</button></div></form>');
}
async function persist(fn){s=await update(mode,fn);render();}
window.addEventListener('popstate',route);
window.addEventListener('storage',event=>{if(event.key==='cashahead.studio.v1.'+mode && location.pathname!=='/'){s=read(mode);close();render();}});
document.addEventListener('input',ev=>{
  const f=ev.target.closest('form');if(f?.id==='booking') updateQuote();
  if(f?.id==='client-offer' && ev.target.name!=='invoiceId'){
    updateOffer(f,s,byId(offerId()));
    const fallback=document.querySelector('#offer-fallback');
    if(fallback.open && ev.target.name==='finalDate')showFallback(fallback,s,byId(offerId()),f.elements.finalDate.value);
  }
  if(f?.dataset.form==='reminder')f.querySelector('[data-drafts]').innerHTML=draftLinks('Payment reminder · '+f.dataset.id,f.elements.text.value);
  if(f?.dataset.form==='preview')updatePreview(f);
  if(f?.dataset.form==='bank')allocation(f);
});
document.addEventListener('change',async ev=>{
  if(ev.target.form?.id==='client-offer' && ev.target.name==='invoiceId'){
    history.replaceState({},'',offerHref(mode,ev.target.value));route();return;
  }
  if(ev.target.id!=='csv'||!ev.target.files.length)return;
  try{const file=ev.target.files[0];if(file.size>5_000_000)throw Error('Choose a CSV smaller than 5 MB.');parsed=parseStatement(await file.text());render();}catch(err){fail(err);}
});
document.addEventListener('click',async ev=>{
  const link=ev.target.closest('a[data-nav]');if(link&&!ev.ctrlKey&&!ev.metaKey){ev.preventDefault();go(link.pathname+link.search+link.hash);return;}
  const el=ev.target.closest('button[data-action]');if(!el)return;
  const {action,id,value}=el.dataset;
  try{
    switch(action){
      case 'close':close();break;
      case 'range':range=Number(value);render();break;
      case 'test-offer':go(offerHref(mode,id));break;
      case 'use-split':{
        const f=el.closest('form');
        f.elements.amount.value=value;
        updateOffer(f,s,byId(offerId()));f.elements.amount.focus({preventScroll:true});break;
      }
      case 'copy-offer':await navigator.clipboard.writeText(document.querySelector('#offer-reply').textContent);tell('Reply copied.');break;
      case 'collection-rate':{
        const rate=Number(value);
        if(rate!==0.25 && rate!==0.5)break;
        collectionRates.set(id,rate);
        render();
        const selected=app.querySelector('[data-action="collection-rate"][data-id="'+CSS.escape(id)+'"][aria-pressed="true"]');
        selected?.focus({preventScroll:true});
        const recommendation=app.querySelector('[data-rescue-recommendation]')?.textContent;
        if(recommendation)tell(recommendation);
        break;
      }
      case 'filter':filter=value;render();break;
      case 'invoice':open(invoiceDetail(s,id));break;
      case 'share-invoice':showInvoiceShare(invoiceStatement(s,byId(id)),open,panel);break;
      case 'invoice-pdf':{
        el.disabled=true;
        try{downloadFile(await invoiceFile(invoiceStatement(s,byId(id))));}
        finally{el.disabled=false;}
        break;
      }
      case 'new-invoice':open(invoiceForm(s));break;
      case 'edit-invoice':open(invoiceForm(s,byId(id)));break;
      case 'new-bill':open(billForm(s));break;
      case 'edit-bill':open(billForm(s,s.bills.find(b=>b.id===id)));break;
      case 'pay-bill':open('<h2>Confirm bill payment</h2><p>'+e(s.bills.find(b=>b.id===id).label)+' · '+money(s.bills.find(b=>b.id===id).amount)+'</p><form data-form="pay-bill" data-id="'+e(id)+'"><button class="primary">Confirm paid</button></form>');break;
      case 'move-bill':open('<h2>Confirm vendor agreement</h2><p>Change the saved due date only after the vendor agrees.</p><form data-form="move-bill" data-id="'+e(id)+'">'+field('Agreed date',dateInput('date',el.dataset.date))+'<button class="primary">Confirm vendor agreement</button></form>');break;
      case 'payment':open(paymentForm(s,id));break;
      case 'promise':editPromise(id);break;
      case 'preview':open(previewForm(s,id));if(panel.querySelector('form'))updatePreview(panel.querySelector('form'));break;
      case 'reminder':draft(id,el.dataset.date,Number(el.dataset.amount));break;
      case 'copy':await navigator.clipboard.writeText(panel.querySelector('textarea').value);tell('Reminder copied.');break;
      case 'day':{const day=forecast(s,range).find(d=>d.date===id);open('<h2>'+dateText(id)+'</h2>'+day.inflows.map(f=>'<div class="line"><span>'+e(f.label)+'</span><b>+'+money(f.amount)+'</b></div>').join('')+day.outflows.map(f=>'<div class="line"><span>'+e(f.label)+'</span><b>−'+money(f.amount)+'</b></div>').join('')+'<p>Closing cash <b>'+signed(day.close)+'</b></p>');break;}
      case 'go-rescue':go(studioPage('rescue'));break;
      case 'download':{const url=URL.createObjectURL(new Blob([sampleCSV(s)],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='CashAhead-sample-statement.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);break;}
      case 'example':example=!example;booking=bookingTemplate(s);bookingToken=crypto.randomUUID();if(example)booking.buffer=3000;render();break;
      case 'add-cost':booking=readBooking();booking.costs.push({label:'Rental',amount:0,date:addDays(s.date,4)});render();break;
      case 'remove-cost':booking=readBooking();booking.costs.splice(Number(el.dataset.index),1);render();break;
      case 'reset':open('<h2>Reset sample studio?</h2><p>This restores Ananya’s sample invoices and receipts. Your personal studio has separate storage.</p><form data-form="reset"><button class="primary">Restore sample</button></form>');break;
    }
  }catch(err){fail(err);}
});
document.addEventListener('submit',async ev=>{
  const form=ev.target;if(!form.dataset.form)return;
  ev.preventDefault();const data=formValues(form),id=form.dataset.id,type=form.dataset.form,submit=ev.submitter;
  if(submit)submit.disabled=true;
  try{
    let message='Saved.';
    if(type==='invoice'){
      const entry={client:data.client,job:data.job,due:data.due,amount:Number(data.amount),kind:data.kind,earliest:data.earliest||''};
      await persist(t=>{
        if(!id)return addInvoice(t,entry);
        const current=t.invoices.find(i=>i.id===id);
        if(!current||!entry.client.trim()||!entry.job.trim()||!validDate(entry.due)||amountValue(entry.amount)<paidFor(t,id))throw Error('Invoice amount must cover all confirmed allocations.');
        return {...t,invoices:t.invoices.map(i=>i.id===id?{...i,...entry}:i)};
      });
    }else if(type==='client-offer'){
      const invoice=byId(data.invoiceId);
      const balance=outstanding(s,invoice),prior=JSON.stringify(invoice.promise);
      await persist(t=>{
        const next=saveOffer(t,data.invoiceId,data,balance,prior);
        const current=t.invoices.find(i=>i.id===data.invoiceId);
        if(evaluateOffer(t,current,data).firstFailure)throw Error('These terms leave a shortfall. Check the offer before saving.');
        return next;
      });
      const current=document.querySelector('#client-offer');
      if(current){
        for(const field of ['amount','firstDate','finalDate'])current.elements[field].value=data[field];
        updateOffer(current,s,byId(data.invoiceId));
      }
      message='Agreed promise saved. Cash on hand '+money(cash(s))+'.';
    }else if(type==='bill'){
      const b={id:id||crypto.randomUUID(),label:data.label,amount:Number(data.amount),date:data.date,moveDays:Number(data.moveDays)};
      await persist(t=>addBill({...t,bills:t.bills.filter(x=>x.id!==b.id)},b));
    }else if(type==='pay-bill'){await persist(t=>({...t,bills:t.bills.map(b=>b.id===id?{...b,paid:true}:b)}));}
    else if(type==='move-bill'){await persist(t=>{const b=t.bills.find(b=>b.id===id);if(!b||!b.moveDays||data.date<=b.date||data.date>addDays(b.date,b.moveDays))throw Error('Choose a date within the permitted deferral.');return {...t,bills:t.bills.map(x=>x.id===id?{...x,date:data.date,moveDays:0}:x)};});}
    else if(type==='payment'){await persist(t=>receipt(t,{id:form.dataset.token,invoiceId:id,amount:Number(data.amount),date:data.date,reference:data.reference.trim()}));message='Payment recorded.';}
    else if(type==='promise'){await persist(t=>promise(t,id,Number(data.amount),data.date));}
    else if(type==='preview'){const p=previewValues(form);await persist(t=>{const i=t.invoices.find(i=>i.id===p.id);return promise(t,p.id,outstanding(t,i),p.date,'forecast');});message='Revised expected date saved.';}
    else if(type==='reminder'){await persist(t=>({...t,reminders:[...t.reminders,{id,date:t.date,text:data.text}]}));message='Follow-up logged.';}
    else if(type==='bank'){const row=parsed.rows[Number(form.dataset.index)];await persist(t=>confirmBank(t,row,data.selection));message='Bank review saved.';}
    else if(type==='booking'){const b=readBooking();await persist(t=>saveBooking(t,b,bookingToken));booking=null;example=false;go(studioPage('invoices'));message='Booking invoices and bills saved.';}
    else if(type==='settings'){if(!data.name.trim())throw Error('Enter a studio name.');await persist(t=>({...t,name:data.name.trim(),opening:amountValue(data.opening,{zero:true}),buffer:amountValue(data.buffer,{zero:true})}));}
    else if(type==='reset'){if(mode!=='sample')throw Error('Select the sample studio first.');await persist(()=>sampleStudio());parsed=null;booking=null;example=false;filter='all';range=30;go('/app');message='Sample restored.';}
    close();tell(message);
  }catch(err){fail(err);}finally{if(submit)submit.disabled=false;}
});
try{route();}catch(err){app.textContent='Could not open this studio. '+err.message;}
