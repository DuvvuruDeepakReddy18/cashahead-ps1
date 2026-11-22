import assert from 'node:assert/strict';

export async function checkCameraTour(browser,url){
  const context=await browser.newContext({viewport:{width:1280,height:800},reducedMotion:'reduce'});
  const page=await context.newPage(),errors=[],missing=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.url().startsWith(url)&&r.status()>=400)missing.push(r.status()+' '+r.url());});
  try{
    await page.goto(url);
    await page.getByRole('heading',{name:'Know your Friday.',exact:true}).waitFor();
    await page.locator('#dry-row [role=button],#dry-row button').first().waitFor({state:'attached'});
    assert.equal(await page.getByRole('link',{name:'Try the judge demo',exact:true}).getAttribute('href'),'/?demo=friday');
    assert.equal(await page.locator('.cover-sheet').evaluate(async im=>{await im.decode();return im.naturalWidth>0;}),true);
    await page.getByRole('button',{name:'Confirm sample payment',exact:true}).click();
    await page.locator('.ledger-summary output').getByText('+₹1,000',{exact:true}).waitFor();
    await page.getByRole('button',{name:'Undo sample match'}).click();
    await page.locator('.ledger-summary output').getByText('−₹4,000',{exact:true}).waitFor();
    await page.getByRole('button',{name:'Larger crew bill'}).click();
    await page.getByRole('button',{name:'Test all four options'}).click();
    await page.locator('.ledger-summary output').getByText('−₹2,500',{exact:true}).waitFor();
    await page.getByRole('button',{name:'Mend',exact:true}).click();
    await page.locator('.staff-role').getByText('Mend / Planner').waitFor();
    await page.locator('#wf-cash').fill('10000');
    await page.locator('.week-detail').getByText('Closing ₹0').waitFor();
    await page.locator('#rail button').last().click();
    await page.locator('.slide.on h3').getByText('Match the payment.').waitFor();

    for (const width of [1280,390]) {
      await page.setViewportSize({width,height:844});
      await page.goto(url);
      const closing=page.getByRole('region',{name:'Get started'});
      assert.equal(await closing.getByRole('link',{name:'Open my studio'}).getAttribute('href'),'/mine');
      await closing.getByRole('link',{name:'Start the full demo'}).click();
      await page.waitForURL(url+'/app?demo=friday');
      await page.getByRole('heading',{name:'Overdue invoices'}).waitFor();
      assert.equal(await page.locator('[data-stat="cash"]').innerText(),'₹6,000');
      assert.equal(await page.locator('[data-stat="friday"]').innerText(),'−₹4,000');
      await page.reload();
      await page.getByRole('button',{name:/Review rescue plan/}).click();
      await page.waitForURL(url+'/app/rescue?demo=friday');
      await page.getByRole('heading',{name:/₹4,000 short on/}).waitFor();
    }
    console.log('PASS · highlighted footer starts on judge Overview, then opens the Friday rescue plan on desktop and mobile');
    await page.setViewportSize({width:390,height:844});
    await page.goto(url);await page.getByRole('link',{name:'Try the judge demo',exact:true}).waitFor();
    const boxes=await page.locator('.cover-nav a').evaluateAll(links=>links.map(link=>{const b=link.getBoundingClientRect();return [b.left,b.right];}));
    for(const [i,[left,right]] of boxes.entries()){assert.ok(left>=0 && right<=390);if(i)assert.ok(left>=boxes[i-1][1]);}
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await page.getByRole('link',{name:'My studio',exact:false}).first().click();
    await page.waitForURL('**/mine');
    await page.getByRole('heading',{name:'My studio',exact:true}).waitFor();
    await page.getByRole('link',{name:'CashAhead home'}).click();
    await page.getByRole('link',{name:'Try the judge demo',exact:true}).click();
    await page.getByRole('heading',{name:/₹4,000 short on/}).waitFor();
    const loadedFonts=await page.evaluate(async()=>(await document.fonts.load('650 16px "Bricolage Grotesque Variable"','CashAhead')).length);
    assert.ok(loadedFonts>0);
    const film=await context.request.get(url+'/images/crew-tracking-wide.mp4',{headers:{Range:'bytes=10-39'}});
    assert.equal(film.status(),206);assert.equal((await film.body()).length,30);
    assert.deepEqual(missing,[]);assert.deepEqual(errors,[]);
    console.log('PASS · camera cover, interactive rescue cases, crew, week calculator, toolkit, mobile navigation, motion preference and film streaming');
  }finally{await context.close();}
}
