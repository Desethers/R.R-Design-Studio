import { getClient } from '../clients.js';
import { sampleArtworks } from './data.js';
import { parseInventory, filterArtworks, sampleCSV } from './inventory.js';
import { layouts } from './templates.js';
import { generateDocument } from './pdf.js';
import { artworkBrowser, artworkViewSwitch } from '../shared/artwork-browser.js';
import { createPDFPreview } from './preview.js';

const root=document.querySelector('#tool-app');
const escape=value=>String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let config;
try {config=getClient(new URLSearchParams(location.search).get('client') || 'studio');}
catch(error){root.innerHTML=`<main class="placeholder"><h1>Client configuration</h1><p>${escape(error.message)}</p></main>`;throw error;}
let artworks=structuredClone(sampleArtworks),selected=[],query='',view='artworks',message='',error=false,busy=false,revision=0,documentResult=null,pdfURL='',pdfTask=null,renderToken=0;
const objectURLs=new Set(),localImages=new Map();
let artworkMode='grid';
const settings={galleryName:config.galleryName,logo:config.logo,typography:config.typography,language:config.language,layout:config.defaultLayout,showPrices:config.showPrices,cover:false,documentTitle:''};
const nameOf=value=>{try{return decodeURIComponent(value.split('/').pop()).normalize('NFC');}catch{return value;}};
const imageOf=item=>localImages.get(nameOf(item.image)) || (/^https?:|^\//i.test(item.image)?item.image:'');
const chosen=()=>selected.map(id=>artworks.find(a=>a.id===id)).filter(Boolean);
function invalidate(){revision++;documentResult=null;pdfTask?.destroy();pdfTask=null;if(pdfURL)URL.revokeObjectURL(pdfURL);pdfURL='';}
function tell(text,isError=false){message=text;error=isError;const status=root.querySelector('.status');if(status){status.textContent=text;status.classList.toggle('error',isError);}}
function fileButton(label,id,accept,multiple=false){return `<label class="file-label">${label}<input class="visually-hidden" type="file" id="${id}" accept="${accept}" ${multiple?'multiple':''}></label>`;}
function resultCount(){
 const count=filterArtworks(artworks,query).length;
 return `${count} ${count===1?'artwork':'artworks'}`;
}
function selectionCount(){return selected.length?`${selected.length} selected`:'Select artworks to start';}
function cards(){
 const list=filterArtworks(artworks,query);
 return list.length?artworkBrowser({items:list,selected,imageOf,escape,mode:artworkMode}):`<p class="empty">No artworks match “${escape(query)}”.</p>`;
}
function artworkView(){return `
  <div class="inventory-controls">
    <div class="inventory-search"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="10.5" cy="10.5" r="7.5"/><path d="m16 16 5 5"/></svg><input type="search" id="search" aria-label="Search artworks" placeholder="Search by artist or title" value="${escape(query)}"><button type="button" data-action="clear-search" aria-label="Clear search" ${query?'':'hidden'}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button></div>
    <div class="actions">${fileButton('Import CSV','csv','text/csv,.csv')}${fileButton('Attach images','images','image/jpeg,image/png,image/webp',true)}</div>
    <details class="import-help"><summary>Import guide</summary><div class="import-guide">
    <dl><div><dt>Required columns</dt><dd><code>artist</code><code>title</code></dd></div><div><dt>Images</dt><dd>Attach files with matching names.</dd></div></dl>
    <div class="actions"><button data-action="sample-csv">Sample CSV ↓</button><button data-action="reset">Load sample inventory</button></div>
    <small>${artworks[0]?.id.startsWith('sample')?'Sample data · Illustrative prices · ':''}Changes stay in this tab.</small>
    </div></details>
  </div>
  <div class="selection-line"><span id="result-count" aria-live="polite">${resultCount()}</span><div class="selection-actions"><button data-action="select-visible">Select visible</button><button data-action="clear" ${selected.length?'':'disabled'}>Clear selection</button>${artworkViewSwitch(artworkMode)}</div></div>
  <div class="artwork-browser ${artworkMode==='grid'?'art-grid':'art-list'}" id="art-grid">${cards()}</div>
  <div class="bottom-bar artwork-selection-bar"><strong id="count" aria-live="polite">${selectionCount()}</strong><button class="primary" data-action="design" ${!selected.length?'disabled':''}>Design your document →</button></div>`;}
function designView(){return `<div class="section-head"><div><h2>Document settings</h2></div></div><div class="design-grid"><div><div class="settings-group"><h3>Gallery identity</h3><label class="field"><span>Gallery name</span><input id="galleryName" data-setting="galleryName" maxlength="100" value="${escape(settings.galleryName)}"></label><label class="field"><span>Document title</span><input data-setting="documentTitle" maxlength="160" placeholder="${settings.language==='fr'?'Sélection d’œuvres':'Selected works'}" value="${escape(settings.documentTitle)}"></label><div class="logo-actions">${fileButton('Upload logo','logo','image/png,image/jpeg,image/webp')}<button data-action="remove-logo" ${!settings.logo?'disabled':''}>Remove logo</button></div>${settings.logo?`<img class="logo-thumb" src="${escape(settings.logo)}" alt="Gallery logo">`:''}<p class="field-note">PNG, JPEG or WebP. Up to 20 MB. Identity is applied to every page.</p><label class="field"><span>Typography</span><select data-setting="typography"><option value="sans" ${settings.typography==='sans'?'selected':''}>Noto Sans · Modern</option><option value="serif" ${settings.typography==='serif'?'selected':''}>Noto Serif · Editorial</option></select></label><label class="field"><span>Document language</span><select data-setting="language"><option value="en" ${settings.language==='en'?'selected':''}>English</option><option value="fr" ${settings.language==='fr'?'selected':''}>Français</option></select></label></div><div class="settings-group"><h3>PDF layout · A4 portrait</h3><div class="layout-options">${layouts.map(l=>`<label class="layout-option"><input type="radio" name="layout" data-setting="layout" value="${l.id}" ${l.id===settings.layout?'checked':''}><span>${l.name}<small>${l.description}</small></span></label>`).join('')}</div><label class="toggle"><input type="checkbox" data-setting="showPrices" ${settings.showPrices?'checked':''}>Show prices in PDF</label><label class="toggle"><input type="checkbox" data-setting="cover" ${settings.cover?'checked':''}>Include a cover page</label></div></div><div><h3>Selection order <span class="muted">(${selected.length})</span></h3><ol class="order-list">${chosen().map((a,i)=>`<li class="order-item">${imageOf(a)?`<img src="${escape(imageOf(a))}" alt="">`:''}<div class="order-info">${escape(a.artist)}<span>${escape(a.title)}</span></div><div class="order-actions"><button data-move="${i}" data-direction="-1" aria-label="Move ${escape(a.title)} up" ${i===0?'disabled':''}>↑</button><button data-move="${i}" data-direction="1" aria-label="Move ${escape(a.title)} down" ${i===selected.length-1?'disabled':''}>↓</button><button data-remove="${a.id}" aria-label="Remove ${escape(a.title)}">×</button></div></li>`).join('') || '<li class="empty">Choose artworks in the Artworks view.</li>'}</ol></div></div><div class="bottom-bar"><div><strong>${selected.length} artworks</strong><p>Images keep their original proportions.</p></div><button class="primary" data-action="preview" ${!selected.length?'disabled':''}>Preview document →</button></div>`;}
function previewView(){return `<div class="section-head"><div><h2>Your document</h2><p class="muted" id="pdf-summary">${documentResult?`${documentResult.pageCount} pages · ${(documentResult.bytes.length/1024/1024).toFixed(1)} MB · A4`:'Generate a PDF to see the exact document.'}</p></div><div class="actions"><button data-action="generate" ${busy||!selected.length?'disabled':''}>${busy?'Generating…':'Generate PDF'}</button><button class="primary" data-action="download" ${!documentResult||busy?'disabled':''}>Download PDF ↓</button></div></div><div id="pdf-warnings">${documentResult?.warnings.length?`<ul class="preview-warnings">${documentResult.warnings.map(w=>`<li>${escape(w)}</li>`).join('')}</ul>`:''}</div><div class="preview-stage" id="preview-stage">${documentResult?'':`<div class="preview-empty"><h3>${busy?'Preparing your document…':'PDF preview'}</h3><p>Preview uses the same PDF as your download.<br>${selected.length?`${selected.length} artworks selected.`:'Choose artworks to begin.'}</p></div>`}</div>`;}
function render(){
 pdfTask?.destroy();pdfTask=null;
 renderToken++;
 root.innerHTML=`<main class="tool-shell"><header class="tool-header"><h1>Artwork PDF Generator</h1><div class="client-label">${escape(settings.galleryName)}</div></header><nav class="tabs" role="tablist" aria-label="PDF generator views">${['artworks','design','preview'].map(tab=>`<button role="tab" id="tab-${tab}" aria-controls="view-panel" aria-selected="${tab===view}" data-tab="${tab}">${tab[0].toUpperCase()+tab.slice(1)}</button>`).join('')}</nav><div role="status" aria-live="polite" class="status ${error?'error':''}">${escape(message)}</div><section id="view-panel" role="tabpanel" aria-labelledby="tab-${view}">${view==='artworks'?artworkView():view==='design'?designView():previewView()}</section></main>`;
 if(view==='preview'&&documentResult){const token=renderToken;renderPDF().catch(e=>{if(token===renderToken)tell(`Preview could not render: ${e.message}. The PDF can still be downloaded.`,true);});}
}
async function renderPDF(){
 const token=renderToken,result=documentResult;if(!result)return;
 const stage=root.querySelector('#preview-stage');
 pdfTask=createPDFPreview({bytes:result.bytes,stage,onError:error=>{if(token===renderToken)tell(`Preview could not render: ${error.message}. The PDF can still be downloaded.`,true);}});
 await pdfTask.ready;
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
 const count=root.querySelector('#count');if(count)count.textContent=selectionCount();
 const results=root.querySelector('#result-count');if(results)results.textContent=resultCount();
 const clear=root.querySelector('[data-action="clear"]');if(clear)clear.disabled=!selected.length;
 const next=root.querySelector('[data-action="design"]');if(next)next.disabled=!selected.length;
}
root.addEventListener('error',e=>{if(e.target.tagName==='IMG')e.target.closest('.art-image')?.classList.add('no-image');},true);
root.addEventListener('input',e=>{if(e.target.id==='search'){query=e.target.value;root.querySelector('#art-grid').innerHTML=cards();root.querySelector('[data-action="clear-search"]').hidden=!query;updateSelection();}});
root.addEventListener('keydown',e=>{if(e.target.matches('[role=tab]')&&['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();const tabs=['artworks','design','preview'];view=tabs[(tabs.indexOf(view)+(e.key==='ArrowRight'?1:2))%3];render();root.querySelector(`#tab-${view}`).focus();}});
root.addEventListener('click',async e=>{
 const display=e.target.closest('[data-artwork-view]');if(display){artworkMode=display.dataset.artworkView;render();root.querySelector(`[data-artwork-view="${artworkMode}"]`).focus();return;}
 const tab=e.target.closest('[data-tab]');if(tab){view=tab.dataset.tab;render();return;}
 const move=e.target.closest('[data-move]');if(move){const i=Number(move.dataset.move),j=i+Number(move.dataset.direction);[selected[i],selected[j]]=[selected[j],selected[i]];invalidate();render();return;}
 const remove=e.target.closest('[data-remove]');if(remove){selected=selected.filter(id=>id!==remove.dataset.remove);invalidate();render();return;}
 const action=e.target.closest('[data-action]')?.dataset.action;
 if(action==='clear-search'){query='';root.querySelector('#search').value='';root.querySelector('#art-grid').innerHTML=cards();root.querySelector('[data-action="clear-search"]').hidden=true;updateSelection();root.querySelector('#search').focus();}
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
window.addEventListener('pagehide',()=>{pdfTask?.destroy();for(const url of objectURLs)URL.revokeObjectURL(url);if(pdfURL)URL.revokeObjectURL(pdfURL);});
render();
