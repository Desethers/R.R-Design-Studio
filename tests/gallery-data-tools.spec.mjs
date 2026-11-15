import {test,expect} from '@playwright/test';

test('live Gallery OS inventory, filters, pagination and related Conversations',async({page,request},info)=>{
 const response=await request.get('http://localhost:3010/api/studio/inventory');expect(response.ok()).toBeTruthy();const data=await response.json();expect(data.total).toBeGreaterThan(0);
 await page.goto('/library/?area=tools&category=searchable-inventory&component=tool-searchable-inventory&view=page');
 const frame=page.frameLocator('iframe[title="Searchable Inventory"]').frameLocator('#assistant');
 await expect(frame.locator('.rr-artwork').first()).toBeVisible({timeout:30000});
 await expect.poll(()=>frame.locator('.rr-artwork img').first().evaluate(image=>image.complete&&image.naturalWidth>0),{timeout:20000}).toBeTruthy();
 await expect(frame.getByRole('status')).toContainText(`${data.total} œuvres`);
 await frame.getByRole('searchbox').fill(data.items[0].title);
 await expect(frame.getByRole('status')).not.toContainText('Recherche…',{timeout:30000});
 await frame.locator('.rr-artwork').first().click();
 await expect(frame.getByRole('dialog')).toBeVisible();
 await expect(frame.getByRole('heading',{name:'Échanges autour de cette œuvre'})).toBeVisible();
 await frame.getByRole('button',{name:'Fermer ×'}).click();
 await frame.getByRole('searchbox').fill('not-found-999xyz');
 await expect(frame.getByText('Aucune œuvre ne correspond aux filtres.')).toBeVisible();
 await frame.getByRole('searchbox').fill('');
 await frame.getByRole('combobox',{name:'Disponibilité'}).selectOption('available');
 await expect(frame.getByRole('status')).not.toContainText('Recherche…',{timeout:30000});
 const filtered=await request.get('http://localhost:3010/api/studio/inventory?status=available&budget=15000');
 expect((await filtered.json()).items.every(a=>a.status==='available'&&a.price<=15000&&!a.priceOnRequest)).toBeTruthy();
 await page.screenshot({path:info.outputPath('inventory.png')});
 await page.setViewportSize({width:390,height:844});
 await expect.poll(()=>frame.locator('body').evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
});

test('live archive sources and cited AI interface without invoking the provider',async({page,request},info)=>{
 const response=await request.get('http://localhost:3010/api/studio/archive');expect(response.ok()).toBeTruthy();const data=await response.json();expect(data.scanned).toBeGreaterThan(0);expect(data.sources.length).toBeGreaterThan(0);
 const noSources=await request.post('http://localhost:3010/api/studio/archive',{data:{question:'zzzxqnevermatch89277'}});expect(noSources.ok()).toBeTruthy();expect((await noSources.json()).sources).toEqual([]);
 const people=await request.get('http://localhost:3010/api/studio/archive?kind=conversation');const conversationData=await people.json();expect(conversationData.sources.every(s=>s.kind==='conversation')).toBeTruthy();
 await page.route('http://localhost:3010/api/studio/archive',async route=>{
  if(route.request().method()!=='POST')return route.continue();
  await route.fulfill({json:{...data,answer:'Réponse de test avec référence [1].',sources:[{...data.sources[0],reference:1,cited:true}]}});
 });
 await page.goto('/library/?area=tools&category=gallery-archive-ai&component=tool-gallery-archive-ai&view=page');
 const frame=page.frameLocator('iframe[title="Gallery Archive AI"]').frameLocator('#assistant');
 await expect(frame.locator('.rr-sources article').first()).toBeVisible({timeout:30000});
 await frame.getByLabel('Interroger les archives').fill('Question de test');
 await frame.getByRole('button',{name:'Poser la question ↑'}).click();
 await expect(frame.getByRole('region',{name:'Réponse avec références'})).toContainText('[1]');
 await expect(frame.locator('.rr-sources')).toContainText('Cité');
 await page.unroute('http://localhost:3010/api/studio/archive');
 await page.route('http://localhost:3010/api/studio/archive',async route=>{
  if(route.request().method()!=='POST')return route.continue();
  await route.fulfill({status:502,json:{...data,error:'Le fournisseur LLM refuse l’accès (HTTP 403). Les sources restent consultables.'}});
 });
 await frame.getByRole('button',{name:'Poser la question ↑'}).click();
 await expect(frame.locator('.rr-tools [role="alert"]')).toContainText('HTTP 403');
 await expect(frame.locator('.rr-sources article').first()).toBeVisible();
 await frame.getByRole('combobox',{name:'Type de source'}).selectOption('conversation');
 await expect(frame.getByRole('region',{name:'Réponse avec références'})).toHaveCount(0);
 await expect(frame.getByRole('status')).not.toContainText('Recherche…',{timeout:30000});
 await page.screenshot({path:info.outputPath('archive.png')});
 await page.setViewportSize({width:390,height:844});
 await expect.poll(()=>frame.locator('body').evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
});
