import { test, expect } from '@playwright/test';
import { PDFDocument } from 'pdf-lib';
import fs from 'node:fs/promises';

async function extractPDFText(page,bytes){
  return page.evaluate(async base64=>{
    const pdfjs=await import('/node_modules/pdfjs-dist/build/pdf.mjs');
    pdfjs.GlobalWorkerOptions.workerSrc='/node_modules/pdfjs-dist/build/pdf.worker.mjs';
    const task=pdfjs.getDocument({data:Uint8Array.from(atob(base64),c=>c.charCodeAt(0))});
    const pdf=await task.promise;const texts=[];
    for(let n=1;n<=pdf.numPages;n++)texts.push((await(await pdf.getPage(n)).getTextContent()).items.map(i=>i.str).join(' '));
    await task.destroy();return texts;
  },Buffer.from(bytes).toString('base64'));
}

test('existing studio navigation and Tools integration',async({page})=>{
  await page.goto('/library/?area=gallery-sites&category=galerie-template&component=template-galerie-01&view=grid');
  await expect(page.getByRole('heading',{name:'Tools',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Artwork PDF Generator',exact:true}).click();
  await expect(page.frameLocator('iframe').getByRole('heading',{name:'Artwork PDF Generator',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Inquiry Tracker',exact:true}).click();
  await expect(page.frameLocator('iframe').getByText('In development',{exact:true})).toBeVisible();
  await expect(page.frameLocator('iframe').getByRole('heading',{name:'Inquiry Tracker',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Galerie Template',exact:true}).click();
  await expect(page.locator('.workspace-tile[data-tile-component="template-galerie-01"]')).toBeVisible();
  await page.getByRole('button',{name:'Artist',exact:true}).click();
  await expect(page.locator('.workspace-tile[data-tile-component="artist-full-page-03"]')).toBeVisible();
  await page.getByRole('button',{name:'Editorial',exact:true}).click();
  await expect(page.locator('.workspace-tile[data-tile-component="editorial-photo-caption-01"]')).toBeVisible();
});

test('sample selection, layout, real preview and downloadable PDF',async({page},info)=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/tools/artwork-pdf/');
  await page.getByRole('searchbox').fill('monet');
  await expect(page.locator('.art-card')).toHaveCount(1);
  await page.getByRole('checkbox').check();
  await page.getByRole('searchbox').fill('');
  await page.locator('[data-select="sample-2"]').check();
  await expect(page.locator('#count')).toContainText('2 selected');
  await page.getByRole('button',{name:'Design your document'}).click();
  await page.locator('[data-setting="galleryName"]').fill('Atelier Éditions');
  await page.locator('[data-setting="galleryName"]').press('Tab');
  await page.locator('[data-setting="documentTitle"]').fill('Œuvres choisies');
  await page.locator('[data-setting="documentTitle"]').press('Tab');
  await page.getByRole('radio',{name:'Paired Two artworks, one conversation.'}).check();
  await page.getByLabel('Show prices in PDF').check();
  await page.getByLabel('Include a cover page').check();
  await page.locator('#logo').setInputFiles('images/gallery-sites/darmo/instagram.png');
  await expect(page.getByRole('status')).toContainText('Logo updated');
  await page.getByRole('button',{name:'Move The Swan, No. 10 up',exact:true}).click();
  await expect(page.locator('.order-info').first()).toContainText('Hilma');
  await page.getByRole('button',{name:'Preview document'}).click();
  await expect(page.getByRole('button',{name:'Download PDF'})).toBeEnabled({timeout:60000});
  await expect(page.locator('.pdf-page canvas')).toHaveCount(2,{timeout:30000});
  await expect(page.locator('.pdf-page canvas').first()).toHaveAttribute('data-rendered','true',{timeout:30000});
  expect(await page.locator('.pdf-page canvas').first().evaluate(canvas=>canvas.width)).toBeGreaterThanOrEqual(1920);
  await page.locator('.pdf-page canvas').last().scrollIntoViewIfNeeded();
  await expect(page.locator('.pdf-page canvas').last()).toHaveAttribute('data-rendered','true',{timeout:30000});
  await expect(page.locator('.preview-warnings')).toHaveCount(0);
  const event=page.waitForEvent('download');await page.getByRole('button',{name:'Download PDF'}).click();
  const download=await event;const output=info.outputPath('selection.pdf');await download.saveAs(output);
  expect(download.suggestedFilename()).toBe('atelier-editions-selected-works.pdf');
  const bytes=await fs.readFile(output);expect(bytes.length).toBeGreaterThan(30000);
  expect((await PDFDocument.load(bytes)).getPageCount()).toBe(2);
  const text=await extractPDFText(page,bytes);
  expect(text[0]).toContain('Œuvres choisies');
  expect(text[1]).toContain('€12,500');
  expect(text[1].indexOf('Hilma')).toBeLessThan(text[1].indexOf('Claude'));
  await page.screenshot({path:info.outputPath('preview.png'),fullPage:true});
  await page.getByRole('tab',{name:'Design'}).click();
  await page.getByLabel('Show prices in PDF').uncheck();
  await page.getByRole('tab',{name:'Preview'}).click();
  await expect(page.getByRole('button',{name:'Download PDF'})).toBeDisabled();
  expect(errors).toEqual([]);
});

test('CSV import, errors, filenames, Unicode, all layouts and responsive view',async({page},info)=>{
  await page.goto('/tools/artwork-pdf/?client=atelier');
  await page.locator('#csv').setInputFiles({name:'bad.csv',mimeType:'text/csv',buffer:Buffer.from('artist,wrong\nMonet,Hello')});
  await expect(page.getByRole('status')).toContainText('artist and title');
  await expect(page.locator('.art-card')).toHaveCount(6);
  const csv='artist,title,year,medium,dimensions,price,image\r\n"Élodie D’Arc","Red, blue",2024,"Oil on canvas",30 × 40 cm,"€4,500",instagram.png\r\nClaude Monet,Water,2025,Ink,20 × 30 cm,€200,\r\nPaul Klee,Evening,1929,Oil,20 × 20 cm,€500,\r\nHilma,Study,1915,Ink,10 × 10 cm,€300,\r\nTest,Final,2026,Oil,30 × 20 cm,€100,\r\n';
  await page.locator('#csv').setInputFiles({name:'inventory.csv',mimeType:'text/csv',buffer:Buffer.from(csv)});
  await expect(page.locator('.art-card')).toHaveCount(5);
  await page.locator('#images').setInputFiles('images/gallery-sites/darmo/instagram.png');
  await expect(page.locator('.art-image').first()).not.toHaveClass(/no-image/);
  await page.getByRole('button',{name:'Select visible'}).click();
  await page.getByRole('button',{name:'Design your document'}).click();
  await page.locator('[data-setting="layout"][value="contact"]').check();
  await page.getByRole('button',{name:'Preview document'}).click();
  await expect(page.getByRole('button',{name:'Download PDF'})).toBeEnabled({timeout:60000});
  await expect(page.locator('.pdf-page canvas')).toHaveCount(2,{timeout:30000});
  await expect(page.locator('.preview-warnings')).toContainText('no image supplied');
  let event=page.waitForEvent('download');await page.getByRole('button',{name:'Download PDF'}).click();await(await event).saveAs(info.outputPath('contact.pdf'));
  await page.getByRole('tab',{name:'Design'}).click();
  await page.locator('[data-setting="layout"][value="editorial"]').check();
  await page.getByLabel('Show prices in PDF').uncheck();
  await page.getByRole('button',{name:'Preview document'}).click();
  await expect(page.getByRole('button',{name:'Download PDF'})).toBeEnabled({timeout:60000});
  await expect(page.locator('.pdf-page canvas')).toHaveCount(5,{timeout:30000});
  event=page.waitForEvent('download');await page.getByRole('button',{name:'Download PDF'}).click();await(await event).saveAs(info.outputPath('editorial.pdf'));
  const text=await extractPDFText(page,await fs.readFile(info.outputPath('editorial.pdf')));
  expect(text[0]).toContain('Élodie D’Arc');
  expect(text.join(' ')).not.toContain('€');
  await page.setViewportSize({width:390,height:844});
  await page.getByRole('tab',{name:'Artworks'}).click();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:info.outputPath('mobile.png'),fullPage:true});
  await page.getByRole('tab',{name:'Design'}).click();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.getByRole('tab',{name:'Preview'}).click();
  await expect(page.locator('.pdf-page canvas')).toHaveCount(5,{timeout:30000});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('long CSV metadata continues across pages without truncation',async({page},info)=>{
  await page.goto('/tools/artwork-pdf/');
  const longText='Detailed provenance and material information. '.repeat(120)+' END-OF-RECORD';
  const csv=`artist;title;year;medium;dimensions;price;image\nArtist;"A quoted ""title""";2026;"${longText}";20 × 30 cm;€100;`;
  await page.locator('#csv').setInputFiles({name:'long.csv',mimeType:'text/csv',buffer:Buffer.from(csv)});
  await expect(page.locator('.art-card')).toHaveCount(1);
  await page.getByRole('checkbox').check();
  await page.getByRole('button',{name:'Design your document'}).click();
  await page.getByRole('button',{name:'Preview document'}).click();
  await expect(page.getByRole('button',{name:'Download PDF'})).toBeEnabled({timeout:60000});
  const event=page.waitForEvent('download');await page.getByRole('button',{name:'Download PDF'}).click();await(await event).saveAs(info.outputPath('long-record.pdf'));
  const bytes=await fs.readFile(info.outputPath('long-record.pdf'));
  expect((await PDFDocument.load(bytes)).getPageCount()).toBeGreaterThan(1);
  const text=await extractPDFText(page,bytes);
  expect(text.join(' ')).toContain('END-OF-RECORD');
  expect(text[1]).toContain('Details continued');
});

test('Gallery OS style grid/list switch preserves search and artwork selection',async({page},info)=>{
 await page.goto('/tools/artwork-pdf/');
 await expect(page.getByRole('button',{name:'Gallery view',exact:true})).toHaveAttribute('aria-pressed','true');
 await page.locator('.art-card').first().locator('.art-image').click();
 await expect(page.locator('[data-select="sample-1"]')).toBeChecked();
 await expect(page.locator('.art-card').first().getByText('Selected',{exact:true})).toBeVisible();
 await page.locator('.art-card').nth(1).locator('.art-meta').click();
 await expect(page.locator('[data-select="sample-2"]')).toBeChecked();
 await page.locator('[data-select="sample-2"]').focus();
 await page.keyboard.press('Space');
 await expect(page.locator('[data-select="sample-2"]')).not.toBeChecked();
 for(const card of await page.locator('.art-card').all()){
  const image=card.locator('.art-image'),checkbox=card.getByRole('checkbox');
  expect((await checkbox.boundingBox()).y).toBeGreaterThanOrEqual((await image.boundingBox()).y+(await image.boundingBox()).height);
 }
 await page.screenshot({path:info.outputPath('cards-desktop.png'),fullPage:true});
 await page.getByRole('button',{name:'Compact list view',exact:true}).click();
 await expect(page.getByRole('table')).toBeVisible();
 await expect(page.locator('[data-select="sample-1"]')).toBeChecked();
 await expect(page.getByRole('columnheader',{name:'Artist',exact:true})).toBeVisible();
 await page.locator('[data-select="sample-2"]').check();
 await page.getByRole('searchbox').fill('Monet');
 await expect(page.locator('.artwork-table tbody tr')).toHaveCount(1);
 await page.getByRole('button',{name:'Gallery view',exact:true}).click();
 await expect(page.locator('.art-card')).toHaveCount(1);
 await expect(page.locator('[data-select="sample-1"]')).toBeChecked();
 await page.getByRole('searchbox').fill('');
 await expect(page.locator('[data-select="sample-2"]')).toBeChecked();
 await expect(page.locator('#count')).toContainText('2 selected');
 await page.getByRole('button',{name:'Compact list view',exact:true}).click();
 await page.screenshot({path:info.outputPath('list-desktop.png'),fullPage:true});
 await page.setViewportSize({width:390,height:844});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:info.outputPath('list-mobile.png'),fullPage:true});
 await page.getByRole('button',{name:'Design your document'}).click();
 await expect(page.locator('.order-item')).toHaveCount(2);
 await page.getByRole('button',{name:'Preview document'}).click();
 await expect(page.getByRole('button',{name:'Download PDF'})).toBeEnabled({timeout:60000});
});

test('sharp PDF preview adapts to Retina, resizing and navigation',async({browser},info)=>{
 const context=await browser.newContext({viewport:{width:1800,height:1100},deviceScaleFactor:3});
 const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
 try{
  await page.goto('/tools/artwork-pdf/');
  await page.locator('[data-select="sample-1"]').check();
  await page.getByRole('button',{name:'Design your document'}).click();
  await page.getByRole('button',{name:'Preview document'}).click();
  const canvas=page.locator('.pdf-page canvas').first();
  await expect(canvas).toHaveAttribute('data-rendered','true',{timeout:30000});
  expect(await canvas.evaluate(element=>element.width/element.getBoundingClientRect().width)).toBeGreaterThanOrEqual(2.99);
  await canvas.screenshot({path:info.outputPath('retina-preview.png')});
  await page.setViewportSize({width:390,height:844});
  await expect.poll(()=>canvas.evaluate(element=>element.width)).toBe(1920);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.getByRole('tab',{name:'Artworks'}).click();
  await page.getByRole('tab',{name:'Preview'}).click();
  await expect(canvas).toHaveAttribute('data-rendered','true',{timeout:30000});
  await page.getByRole('tab',{name:'Artworks'}).click();
  await page.getByText('Import guide',{exact:true}).click();
  await expect(page.locator('.import-guide code')).toHaveText(['artist','title']);
  await expect(page.getByRole('button',{name:'Sample CSV'})).toBeVisible();
  expect(errors).toEqual([]);
 }finally{await context.close();}
});
