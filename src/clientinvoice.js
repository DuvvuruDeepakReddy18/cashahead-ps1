import {addDays,confirmedAgreement,installmentBalances,money,outstanding,paidFor,round} from './ledger.js';

const calendar=new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});
export const clientDate=date=>calendar.format(new Date(date+'T12:00:00Z'));

export function invoiceStatement(studio,invoice){
  const receipts=studio.receipts.filter(r=>r.invoiceId===invoice.id)
    .map(r=>({date:r.date,amount:r.amount,applied:r.applied,credit:round(r.amount-r.applied)}))
    .sort((a,b)=>a.date.localeCompare(b.date));
  // Older single dates could originate in a private forecast. Only export identifiable agreements.
  const agreement=confirmedAgreement(invoice);
  const agreed=agreement ? installmentBalances(studio,invoice,agreement) : [];
  return {id:invoice.id,studio:studio.name,client:invoice.client,job:invoice.job,
    kind:invoice.kind==='deposit'?'Booking deposit':'Final balance',due:invoice.due,asOf:studio.date,
    total:invoice.amount,paid:paidFor(studio,invoice.id),balance:outstanding(studio,invoice),receipts,agreed};
}

const dueTerms=m=>m.agreed.filter(p=>p.remaining>0).map(p=>money(p.remaining)+' by '+clientDate(p.date)).join(' and ');
export function invoiceMessage(m){
  const schedule=dueTerms(m);
  return 'Hi '+m.client+', here is your invoice '+m.id+' for '+m.job+' from '+m.studio+'. '+
    'Invoice total '+money(m.total)+'. Paid towards this invoice '+money(m.paid)+'. Remaining balance '+money(m.balance)+'. '+
    'Original due date '+clientDate(m.due)+'.'+(schedule?' Agreed payments still due: '+schedule+'.':'');
}
export function reminderMessage(m,date,ask){
  const schedule=dueTerms(m);
  const amount=Math.min(ask||m.balance,m.balance);
  const request=date||!schedule?'could you arrange '+money(amount)+' towards '+m.job+' ('+m.id+') by '+clientDate(date||addDays(m.asOf,2))+'?':
    'a reminder for '+m.job+' ('+m.id+'). Our agreed payments still due are '+schedule+'.';
  return 'Hi '+m.client+', '+request+' The outstanding balance is '+money(m.balance)+'. Thank you, '+m.studio+'.';
}

export function draftUrls(subject,message){
  const whatsapp=new URL('https://wa.me/');
  whatsapp.searchParams.set('text',message);
  const gmail=new URL('https://mail.google.com/mail/');
  gmail.searchParams.set('view','cm');gmail.searchParams.set('fs','1');
  gmail.searchParams.set('su',subject);gmail.searchParams.set('body',message);
  return {whatsapp:whatsapp.href,gmail:gmail.href};
}
