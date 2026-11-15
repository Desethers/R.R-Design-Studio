import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const studio=path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dashboard=process.env.GALLERY_OS_DASHBOARD || path.resolve(studio, '../gallery-OS/.worktrees/conversations-crm/dashboard');
const next=path.join(dashboard, 'node_modules/next/dist/bin/next');
if(!existsSync(next)) {
  console.error(`Gallery OS dashboard not found at ${dashboard}. Set GALLERY_OS_DASHBOARD to its dashboard directory.`);
  process.exit(1);
}
console.log(`Gallery OS alias → ${dashboard}\nAssistant: http://localhost:3010/studio/assistant`);
const child=spawn(process.execPath, [next,'dev','--hostname','localhost','--port','3010'], {cwd:dashboard, stdio:'inherit'});
for(const signal of ['SIGINT','SIGTERM']) process.on(signal,()=>child.kill(signal));
child.on('exit',code=>process.exit(code ?? 0));
