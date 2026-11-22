import {draftUrls,invoiceMessage} from './clientinvoice.js';
import {downloadFile,invoiceFile} from './invoicepdf.js';
import {btn,e} from './views.js';

export function draftLinks(subject,message){
  if(!message.trim())return '';
  const urls=draftUrls(subject,message);
  return '<a class="btn" target="_blank" rel="noopener noreferrer" href="'+e(urls.whatsapp)+'">WhatsApp draft</a>'+
    '<a class="btn" target="_blank" rel="noopener noreferrer" href="'+e(urls.gmail)+'">Gmail draft</a>';
}

export function showInvoiceShare(model,open,panel){
  const subject='Invoice '+model.id+' · '+model.studio;
  const body=invoiceMessage(model);
  open('<h2>Share invoice</h2><p>'+e(body)+'</p><div class="actions">'+
    btn('invoice-pdf','Download PDF','data-id="'+e(model.id)+'"')+
    '<button type="button" data-native hidden>Share PDF…</button></div>'+
    '<p>For WhatsApp or Gmail, download the PDF, open a draft, then attach the file and choose the recipient.</p>'+
    '<div class="actions">'+draftLinks(subject,body)+'</div>');
  if(!navigator.share||!navigator.canShare)return;
  const native=panel.querySelector('[data-native]');
  // Prepare the file before the tap. File sharing requires a new user activation.
  invoiceFile(model).then(file=>{
    if(!native.isConnected||!navigator.canShare({files:[file]}))return;
    native.hidden=false;
    native.addEventListener('click',async()=>{
      try{await navigator.share({files:[file],title:subject});}
      catch(error){if(error.name!=='AbortError'&&native.isConnected)panel.querySelector('.form-error').textContent='File sharing is unavailable. Choose Download PDF.';}
    });
  }).catch(()=>{ /* Download remains available to retry. */ });
}
