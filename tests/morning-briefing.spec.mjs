import {test,expect} from '@playwright/test';

test('Morning Briefing embeds the original Gallery OS chat and uses its endpoint',async({page},info)=>{
  let body;
  await page.route('http://localhost:3010/api/conversations/assistant',async route=>{
    body=route.request().postDataJSON();
    await route.fulfill({json:{text:'Test connection confirmed. No gallery records were read.',toolsUsed:[],works:[],people:[]}});
  });
  await page.goto('/library/?area=tools&category=morning-briefing&component=tool-morning-briefing&view=page');
  const host=page.frameLocator('iframe[title="Morning Briefing"]');
  await expect(host.getByRole('heading',{name:'Morning Briefing',exact:true})).toBeVisible();
  const chat=host.frameLocator('#assistant');
  await expect(chat.getByRole('textbox',{name:'Your question'})).toBeVisible({timeout:30000});
  await expect(host.locator('#offline')).toBeHidden();
  await chat.getByRole('textbox',{name:'Your question'}).fill('Test connection only.');
  await chat.getByRole('button',{name:'Send the question'}).click();
  await expect(chat.getByText('Test connection confirmed. No gallery records were read.')).toBeVisible();
  expect(body.messages).toEqual([{role:'user',content:'Test connection only.'}]);
  await page.screenshot({path:info.outputPath('gallery-os-alias.png')});
  await page.setViewportSize({width:390,height:844});
  await expect(chat.getByRole('textbox',{name:'Your question'})).toBeVisible();
});

test('unavailable Gallery OS has a useful local fallback and can reconnect',async({page})=>{
  await page.route('http://localhost:3010/**',route=>route.abort('connectionrefused'));
  await page.goto('/tools/morning-briefing/');
  await expect(page.getByRole('heading',{name:'Gallery OS n’est pas disponible.'})).toBeVisible();
  await expect(page.getByText('npm run dev:gallery-os',{exact:true})).toBeVisible();
  await page.unroute('http://localhost:3010/**');
  await page.getByRole('button',{name:'Réessayer'}).click();
  await expect(page.frameLocator('#assistant').getByRole('textbox',{name:'Your question'})).toBeVisible({timeout:30000});
});
