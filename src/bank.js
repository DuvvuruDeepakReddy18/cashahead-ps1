import {validDate, amountValue, outstanding, receipt} from './ledger.js';
function csvRows(text){
  const rows=[];let row=[],field='',quoted=false;
  for(let n=0;n<text.length;n++){
    const ch=text[n];
    if(ch==='"'){if(quoted && text[n+1]==='"'){field+='"';n++;}else quoted=!quoted;}
    else if(ch===','&&!quoted){row.push(field.trim());field='';}
    else if(ch==='\n'&&!quoted){row.push(field.trim());if(row.some(Boolean))rows.push(row);row=[];field='';}
    else if(ch!=='\r')field+=ch;
  }
  if(quoted)throw Error('Unclosed quotation mark in CSV.');
  row.push(field.trim());if(row.some(Boolean))rows.push(row);return rows;
}
export function parseStatement(text){
  const all=csvRows(text.replace(/^\uFEFF/,'')),headerIndex=all.findIndex(r=>r.some(v=>v.toLowerCase()==='date'));
  if(headerIndex<0)throw Error('CSV needs a Date column.');
  const head=all[headerIndex].map(v=>v.toLowerCase());
  const column=(...labels)=>head.findIndex(v=>labels.includes(v));
  const dateCol=column('date'),desc=column('narration','description','details'),ref=column('ref no','ref no.','reference','transaction id'),value=column('deposit','credit','amount'),bal=column('balance');
  if(desc<0||value<0)throw Error('Include Narration or Description and Deposit, Credit or Amount.');
  const rows=[],errors=[];let debits=0;
  for(const [index,fields] of all.slice(headerIndex+1).entries()){
    const raw=fields[value]||'';
    if(!raw){debits++;continue;}
    const amount=Number(raw.replace(/^(?:rs\.?|inr|₹)\s*/i,'').replace(/,/g,''));
    if(Number.isFinite(amount)&&amount<=0){debits++;continue;}
    let date=fields[dateCol],m=date?.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2}|\d{4})$/);
    if(m)date=(m[3].length===2?'20':'')+m[3]+'-'+m[2].padStart(2,'0')+'-'+m[1].padStart(2,'0');
    try{amountValue(amount);if(!validDate(date))throw Error('date');}
    catch{errors.push('Row '+(index+headerIndex+2)+' has an invalid amount or date.');continue;}
    const reference=fields[ref]||'',description=fields[desc]||'';
    const key=reference?'ref:'+reference.trim().toUpperCase():'row:'+JSON.stringify([date,amount,description.toLowerCase().replace(/\s+/g,' ').trim(),fields[bal]||'']);
    rows.push({date,description,amount,reference,key});
  }
  return {rows,errors,debits};
}
export function sampleCSV(s){return ['Date,Narration,Ref No,Withdrawal,Deposit,Balance',
  [s.date,'UPI Kiran & Divya INV-101','DEMO-KD-5000','',5000,11000].join(','),
  [s.date,'UPI from unidentified client','DEMO-REVIEW','',3500,14500].join(','),
  [s.date,'Studio supplies','DEMO-DR',300,'',14200].join(',')].join('\r\n');}
export function review(s,row){
  const text=row.description.toLowerCase(), ids=text.match(/\binv-[a-z\d]+(?:-[a-z\d]+)*\b/g)||[];
  const hits=s.invoices.filter(i=>ids.includes(i.id.toLowerCase()));
  const names=[...new Set(s.invoices.map(i=>i.client))].filter(n=>text.includes(n.toLowerCase()));
  const open=s.invoices.filter(i=>outstanding(s,i)>0);
  const candidates=open.filter(i=>names.includes(i.client));
  const exact=open.filter(i=>outstanding(s,i)===row.amount);
  const conflict=ids.some(id=>!hits.some(i=>i.id.toLowerCase()===id))||hits.length>1||!!(hits[0]&&names.some(name=>name!==hits[0].client));
  let suggestion='';
  if(!conflict){
    if(hits.length===1)suggestion=open.some(i=>i.id===hits[0].id)?hits[0].id:'';
    else if(candidates.length===1)suggestion=candidates[0].id;
  }
  const amountHint=!ids.length && !names.length && exact.length===1 ? exact[0] : null;
  const manual=s.receipts.filter(r=>!r.bankKey && r.amount===row.amount && r.date===row.date &&
    (!r.reference||!row.reference||r.reference.toUpperCase()===row.reference.toUpperCase())&&
    (!ids.length||hits.some(i=>i.id===r.invoiceId))&&(!names.length||candidates.some(i=>i.id===r.invoiceId)||s.invoices.some(i=>i.id===r.invoiceId&&names.includes(i.client))));
  return {suggestion,amountHint,manual,conflict,duplicate:s.receipts.some(r=>r.bankKey===row.key)||s.ignored.includes(row.key)};
}
export function confirmBank(s,row,choice){
  const info=review(s,row);if(info.duplicate)return s;
  if(!choice)throw Error('Choose an invoice or receipt before confirming.');
  if(choice==='ignore')return {...s,ignored:[...s.ignored,row.key]};
  if(choice.startsWith('link:')){
    const id=choice.slice(5);if(!info.manual.some(r=>r.id===id))throw Error('Select a matching manual receipt.');
    return {...s,receipts:s.receipts.map(r=>r.id===id?{...r,bankKey:row.key,reference:row.reference||r.reference}:r)};
  }
  return receipt(s,{id:'bank/'+row.key,invoiceId:choice,amount:row.amount,date:row.date,bankKey:row.key,reference:row.reference});
}
