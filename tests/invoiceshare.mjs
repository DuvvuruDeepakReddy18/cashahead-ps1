import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';

export async function checkInvoiceSharing(page,context,tmp){
  const dialog=page.getByRole('dialog');
  const button=name=>dialog.getByRole('button',{name,exact:true});
  const invoice=()=>page.getByRole('button',{name:'Reddy–Varma',exact:true}).click();
  const ledger=()=>page.evaluate(()=>sessionStorage.getItem('cashahead.studio.v1.judge'));
  const before=await ledger();
  const close=()=>button('Close dialog').click();
  await page.locator('nav').getByRole('link',{name:'Invoices',exact:true}).click();
  await invoice();
  const [download]=await Promise.all([page.waitForEvent('download'),button('Download PDF').click()]);
  assert.equal(download.suggestedFilename(),'CashAhead-INV-104.pdf');
  const copy=join(process.env.CASHAHEAD_PDF_ARTIFACT_DIR||tmp,download.suggestedFilename());
  await download.saveAs(copy);
  const bytes=await readFile(copy);
  assert.equal(bytes.subarray(0,5).toString(),'%PDF-');assert.ok(bytes.length>5000);
  // Capture draft navigation locally so the test never contacts a messaging provider.
  await context.route(/^https:\/\/(?:wa\.me|mail\.google\.com)\//,route=>route.fulfill({body:'Draft preview'}));
  async function visitDraft(name){
    const [tab]=await Promise.all([page.waitForEvent('popup'),dialog.getByRole('link',{name,exact:true}).click()]);
    await tab.waitForLoadState('domcontentloaded');const link=new URL(tab.url());await tab.close();return link;
  }
  await page.evaluate(()=>Object.defineProperty(navigator,'canShare',{configurable:true,value:()=>false}));
  await button('Share invoice').click();
  assert.equal(await button('Share PDF…').isVisible(),false);
  const summary=await dialog.locator('.dialogbody > p').first().innerText();
  assert.match(summary,/INV-104.*₹11,000.*₹1,000.*₹10,000.*26 Nov 2026.*₹3,000 by 27 Nov 2026.*₹7,000 by 28 Nov 2026/);
  assert.equal((await visitDraft('Gmail draft')).searchParams.get('body'),summary);
  assert.equal((await visitDraft('WhatsApp draft')).searchParams.get('text'),summary);
  const [fallback]=await Promise.all([page.waitForEvent('download'),button('Download PDF').click()]);
  assert.equal(fallback.suggestedFilename(),download.suggestedFilename());await close();

  await invoice();await button('Draft reminder').click();
  const message=dialog.getByLabel('Message',{exact:true});
  assert.match(await message.inputValue(),/₹3,000 by 27 Nov 2026 and ₹7,000 by 28 Nov 2026/);
  const edit=(await message.inputValue())+'\nPlease reply A & B + invoice #104.';
  await message.fill(edit);
  assert.equal((await visitDraft('WhatsApp draft')).searchParams.get('text'),edit);
  const gmail=await visitDraft('Gmail draft');assert.equal(gmail.searchParams.get('body'),edit);
  assert.equal(gmail.searchParams.has('to'),false);assert.match(gmail.searchParams.get('su'),/INV-104/);
  await close();assert.equal(await ledger(),before);

  await page.setViewportSize({width:390,height:844});
  await page.evaluate(()=>{
    window.testShares=[];
    Object.defineProperty(navigator,'canShare',{configurable:true,value:data=>data.files[0] instanceof File});
    Object.defineProperty(navigator,'share',{configurable:true,value:async data=>{
      const file=data.files[0];window.testShares.push({name:file.name,type:file.type,size:file.size,prefix:await file.slice(0,5).text()});
      if(window.testShares.length===1)throw new DOMException('User cancelled','AbortError');
    }});
  });
  await invoice();await button('Share invoice').tap();await button('Share PDF…').tap();await button('Share PDF…').tap();
  await page.waitForFunction(()=>window.testShares.length===2);
  const shares=await page.evaluate(()=>window.testShares);
  for(const item of shares){assert.equal(item.name,download.suggestedFilename());assert.equal(item.type,'application/pdf');assert.equal(item.prefix,'%PDF-');assert.ok(item.size>5000);}
  assert.equal(await dialog.locator('.form-error').innerText(),'');
  assert.ok(await dialog.evaluate(d=>d.scrollWidth<=d.clientWidth+1));
  assert.equal(await ledger(),before);await close();

  await invoice();await button('Record payment').click();await dialog.getByLabel('Amount received').fill('10500');
  await button('Confirm payment').click();await dialog.waitFor({state:'hidden'});await invoice();
  const [settled]=await Promise.all([page.waitForEvent('download'),button('Download PDF').click()]);
  const settledCopy=join(process.env.CASHAHEAD_PDF_ARTIFACT_DIR||tmp,'settled.pdf');await settled.saveAs(settledCopy);
  await button('Share invoice').click();assert.match(await dialog.innerText(),/Paid towards this invoice ₹11,000\. Remaining balance ₹0/);
  await close();await page.setViewportSize({width:1365,height:900});
  console.log('PASS · client PDF download, partial and settled invoices, agreed dates, edited Gmail and WhatsApp drafts, mobile file sharing, cancel and fallback');
}
