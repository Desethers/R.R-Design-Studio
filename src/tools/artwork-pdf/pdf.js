import { layoutFor, labels } from './templates.js';

const fonts = new Map();
const imageCache = new Map();
const fontURL = type => new URL(`../shared/assets/Noto${type === 'serif' ? 'Serif' : 'Sans'}-Regular.ttf`, import.meta.url);
const assetURL = value => new URL(value, document.baseURI).href;
async function raster(value) {
  const response = await fetch(assetURL(value), { signal: AbortSignal.timeout(12000) });
  if (!response.ok) throw new Error('Image could not be loaded');
  const blob = await response.blob();
  if (blob.size > 20 * 1024 * 1024) throw new Error('Image exceeds 20 MB');
  const bitmap = await createImageBitmap(blob);
  const scale = Math.min(1, 2200 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext('2d');
  context.fillStyle = '#fff'; context.fillRect(0,0,canvas.width,canvas.height);
  context.drawImage(bitmap,0,0,canvas.width,canvas.height); bitmap.close();
  const output = await new Promise(resolve => canvas.toBlob(resolve,'image/jpeg',0.94));
  if (!output) throw new Error('Image conversion failed');
  return new Uint8Array(await output.arrayBuffer());
}
export function wrapText(text, font, size, maxWidth) {
  const lines = [];
  for (const paragraph of String(text).split(/\r?\n/)) {
    let line = '';
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      if (font.widthOfTextAtSize(word,size) > maxWidth) {
        if (line) { lines.push(line); line = ''; }
        for (const char of word) {
          if (font.widthOfTextAtSize(line+char,size) > maxWidth) { lines.push(line); line=''; }
          line += char;
        }
      } else if (line && font.widthOfTextAtSize(`${line} ${word}`,size) > maxWidth) { lines.push(line); line=word; }
      else line += (line ? ' ' : '') + word;
    }
    lines.push(line);
  }
  return lines;
}
export async function generateDocument(artworks, config, settings) {
  if (!artworks.length) throw new Error('Select at least one artwork.');
  if (artworks.length > 100) throw new Error('Select up to 100 artworks per PDF.');
  const { PDFDocument, rgb } = globalThis.PDFLib;
  const doc = await PDFDocument.create(); doc.registerFontkit(globalThis.fontkit);
  if (!fonts.has(settings.typography)) {
    fonts.set(settings.typography, fetch(fontURL(settings.typography)).then(r=>{if(!r.ok)throw Error('PDF font could not be loaded.');return r.arrayBuffer();}));
  }
  let fontBytes;
  try { fontBytes = await fonts.get(settings.typography); } catch (error) { fonts.delete(settings.typography); throw error; }
  const font = await doc.embedFont(fontBytes, { subset: true });
  const supported = new Set(font.getCharacterSet());
  const ink=rgb(.12,.12,.11), muted=rgb(.45,.45,.42), line=rgb(.87,.87,.84);
  const text=(page,value,x,y,size=10,color=ink)=>{
    const clean = String(value).replace(/\t/g,' ').replace(/[\u0000-\u0008\u000b-\u001f]/g,'');
    const bad=[...clean].find(c=>!supported.has(c.codePointAt(0)));
    if(bad)throw Error(`The PDF font does not support “${bad}”. Choose another font or edit this text.`);
    page.drawText(clean,{x,y,size,font,color});
  };
  const lang=labels[settings.language] || labels.en;
  const title=settings.documentTitle.trim() || lang.selection;
  doc.setTitle(title);doc.setAuthor(settings.galleryName);doc.setCreator('R.R Studio / Artwork PDF Generator');
  const warnings=[], embedded=new Map();
  async function image(value, label) {
    if (!value) { warnings.push(`${label}: no image supplied.`);return null; }
    if (embedded.has(value)) return embedded.get(value);
    try {
      if (!imageCache.has(value)) imageCache.set(value,raster(value));
      let bytes;
      try { bytes=await imageCache.get(value); } catch(e) { imageCache.delete(value);throw e; }
      const result=await doc.embedJpg(bytes);embedded.set(value,result);return result;
    } catch { warnings.push(`${label}: image unavailable. A labelled placeholder was included. For remote images, the host must allow CORS; you can attach a local copy instead.`);return null; }
  }
  const logo=settings.logo ? await image(settings.logo,'Gallery logo') : null;
  function fit(page,img,x,y,w,h) {
    const scale=Math.min(w/img.width,h/img.height);
    page.drawImage(img,{x:x+(w-img.width*scale)/2,y:y+(h-img.height*scale)/2,width:img.width*scale,height:img.height*scale});
  }
  const galleryLines=wrapText(settings.galleryName || config.galleryName,font,10,400).slice(0,2);
  function addPage() {
    const page=doc.addPage([595.28,841.89]);
    galleryLines.forEach((value,i)=>text(page,value,36,807-i*13,10));
    if(logo)fit(page,logo,493,789,66,29);
    page.drawLine({start:{x:36,y:774},end:{x:559,y:774},thickness:.5,color:line});
    return page;
  }
  if(settings.cover) {
    const page=addPage();
    const titleLines=wrapText(title,font,31,500);
    if(titleLines.length>6)throw Error('Shorten the document title to fit the cover.');
    titleLines.forEach((value,i)=>text(page,value,36,590-i*42,31));
    text(page,`${artworks.length} ${lang.works}`,36,540-titleLines.length*42,11,muted);
  }
  const layout=layoutFor(settings.layout), rows=layout.perPage/layout.columns;
  const gap=24, width=(523-gap*(layout.columns-1))/layout.columns;
  const height=(690-gap*(rows-1))/rows;
  const continuations=[];
  for(let start=0; start<artworks.length; start+=layout.perPage) {
    const page=addPage();
    for(let i=0;i<layout.perPage && start+i<artworks.length;i++) {
      const artwork=artworks[start+i], x=36+(i%layout.columns)*(width+gap);
      const top=756-Math.floor(i/layout.columns)*(height+gap), imageHeight=height*.60;
      const img=await image(artwork.image,`${artwork.artist} / ${artwork.title}`);
      if(img)fit(page,img,x,top-imageHeight,width,imageHeight);
      else { page.drawRectangle({x,y:top-imageHeight,width,height:imageHeight,color:rgb(.96,.96,.95)});text(page,lang.noImage,x+12,top-imageHeight/2,9,muted); }
      let y=top-imageHeight-23;
      const blocks=[];
      const fields=config.artworkFields || ['artist','title','year','medium','dimensions','price'];
      if(fields.includes('artist'))blocks.push({value:artwork.artist,size:layout.perPage===1?15:11});
      if(fields.includes('title'))blocks.push({value:[artwork.title,fields.includes('year')?artwork.year:''].filter(Boolean).join(', '),size:10});
      else if(fields.includes('year'))blocks.push({value:artwork.year,size:10});
      for(const key of fields.filter(f=>!['artist','title','year','image'].includes(f))) {
        if(key==='price'&&!settings.showPrices)continue;
        if(artwork[key])blocks.push({value:key==='price'?`${lang.price}: ${artwork[key]}`:artwork[key],size:9});
      }
      const allLines=blocks.flatMap(block=>wrapText(block.value,font,block.size,width).map(value=>({value,size:block.size})));
      let n=0;
      while(n<allLines.length && y>top-height+10) {const item=allLines[n++];text(page,item.value,x,y,item.size);y-=item.size*1.45;}
      if(n<allLines.length)continuations.push({artwork,lines:allLines.slice(n)});
    }
  }
  // Long records continue on separate pages, never over another artwork or the footer.
  for(const continuation of continuations) {
    let page=addPage(),y=750;
    text(page,lang.continued,36,y,13);y-=25;
    for(const value of wrapText(`${continuation.artwork.artist} / ${continuation.artwork.title}`,font,10,523)) {
      if(y<65){page=addPage();y=750;}text(page,value,36,y,10);y-=15;
    }
    y-=12;
    const pending=continuation.lines.flatMap(item=>wrapText(item.value,font,item.size,523).map(value=>({...item,value})));
    for(const item of pending) {if(y<65){page=addPage();y=750;}text(page,item.value,36,y,item.size);y-=item.size*1.5;}
  }
  const pages=doc.getPages();
  pages.forEach((page,i)=>{text(page,`${i+1} / ${pages.length}`,522,30,8,muted);});
  return { bytes:await doc.save(),pageCount:pages.length,warnings:[...new Set(warnings)] };
}
