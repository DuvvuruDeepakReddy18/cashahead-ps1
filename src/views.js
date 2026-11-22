import {cash,forecast,paidFor,outstanding,money,signed,dateText,daysApart,addDays,incomeSchedule} from './ledger.js';
import {rankRescues} from './planning.js';
import {review} from './bank.js';
import {extraDemoStatements} from './demofiles.js';
export const e=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const paths={home:'M3 11 12 3l9 8 M5 10v11h5v-7h4v7h5V10',invoices:'M5 3h14v18l-3-2-4 2-4-2-3 2z M8 8h8 M8 12h6',forecast:'M3 3v17h18 M6 15l4-5 4 2 6-7',rescue:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18 M8 5l2 4m4 6 2 4m3-11-4 2m-6 4-4 2 M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6',bank:'m3 8 9-5 9 5z M5 11v7m5-7v7m4-7v7m5-7v7 M3 21h18',deposit:'M5 3h14v18H5z M8 7h8 M8 11h2m4 0h2m-8 4h2m4 0h2',bills:'M4 7h16v12H4z M8 7V4h8v3 M4 12h16',settings:'M3 7h18M3 17h18 M8 4v6m8 4v6',arrow:'M5 12h14m-6-6 6 6-6 6',plus:'M12 5v14M5 12h14',lens:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18 M5 15l5-7 4 4 6-7',chev:'m8 5 7 7-7 7'};
export const icon=(id,size=18)=>'<svg aria-hidden="true" width="'+size+'" height="'+size+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round"><path d="'+paths[id]+'"/></svg>';
export const brand=()=>'<a class="brand" href="/" aria-label="CashAhead home"><img src="/mark.svg" width="34" height="34" alt="">CashAhead</a>';
export const btn=(action,label,attrs='',cls='btn')=>'<button type="button" class="'+cls+'" data-action="'+action+'" '+attrs+'>'+label+'</button>';
let labelSequence=0;
export function field(label,control){
  const id='field-label-'+(++labelSequence);
  const named=control.replace(/^<(input|select|textarea)\b/,'<$1 aria-labelledby="'+id+'"');
  return '<label class="field"><span id="'+id+'">'+label+'</span>'+named+'</label>';
}
export const input=(name,value='',type='text',extra='')=>'<input name="'+name+'" type="'+type+'" value="'+e(value)+'" '+extra+'>';
export const badge=(s,style='')=>'<span class="tag '+style+'">'+e(s)+'</span>';
export const title=(k,h,a='')=>'<div class="pagehead"><div><div class="eyebrow">'+e(k)+'</div><h1>'+e(h)+'</h1></div>'+a+'</div>';
export const tabs=[['home','Overview'],['invoices','Invoices'],['bills','Bills'],['forecast','Forecast'],['rescue','Rescue plan'],['bank','Bank import'],['deposit','Booking deposit'],['settings','Studio settings']];
export const judgeEntry='/?demo=friday';
export function studioHref(mode,view='home'){
  const path=mode==='own'?'/mine':'/app';
  return path+(view==='home'?'':'/'+view)+(mode==='judge'?'?demo=friday':'');
}
export function shell(s,mode,view,content){
  const nav=tabs.map(([k,label])=>'<a href="'+studioHref(mode,k)+'" data-nav class="'+(k===view?'active':'')+'" '+(k===view?'aria-current="page"':'')+'>'+icon(k)+label+'</a>').join('');
  const crew=({home:'jot',invoices:'jot',bills:'scout',forecast:'scout',rescue:'mend',bank:'dock',deposit:'mend',settings:'jot'})[view];
  return '<div class="shell" data-crew="'+crew+'"><aside>'+brand()+'<div class="navcap">WORKSPACE</div><nav>'+nav+'</nav><div class="identity"><b>'+e(s.name.slice(0,1))+'</b><div>'+e(s.name)+'<small>'+ (mode==='own'?'Personal workspace':mode==='judge'?'Vijayawada · Judge demo':'Vijayawada · Sample studio')+'</small></div></div></aside><div class="work"><header class="topbar"><span>Studio workspace <i>/</i> '+e(tabs.find(t=>t[0]===view)?.[1]||'Overview')+'</span><span class="clock"><i></i>'+e(dateText(s.date))+(mode==='own'?'':' · Sample clock')+'</span></header><article>'+content+'</article></div></div>';
}
export function chart(path,buffer=0,compare=null){
  const w=720,h=188,m={l:54,r:12,t:18,b:32},all=[0,buffer,...path.map(d=>d.close),...(compare||[]).map(d=>d.close)];
  const min=Math.min(...all),max=Math.max(...all,min+1000),x=n=>m.l+n*(w-m.l-m.r)/Math.max(1,path.length-1),y=v=>m.t+(max-v)/(max-min)*(h-m.t-m.b);
  const p=arr=>arr.map((d,n)=>(n?'L':'M')+x(n).toFixed(1)+' '+y(d.close).toFixed(1)).join(' ');
  const grid=[...new Set([min,buffer,max])].map(v=>'<line x1="'+m.l+'" x2="'+(w-m.r)+'" y1="'+y(v)+'" y2="'+y(v)+'"/><text x="'+(m.l-7)+'" y="'+(y(v)+4)+'" text-anchor="end">'+e(money(v))+'</text>').join('');
  const ticks=[0,Math.floor((path.length-1)/2),path.length-1].map((n,i)=>'<text x="'+x(n)+'" y="181" text-anchor="'+['start','middle','end'][i]+'">'+e(dateText(path[n].date))+'</text>').join('');
  return '<svg class="chart" role="img" aria-label="Daily projected closing cash" viewBox="0 0 '+w+' '+h+'"><g class="gridlines">'+grid+ticks+'</g><path class="area" d="'+p(path)+' L'+x(path.length-1)+' '+(h-m.b)+' L'+m.l+' '+(h-m.b)+' Z"/><path class="series" d="'+p(path)+'"/>'+(compare?'<path class="scenario" d="'+p(compare)+'"/>':'')+'</svg>';
}
export const friday=s=>{const day=new Date(s.date+'T00:00:00Z').getUTCDay();return (5-day+7)%7;};
export function metrics(s,path,overdue){
  const owed=s.invoices.reduce((a,i)=>a+outstanding(s,i),0),late=overdue.reduce((sum,row)=>sum+row.balance,0);
  const cards=[['Cash received & on hand',money(cash(s)),'Current cash','cash'],['Friday closing balance',signed(path[friday(s)].close),dateText(path[friday(s)].date),'friday'],['Outstanding invoices',money(owed),money(late)+' overdue','outstanding']];
  return '<div class="metrics">'+cards.map(([label,v,detail,id])=>'<div><small>'+label+'</small><strong data-stat="'+id+'">'+v+'</strong><span>'+detail+'</span></div>').join('')+'</div>';
}
export function invoiceTable(s,invoices){
  return invoices.length?'<div class="scroll"><table><thead><tr><th>Client / shoot</th><th>Invoice</th><th>Due</th><th>Status</th><th class="num">Outstanding</th></tr></thead><tbody>'+invoices.map(i=>{
    const owed=outstanding(s,i),late=daysApart(i.due,s.date);
    const status=!owed?'Paid':paidFor(s,i.id)?'Part-paid':late>0?'Overdue':'Open';
    return '<tr><td><button class="rowlink" data-action="invoice" data-id="'+e(i.id)+'">'+e(i.client)+'</button><small>'+e(i.job)+'</small></td><td>'+e(i.id)+'</td><td>'+e(dateText(i.due))+(late>0&&owed?'<small>'+late+' days late</small>':'')+'</td><td>'+badge(status,owed&&late>0?'amber':'')+'</td><td class="num">'+money(owed)+'</td></tr>';
  }).join('')+'</tbody></table></div>':'<p class="empty">No invoices in this view.</p>';
}
function overduePanel(s,overdue,mode){
  const rows=overdue.map(({invoice,balance})=>{
    const age=daysApart(invoice.due,s.date);
    return '<li><div><h3>'+e(invoice.client)+'</h3><p>'+e(invoice.id)+' · Due <time datetime="'+e(invoice.due)+'">'+
      e(dateText(invoice.due))+'</time> · '+age+(age===1?' day late':' days late')+'</p></div>'+
      '<strong class="num">'+money(balance)+'</strong>'+
      btn('reminder','Draft reminder','data-id="'+e(invoice.id)+'"')+'</li>';
  }).join('');
  return '<section class="panel" aria-labelledby="overdue-heading"><div class="panelhead"><h2 id="overdue-heading">Overdue invoices</h2>'+
    '<a class="textlink" data-nav href="'+studioHref(mode,'invoices')+'">View all invoices</a></div>'+
    (rows?'<ul class="overdue-list">'+rows+'</ul>':'<p>No overdue invoices.</p>')+'</section>';
}
export function overview(s,mode){
  const overdue=s.invoices.filter(invoice=>invoice.due<s.date)
    .map(invoice=>({invoice,balance:outstanding(s,invoice)}))
    .filter(row=>row.balance>0)
    .sort((a,b)=>a.invoice.due.localeCompare(b.invoice.due)||a.invoice.id.localeCompare(b.invoice.id));
  const path=forecast(s,30),plan=rankRescues(s,30),next=path.find(d=>d.outflows.length),action=plan.day?'Review rescue plan':'Try a late payment';
  return title('STUDIO OVERVIEW',s.name,btn('new-invoice',icon('plus')+' New invoice','','primary'))+metrics(s,path,overdue)+overduePanel(s,overdue,mode)+
  '<section class="panel"><div class="panelhead"><div><div class="eyebrow">NEXT 30 DAYS</div><h2>Cash forecast</h2></div><a data-nav class="textlink" href="'+studioHref(mode,'forecast')+'">Open forecast ↗</a></div>'+chart(path,s.buffer)+'</section>'+
  '<div class="twocol"><section class="panel dark"><div class="eyebrow">NEXT ACTION</div><h2>'+(plan.day?money(plan.gap)+' short on '+dateText(plan.day.date):'Check your next shoot')+'</h2><p>'+e(plan.day?(plan.chosen[0]?.label||'Review the bills due'):'Preview a late client payment and see which bills it affects.')+'</p>'+btn(plan.day?'go-rescue':'preview',action+' →','','light')+'</section><section class="panel"><div class="eyebrow">UPCOMING BILLS</div><h2>'+(next?dateText(next.date):'No bills due')+'</h2>'+ (next?next.outflows.map(x=>'<div class="line"><span>'+e(x.label)+'</span><b>'+money(x.amount)+'</b></div>').join(''):'<p>Add studio costs to see them here.</p>')+'</section></div>';
}
export function forecastView(s,horizon,trial){
  const path=forecast(s,horizon),alt=trial?forecast(trial,horizon):null;
  return title('CASH POSITION','Forecast',btn('preview','What if a client pays late?','','primary'))+
  '<section class="panel"><div class="panelhead"><div><div class="eyebrow">PROJECTED CLOSING CASH</div><h2>'+signed((alt||path)[friday(s)].close)+' on Friday</h2></div><div class="segments">'+[30,60,90].map(n=>btn('range',n+'d','data-value="'+n+'" aria-pressed="'+(n===horizon)+'"','')).join('')+'</div></div>'+chart(path,s.buffer,alt)+(trial?'<p>Solid line · saved forecast &nbsp; / &nbsp; Dashed line · preview</p>':'')+'</section>'+
  '<section class="panel"><h2>Day breakdown</h2><div class="scroll"><table><thead><tr><th>Date</th><th>Money in</th><th>Money out</th><th class="num">Closing cash</th></tr></thead><tbody>'+(alt||path).filter((d,n)=>n===0||n===friday(s)||d.inflows.length||d.outflows.length).map(d=>'<tr><td>'+btn('day',e(dateText(d.date)),'data-id="'+d.date+'"','rowlink')+'</td><td>'+money(d.inflows.reduce((a,f)=>a+f.amount,0))+'</td><td>'+money(d.outflows.reduce((a,f)=>a+f.amount,0))+'</td><td class="num">'+signed(d.close)+'</td></tr>').join('')+'</tbody></table></div></section>';
}
function collectionPreview(plan){
  const collections=plan.actions.filter(action=>action.adjustable)
    .sort((a,b)=>a.id.localeCompare(b.id,undefined,{numeric:true}));
  if(!collections.length)return '';
  const rows=collections.map(action=>{
    const name=e(action.client),id=e(action.id);
    const controls=[0.25,0.5].map(rate=>btn('collection-rate',rate*100+'%',
      'data-id="'+id+'" data-value="'+rate+'" aria-pressed="'+(action.rate===rate)+'"','')).join('');
    const short=Math.max(0,Math.round((plan.gap-action.safeGain)*100)/100);
    const outcome=short ? money(short)+' still needed' : 'covers the gap';
    return '<div class="choice"><div><h3>'+name+'</h3><small>'+id+' · '+money(action.ask)+' requested</small>'+
      '<p>'+money(action.safeGain)+' by '+dateText(plan.day.date)+' · '+outcome+'</p></div>'+
      '<div role="group" aria-label="Expected payment from '+name+' on '+id+'" class="segments">'+controls+'</div></div>';
  }).join('');
  return '<section class="panel"><h2>How much will the client pay?</h2>'+rows+'</section>';
}

export function rescueView(s,horizon,collectionRates,isJudge=false){
  const p=rankRescues(s,horizon,collectionRates);
  const open=s.invoices.filter(i=>outstanding(s,i)>0);
  const target=open.filter(i=>i.kind==='balance' && i.due>=s.date).sort((a,b)=>a.due.localeCompare(b.due))[0] || open[0];
  const testOffer=target?btn('test-offer','Test a client offer','data-id="'+e(target.id)+'"','primary'):'';
  const html=isJudge&&p.day
    ? title('JUDGE DEMO · RESCUE PLAN',money(p.gap)+' short on '+dateText(p.day.date),testOffer)
    : title('COLLECTIONS','Rescue plan',testOffer);
  if(!p.day)return html+'<section class="panel"><h2>Your next '+horizon+' days are covered.</h2><p>Test a late invoice to compare collection choices.</p>'+btn('preview','Preview late payment','','primary')+'</section>';
  const labels={conservative:'Recommended plan',conditional:'Needs full cooperation',incomplete:'Best available recovery','later-risk':'Creates a later shortfall'};
  return html+collectionPreview(p)+'<section class="panel dark" aria-label="Rescue recommendation"><div class="eyebrow">'+labels[p.mode].toUpperCase()+'</div><h2>'+money(p.gap)+' needed by '+dateText(p.day.date)+'</h2><p>Projected close '+signed(p.day.close)+' · buffer '+money(s.buffer)+'</p><p>'+p.day.outflows.map(f=>e(f.label)+' '+money(f.amount)).join(' + ')+'</p><b data-rescue-recommendation>'+p.chosen.map(a=>e(a.label)).join(' + ')+'</b><p>'+ (p.left?money(p.left)+' remains uncovered.':p.mode==='conditional'?'Coverage requires clients to pay the full request.':p.mode==='later-risk'?'Check the later deficit before using this plan.':'Conservative recovery covers this bill.')+'</p></section>'+
  '<section class="panel"><h2>Compare actions</h2>'+p.actions.map(a=>'<div class="choice"><div>'+badge(a.kind==='move'?'Vendor approval':a.kind==='early'?'Early deposit':'Collection')+'<h3>'+e(a.label)+'</h3><p>'+money(a.ask)+' proposed · '+Math.round(a.rate*100)+'% conservative recovery · '+money(a.safeGain)+' available by the bill date.</p><small>Full recovery '+money(a.fullGain)+' · '+(a.later?'Later gap '+dateText(a.later):'No new gap in conservative case')+(a.fullLater?' · full-case gap '+dateText(a.fullLater):'')+'</small></div>'+btn(a.kind==='move'?'move-bill':'reminder',a.kind==='move'?'Review date':'Draft reminder','data-id="'+e(a.id)+'" data-amount="'+a.ask+'" data-date="'+a.deadline+'"')+'</div>').join('')+(p.excluded.length?'<h3>Excluded</h3><p>'+p.excluded.map(e).join(' · ')+'</p>':'')+'</section>';
}
function demoDownloads(date) {
  const links=extraDemoStatements(date).map(file=>
    '<li><a class="textlink" download="'+e(file.filename)+'" href="data:text/csv;charset=utf-8,'+
    e(encodeURIComponent(file.csv))+'">'+e(file.label)+'</a></li>'
  ).join('');
  return '<details><summary>Download more demo statements</summary><p>Restart the judge demo before trying a different payment.</p><ul>'+links+'</ul></details>';
}
export function bankView(s,parsed,isJudge=false){
  let body=title('PAYMENTS','Bank import',btn('download','Download sample CSV'))+'<section class="panel"><h2>Review incoming transfers</h2><p>Upload a statement to match receipts to invoices. Confirm each allocation before it enters cash.</p>'+field('Statement CSV','<input id="csv" type="file" accept=".csv,text/csv">')+(isJudge?demoDownloads(s.date):'')+'</section>';
  if(parsed){
    let duplicates=0;
    const cards=parsed.rows.map((r,n)=>{const info=review(s,r);
      if(info.duplicate){duplicates++;return '';}
      const picks=s.invoices.filter(i=>outstanding(s,i)>0);
      const hint=info.amountHint;
      const amountNote=hint?'<p>'+e(hint.id)+' · '+e(hint.client)+' has the same outstanding amount. Check the payer before choosing an invoice.</p>':'';
      const options='<option value="">Choose an invoice or receipt</option>'+info.manual.map(m=>'<option value="link:'+e(m.id)+'">Link existing receipt · '+e(m.invoiceId)+' · '+money(m.amount)+'</option>').join('')+picks.map(i=>'<option value="'+e(i.id)+'" '+(!info.manual.length&&info.suggestion===i.id?'selected':'')+'>'+e(i.id)+' · '+e(i.client)+'</option>').join('')+'<option value="ignore">Ignore this credit</option>';
      return '<form class="panel" data-form="bank" data-index="'+n+'"><div class="panelhead"><h2>'+money(r.amount)+'</h2>'+badge(info.manual.length?'Possible manual receipt':info.conflict?'Conflicting evidence':info.suggestion?'Suggested match':'Needs review')+'</div><p>'+e(r.description)+' · '+e(r.reference)+' · '+dateText(r.date)+'</p>'+amountNote+field('Allocate transfer','<select name="selection" required>'+options+'</select>')+'<p class="allocation"></p><button type="submit" class="primary">Confirm selection</button></form>';
    }).join('');
    body+='<p role="status">'+duplicates+' already processed · '+parsed.debits+' debit / empty rows skipped</p>'+parsed.errors.map(t=>'<p class="warn">'+e(t)+'</p>').join('')+cards;
  }
  const excess=s.receipts.filter(r=>r.amount>r.applied);
  if(excess.length)body+='<section class="panel"><h2>Unapplied credits</h2>'+excess.map(r=>'<p>'+e(r.invoiceId)+' · '+money(r.amount-r.applied)+'</p>').join('')+'</section>';
  return body;
}

