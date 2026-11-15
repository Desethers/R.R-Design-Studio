import { galleryOS } from '../gallery-os.js';

const tool = document.body.dataset.tool || 'assistant';
const url = new URL(galleryOS[`${tool}Path`] || galleryOS.assistantPath, galleryOS.origin);
const readyMessage = tool === 'assistant' ? 'gallery-os:assistant-ready' : 'gallery-os:tool-ready';
const frame = document.querySelector('#assistant');
const status = document.querySelector('#connection');
const offline = document.querySelector('#offline');
const link = document.querySelector('#open-source');
link.href = url.href;
let timer, attempt = 0;

function unavailable() {
  status.textContent = '';
  offline.hidden = false;
  frame.hidden = true;
}

window.addEventListener('message', event => {
  if (event.origin !== url.origin || event.source !== frame.contentWindow || event.data?.type !== readyMessage) return;
  clearTimeout(timer);
  offline.hidden = true;
  frame.hidden = false;
  status.textContent = '';
});

async function connect() {
  const current = ++attempt;
  clearTimeout(timer);
  offline.hidden = true;
  status.textContent = 'Connexion à Gallery OS…';
  frame.hidden = true;
  // Probe only network availability. The original page confirms hydration by message.
  try {
    await fetch(url, {mode:'no-cors', cache:'no-store', signal:AbortSignal.timeout(15000)});
    if(current !== attempt) return;
    frame.src = url.href;
    timer = setTimeout(unavailable, 25000);
  } catch {
    if(current === attempt) unavailable();
  }
}
document.querySelector('#retry').addEventListener('click', connect);
connect();
