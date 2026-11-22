import {clientDate} from './clientinvoice.js';
import {money,round} from './ledger.js';

const ink='#173631',muted='#50665e',green='#12684e';
const label=text=>({text,fontSize:9,color:muted});
const heading=text=>({text,fontSize:13,bold:true,margin:[0,20,0,7]});
const amountCell=value=>({text:money(value),alignment:'right'});
function table(headers,widths,rows){
  return {table:{headerRows:1,dontBreakRows:true,widths,body:[
    headers.map((text,i)=>({text,bold:true,fontSize:9,fillColor:'#eaf2ed',alignment:i?'right':'left'})),...rows]},
    layout:{vLineWidth:()=>0,hLineWidth:i=>i?0.5:0,hLineColor:()=>'#d7e3da',paddingTop:()=>6,paddingBottom:()=>6}};
}
export function invoiceDocument(m){
  const status=m.balance===0?'Paid in full':m.paid?'Partially paid':'Awaiting payment';
  const rest=round(m.balance-m.agreed.reduce((sum,p)=>sum+p.remaining,0));
  return {
    pageSize:'A4',pageMargins:[45,45,45,52],defaultStyle:{font:'Roboto',fontSize:10,color:ink,lineHeight:1.2},
    info:{title:'Invoice '+m.id+' · '+m.studio,author:m.studio},
    footer:(page,pages)=>({columns:[{text:m.id},{text:page+' / '+pages,alignment:'right'}],margin:[45,14],fontSize:8,color:muted}),
    content:[
      {columns:[{width:'*',text:m.studio,bold:true,fontSize:18,color:green},{width:'auto',alignment:'right',stack:[
        {text:'INVOICE',fontSize:20,bold:true}, {text:m.id,color:muted}]}]},
      {columns:[{width:'*',stack:[label('BILLED TO'),{text:m.client,fontSize:15,bold:true,margin:[0,3,0,3]},m.job,m.kind]},
        {width:'auto',stack:[label('ORIGINAL DUE DATE'),clientDate(m.due),{...label('BALANCE AS OF'),margin:[0,7,0,0]},clientDate(m.asOf)]}],margin:[0,25,0,22]},
      {table:{widths:['*','auto'],body:[[{stack:[{text:'Remaining balance',fontSize:11,bold:true},status],color:'#ffffff',margin:[9,7]},
        {text:money(m.balance),fontSize:23,bold:true,color:'#ffffff',alignment:'right',margin:[9,6]}]]},
        layout:{fillColor:()=>green,hLineWidth:()=>0,vLineWidth:()=>0}},
      {columns:[{stack:[label('Invoice total'),{text:money(m.total),bold:true}]},
        {stack:[label('Payments applied'),{text:money(m.paid),bold:true}]}],margin:[0,12,0,0]},
      heading('Payment history'),
      m.receipts.length?table(['Received on','Received','Applied to invoice','Unapplied credit'],['*','auto','auto','auto'],
        m.receipts.map(r=>[clientDate(r.date),amountCell(r.amount),amountCell(r.applied),amountCell(r.credit)])):label('No payments recorded.'),
      heading('Agreed payment dates'),
      m.agreed.length?table(['Agreed date','Agreed amount','Still due'],['*','auto','auto'],
        m.agreed.map(p=>[clientDate(p.date),amountCell(p.amount),amountCell(p.remaining)])):label('No payment agreement recorded.'),
      m.agreed.length&&rest>0?{...label(money(rest)+' of the balance has no separately agreed payment date.'),margin:[0,6,0,0]}:'',
    ]};
}

let engine;
function loadScript(src){
  return new Promise((resolve,reject)=>{
    const tag=document.createElement('script');tag.src=src;
    tag.onload=resolve;tag.onerror=()=>{tag.remove();reject(Error('The PDF tools could not load. Please retry.'));};
    document.head.append(tag);
  });
}
async function loadEngine(){
  if(!globalThis.pdfMake)await loadScript('/src/pdfengine.js');
  await loadScript('/src/pdffonts.js');
  return globalThis.pdfMake;
}
export async function invoiceFile(model){
  if(!engine)engine=loadEngine().catch(error=>{engine=null;throw error;});
  const printer=await engine;
  const blob=await new Promise(resolve=>printer.createPdf(invoiceDocument(model)).getBlob(resolve));
  return new File([blob],'CashAhead-'+model.id.replace(/[^a-zA-Z0-9_-]/g,'_')+'.pdf',{type:'application/pdf'});
}
export function downloadFile(file){
  const url=URL.createObjectURL(file),link=document.createElement('a');
  link.download=file.name;link.href=url;document.body.append(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),30000);
}
