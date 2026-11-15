import { getClient } from '../clients.js';
import { sampleArtworks } from './data.js';
import { parseInventory, filterArtworks, sampleCSV } from './inventory.js';
import { layouts } from './templates.js';
import { generateDocument } from './pdf.js';

const root=document.querySelector('#tool-app');
const escape=value=>String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let config;
try {config=getClient(new URLSearchParams(location.search).get('client') || 'studio');}
catch(error){root.innerHTML=`<main class="placeholder"><h1>Client configuration</h1><p>${escape(error.message)}</p></main>`;throw error;}
let artworks=structuredClone(sampleArtworks),selected=[],query='',view='artworks',message='',error=false,busy=false,revision=0,documentResult=null,pdfURL='',pdfTask=null,renderToken=0;
const objectURLs=new Set(),localImages=new Map();
const settings={galleryName:config.galleryName,logo:config.logo,typography:config.typography,language:config.language,layout:config.defaultLayout,showPrices:config.showPrices,cover:false,documentTitle:''};
const nameOf=value=>{try{return decodeURIComponent(value.split('/').pop()).normalize('NFC');}catch{return value;}};
const imageOf=item=>localImages.get(nameOf(item.image)) || (/^https?:|^\//i.test(item.image)?item.image:'');
const chosen=()=>selected.map(id=>artworks.find(a=>a.id===id)).filter(Boolean);
function invalidate(){revision++;documentResult=null;pdfTask?.destroy();pdfTask=null;if(pdfURL)URL.revokeObjectURL(pdfURL);pdfURL='';}
function tell(text,isError=false){message=text;error=isError;const status=root.querySelector('.status');if(status){status.textContent=text;status.classList.toggle('error',isError);}}
function fileButton(label,id,accept,multiple=false){return `<label class="file-label">${label}<input class="visually-hidden" type="file" id="${id}" accept="${accept}" ${multiple?'multiple':''}></label>`;}
function cards(){
 const list=filterArtworks(artworks,query);
 return list.length?list.map(item=>`<article class="art-card"><label class="art-choice"><input type="checkbox" data-select="${item.id}" ${selected.includes(item.id)?'checked':''} aria-label="Select ${escape(item.artist)}, ${escape(item.title)}"><span class="art-image ${imageOf(item)?'':'no-image'}"><img src="${escape(imageOf(item))}" alt="${escape(item.title)}" loading="lazy"><span class="image-empty">${item.image?'Attach image':'No image supplied'}</span></span><span class="art-meta"><strong>${escape(item.artist)}</strong><span class="title">${escape(item.title)}${item.year?`, ${escape(item.year)}`:''}</span></span></label><p class="art-details">${escape(item.medium)}<br>${escape(item.dimensions)}</p><p class="art-price">${escape(item.price || 'Price on request')}</p></article>`).join(''):`<p class="empty">No artworks match “${escape(query)}”.</p>`;
}
function artworkView(){return `
  <div class="inventory-controls">
    <input type="search" id="search" aria-label="Search artworks" placeholder="Search artworks…" value="${escape(query)}">
    <div class="actions">${fileButton('Import CSV','csv','text/csv,.csv')}${fileButton('Attach images','images','image/jpeg,image/png,image/webp',true)}</div>
  </div>
  <details class="import-help"><summary>Import guide & sample</summary>
    <p class="import-note">${artworks[0]?.id.startsWith('sample')?'Sample inventory · Prices are illustrative, not valuations. ':''}CSV columns: artist, title, year, medium, dimensions, price, image. Attach matching image filenames. Remote image hosts must allow CORS. This session resets on reload.</p>
    <div class="actions"><button data-action="sample-csv">Sample CSV ↓</button><button data-action="reset">Load sample inventory</button></div>
  </details>
  <div class="selection-line"><span id="count">${selected.length} selected · ${artworks.length} artworks</span><button data-action="select-visible">Select visible</button><button data-action="clear">Clear selection</button></div>
  <div class="art-grid" id="art-grid">${cards()}</div>
  <div class="bottom-bar"><strong id="bottom-count">${selected.length} selected</strong><button class="primary" data-action="design" ${!selected.length?'disabled':''}>Design your document →</button></div>`;}
function designView(){return `<div class="section-head"><div><h2>Make it yours</h2><p class="muted">A few decisions. A document that feels considered.</p></div></div><div class="design-grid"><div><div class="settings-group"><h3>Gallery identity</h3><label class="field"><span>Gallery name</span><input id="galleryName" data-setting="galleryName" maxlength="100" value="${escape(settings.galleryName)}"></label><label class="field"><span>Document title</span><input data-setting="documentTitle" maxlength="160" placeholder="${settings.language==='fr'?'Sélection d’œuvres':'Selected works'}" value="${escape(settings.documentTitle)}"></label><div class="logo-actions">${fileButton('Upload logo','logo','image/png,image/jpeg,image/webp')}<button data-action="remove-logo" ${!settings.logo?'disabled':''}>Remove logo</button></div>${settings.logo?`<img class="logo-thumb" src="${escape(settings.logo)}" alt="Gallery logo">`:''}<p class="field-note">PNG, JPEG or WebP. Up to 20 MB. Identity is applied to every page.</p><label class="field"><span>Typography</span><select data-setting="typography"><option value="sans" ${settings.typography==='sans'?'selected':''}>Noto Sans · Modern</option><option value="serif" ${settings.typography==='serif'?'selected':''}>Noto Serif · Editorial</option></select></label><label class="field"><span>Document language</span><select data-setting="language"><option value="en" ${settings.language==='en'?'selected':''}>English</option><option value="fr" ${settings.language==='fr'?'selected':''}>Français</option></select></label></div><div class="settings-group"><h3>PDF layout · A4 portrait</h3><div class="layout-options">${layouts.map(l=>`<label class="layout-option"><input type="radio" name="layout" data-setting="layout" value="${l.id}" ${l.id===settings.layout?'checked':''}><span>${l.name}<small>${l.description}</small></span></label>`).join('')}</div><label class="toggle"><input type="checkbox" data-setting="showPrices" ${settings.showPrices?'checked':''}>Show prices in PDF</label><label class="toggle"><input type="checkbox" data-setting="cover" ${settings.cover?'checked':''}>Include a cover page</label></div></div><div><h3>Selection order <span class="muted">(${selected.length})</span></h3><p class="field-note">This is the order of artworks in your PDF.</p><ol class="order-list">${chosen().map((a,i)=>`<li class="order-item">${imageOf(a)?`<img src="${escape(imageOf(a))}" alt="">`:''}<div class="order-info">${escape(a.artist)}<span>${escape(a.title)}</span></div><div class="order-actions"><button data-move="${i}" data-direction="-1" aria-label="Move ${escape(a.title)} up" ${i===0?'disabled':''}>↑</button><button data-move="${i}" data-direction="1" aria-label="Move ${escape(a.title)} down" ${i===selected.length-1?'disabled':''}>↓</button><button data-remove="${a.id}" aria-label="Remove ${escape(a.title)}">×</button></div></li>`).join('') || '<li class="empty">Choose artworks in the Artworks view.</li>'}</ol></div></div><div class="bottom-bar"><div><strong>${selected.length} artworks</strong><p>Images keep their original proportions.</p></div><button class="primary" data-action="preview" ${!selected.length?'disabled':''}>Preview document →</button></div>`;}
function previewView(){return `<div class="section-head"><div><h2>Your document</h2><p class="muted" id="pdf-summary">${documentResult?`${documentResult.pageCount} pages · ${(documentResult.bytes.length/1024/1024).toFixed(1)} MB · A4`:'Generate a PDF to see the exact document.'}</p></div><div class="actions"><button data-action="generate" ${busy||!selected.length?'disabled':''}>${busy?'Generating…':'Generate PDF'}</button><button class="primary" data-action="download" ${!documentResult||busy?'disabled':''}>Download PDF ↓</button></div></div><div id="pdf-warnings">${documentResult?.warnings.length?`<ul class="preview-warnings">${documentResult.warnings.map(w=>`<li>${escape(w)}</li>`).join('')}</ul>`:''}</div><div class="preview-stage" id="preview-stage">${documentResult?'':`<div class="preview-empty"><h3>${busy?'Preparing your document…':'A selection, ready to share.'}</h3><p>Preview uses the same PDF as your download.<br>${selected.length?`${selected.length} artworks selected.`:'Choose artworks to begin.'}</p></div>`}</div>`;}
function render(){
 renderToken++;
 root.innerHTML=`<main class="tool-shell"><header class="tool-header"><h1>Artwork PDF Generator</h1><div class="client-label">${escape(settings.galleryName)}</div></header><nav class="tabs" role="tablist" aria-label="PDF generator views">${['artworks','design','preview'].map(tab=>`<button role="tab" id="tab-${tab}" aria-controls="view-panel" aria-selected="${tab===view}" data-tab="${tab}">${tab[0].toUpperCase()+tab.slice(1)}</button>`).join('')}</nav><div role="status" aria-live="polite" class="status ${error?'error':''}">${escape(message)}</div><section id="view-panel" role="tabpanel" aria-labelledby="tab-${view}">${view==='artworks'?artworkView():view==='design'?designView():previewView()}</section></main>`;
 if(view==='preview'&&documentResult){const token=renderToken;renderPDF().catch(e=>{if(token===renderToken)tell(`Preview could not render: ${e.message}. The PDF can still be downloaded.`,true);});}
}
let pdfjs;
async function renderPDF(){
 const token=renderToken,result=documentResult;if(!result)return;
 pdfjs ||= await import('../../../node_modules/pdfjs-dist/build/pdf.mjs');
 pdfjs.GlobalWorkerOptions.workerSrc=new URL('../../../node_modules/pdfjs-dist/build/pdf.worker.mjs',import.meta.url).href;
 const task=pdfjs.getDocument({data:result.bytes.slice()});
 const pdf=await task.promise;
 if(token!==renderToken){task.destroy();return;}
 pdfTask?.destroy();pdfTask=task;
 const stage=root.querySelector('#preview-stage');
 for(let n=1;n<=pdf.numPages;n++){
  if(token!==renderToken)return;
  const page=await pdf.getPage(n),viewport=page.getViewport({scale:1.5});
  const figure=document.createElement('figure');figure.className='pdf-page';
  const canvas=document.createElement('canvas');canvas.width=viewport.width;canvas.height=viewport.height;
  canvas.setAttribute('aria-label',`PDF page ${n} of ${pdf.numPages}`);
  const caption=document.createElement('figcaption');caption.textContent=`${n} / ${pdf.numPages}`;
  figure.append(canvas,caption);stage.append(figure);
  await page.render({canvasContext:canvas.getContext('2d'),viewport}).promise;
 }
}
async function generate(){
 if(busy)return;
 if(!selected.length){tell('Select at least one artwork.',true);return;}
 const version=revision;busy=true;view='preview';tell('');render();
 try{
  const result=await generateDocument(chosen().map(a=>({...a,image:imageOf(a)})),config,{...settings});
  if(version!==revision){tell('The selection or settings changed. Generate the updated document.');return;}
  if(pdfURL)URL.revokeObjectURL(pdfURL);
  documentResult=result;pdfURL=URL.createObjectURL(new Blob([result.bytes],{type:'application/pdf'}));
  tell(result.warnings.length?'PDF ready. Review the image notices below.':'PDF ready. Preview and download are identical.');
 }catch(e){tell(e.message || 'PDF generation failed. Please try again.',true);}
 finally{busy=false;render();}
}
function saveBlob(blob,name){const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),10000);}
function updateSelection(){
 const count=root.querySelector('#count');if(count)count.textContent=`${selected.length} selected · ${artworks.length} artworks`;
 const bottom=root.querySelector('#bottom-count');if(bottom)bottom.textContent=`${selected.length} selected`;
 const next=root.querySelector('[data-action="design"]');if(next)next.disabled=!selected.length;
}
root.addEventListener('error',e=>{if(e.target.tagName==='IMG')e.target.closest('.art-image')?.classList.add('no-image');},true);
root.addEventListener('input',e=>{if(e.target.id==='search'){query=e.target.value;root.querySelector('#art-grid').innerHTML=cards();}});
root.addEventListener('keydown',e=>{if(e.target.matches('[role=tab]')&&['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();const tabs=['artworks','design','preview'];view=tabs[(tabs.indexOf(view)+(e.key==='ArrowRight'?1:2))%3];render();root.querySelector(`#tab-${view}`).focus();}});
root.addEventListener('click',async e=>{
 const tab=e.target.closest('[data-tab]');if(tab){view=tab.dataset.tab;render();return;}
 const move=e.target.closest('[data-move]');if(move){const i=Number(move.dataset.move),j=i+Number(move.dataset.direction);[selected[i],selected[j]]=[selected[j],selected[i]];invalidate();render();return;}
 const remove=e.target.closest('[data-remove]');if(remove){selected=selected.filter(id=>id!==remove.dataset.remove);invalidate();render();return;}
 const action=e.target.closest('[data-action]')?.dataset.action;
 if(action==='design'){view='design';tell('');render();}
 if(action==='preview'||action==='generate')await generate();
 if(action==='download'&&documentResult){const name=(settings.galleryName || 'gallery').normalize('NFD').replace(/\p{Diacritic}/gu,'').replace(/[^a-z0-9]+/gi,'-').replace(/^-|-$/g,'').toLowerCase();saveBlob(new Blob([documentResult.bytes],{type:'application/pdf'}),`${name}-selected-works.pdf`);}
 if(action==='sample-csv')saveBlob(new Blob([sampleCSV(sampleArtworks)],{type:'text/csv;charset=utf-8'}),'artwork-inventory-sample.csv');
 if(action==='select-visible'){const ids=[...new Set([...selected,...filterArtworks(artworks,query).map(a=>a.id)])];if(ids.length>100){tell('Select up to 100 artworks per PDF. Narrow your search first.',true);return;}selected=ids;invalidate();render();}
 if(action==='clear'){selected=[];invalidate();render();}
 if(action==='reset'){artworks=structuredClone(sampleArtworks);selected=[];query='';invalidate();tell('Sample inventory loaded.');render();}
 if(action==='remove-logo'){settings.logo='';invalidate();render();}
});
async function readImage(file){
 if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw Error('Use PNG, JPEG or WebP image files.');
 if(file.size>20*1024*1024)throw Error(`${file.name} exceeds 20 MB.`);
 const bitmap=await createImageBitmap(file);bitmap.close();
 const url=URL.createObjectURL(file);objectURLs.add(url);return url;
}
root.addEventListener('change',async e=>{
 const input=e.target;
 if(input.dataset.select){
  if(input.checked&&selected.length>=100){input.checked=false;tell('Select up to 100 artworks per PDF.',true);return;}
  selected=input.checked?[...selected,input.dataset.select]:selected.filter(id=>id!==input.dataset.select);invalidate();updateSelection();
 }
 if(input.dataset.setting){settings[input.dataset.setting]=input.type==='checkbox'?input.checked:input.value;invalidate();tell('Settings updated. Generate a new preview to apply them.');}
 if(input.id==='csv'&&input.files[0]){
  try{if(input.files[0].size>5*1024*1024)throw Error('CSV files must be smaller than 5 MB.');const next=parseInventory(await input.files[0].text());artworks=next;selected=[];query='';invalidate();tell(`${next.length} artworks imported. Select your works to begin.`);render();}
  catch(err){tell(err.message,true);input.value='';}
 }
 if(input.id==='images'){
  try{for(const file of input.files)localImages.set(file.name.normalize('NFC'),await readImage(file));invalidate();tell(`${input.files.length} images attached. Filenames are matched to the CSV image column.`);render();}
  catch(err){invalidate();tell(err.message,true);render();}
 }
 if(input.id==='logo'&&input.files[0]){
  try{settings.logo=await readImage(input.files[0]);invalidate();tell('Logo updated.');render();}catch(err){tell(err.message,true);}
 }
});
window.addEventListener('pagehide',()=>{for(const url of objectURLs)URL.revokeObjectURL(url);if(pdfURL)URL.revokeObjectURL(pdfURL);});
render();
