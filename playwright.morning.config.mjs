import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir:'./tests',testMatch:['morning-briefing.spec.mjs','gallery-data-tools.spec.mjs'],timeout:60000,workers:1,
  use:{baseURL:'http://localhost:3006',viewport:{width:1440,height:1000},headless:true},
  webServer:[
    {command:'npm run dev',url:'http://localhost:3006/library/',reuseExistingServer:true},
    {command:'npm run dev:gallery-os',url:'http://localhost:3010/studio/assistant',reuseExistingServer:true,timeout:120000},
  ],
});
