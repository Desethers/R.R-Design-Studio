let pdfjsPromise;

// Render at display density with a 1920px minimum. Only pages close to the
// viewport keep their bitmap, so long selections do not exhaust canvas memory.
export function createPDFPreview({bytes,stage,onError}) {
  let disposed=false,loadingTask,observer,resizeObserver,running=false,pdf;
  const pages=[];
  const pixelWidth=entry=>Math.min(3200,Math.max(1920,Math.ceil(entry.canvas.getBoundingClientRect().width*Math.max(2,window.devicePixelRatio||1))));
  function release(entry) {
    if(entry.task)return;
    entry.canvas.width=1;entry.canvas.height=1;entry.renderedWidth=0;
    delete entry.canvas.dataset.rendered;
    entry.canvas.setAttribute('aria-busy','true');
  }
  async function pump() {
    if(running||disposed||!pdf)return;
    running=true;
    try {
      let entry;
      while(!disposed&&(entry=pages.find(p=>p.near&&!p.failed&&p.renderedWidth!==pixelWidth(p)))) {
        let page;
        try {
          page=await pdf.getPage(entry.number);
          if(disposed||!entry.near)continue;
          const width=pixelWidth(entry),base=page.getViewport({scale:1});
          const viewport=page.getViewport({scale:width/base.width});
          entry.canvas.width=Math.ceil(viewport.width);entry.canvas.height=Math.ceil(viewport.height);
          entry.canvas.setAttribute('aria-busy','true');
          entry.task=page.render({canvasContext:entry.canvas.getContext('2d'),viewport});
          await entry.task.promise;
          entry.renderedWidth=width;
          entry.canvas.dataset.rendered='true';
          entry.canvas.setAttribute('aria-busy','false');
        } catch(error) {
          if(!disposed&&error.name!=='RenderingCancelledException'){entry.failed=true;onError(error);}
        } finally {
          entry.task=null;
          if(disposed||!entry.near)release(entry);
          page?.cleanup();
        }
      }
    } finally {running=false;}
  }
  const resize=()=>{void pump();};
  const ready=(async()=>{
    pdfjsPromise ||= import('../../../node_modules/pdfjs-dist/build/pdf.mjs');
    const pdfjs=await pdfjsPromise;
    if(disposed)return;
    pdfjs.GlobalWorkerOptions.workerSrc=new URL('../../../node_modules/pdfjs-dist/build/pdf.worker.mjs',import.meta.url).href;
    loadingTask=pdfjs.getDocument({data:bytes.slice()});
    pdf=await loadingTask.promise;
    if(disposed)return;
    const first=await pdf.getPage(1),base=first.getViewport({scale:1});
    if(disposed)return;
    const fragment=document.createDocumentFragment();
    for(let number=1;number<=pdf.numPages;number++) {
      const figure=document.createElement('figure');figure.className='pdf-page';
      const canvas=document.createElement('canvas');canvas.width=1;canvas.height=1;
      canvas.style.aspectRatio=`${base.width} / ${base.height}`;
      canvas.setAttribute('aria-label',`PDF page ${number} of ${pdf.numPages}`);canvas.setAttribute('aria-busy','true');
      const caption=document.createElement('figcaption');caption.textContent=`${number} / ${pdf.numPages}`;
      figure.append(canvas,caption);fragment.append(figure);
      pages.push({number,figure,canvas,near:false,renderedWidth:0,task:null,failed:false});
    }
    first.cleanup();stage.append(fragment);
    const byFigure=new Map(pages.map(page=>[page.figure,page]));
    observer=new IntersectionObserver(entries=>{
      for(const observed of entries) {
        const entry=byFigure.get(observed.target);entry.near=observed.isIntersecting;
        if(!entry.near){entry.task?.cancel();release(entry);}
      }
      void pump();
    },{rootMargin:'600px 0px'});
    pages.forEach(page=>observer.observe(page.figure));
    resizeObserver=new ResizeObserver(resize);resizeObserver.observe(stage);
    window.addEventListener('resize',resize);
  })();
  return {ready,destroy(){
    disposed=true;observer?.disconnect();resizeObserver?.disconnect();window.removeEventListener('resize',resize);
    pages.forEach(page=>{page.task?.cancel();release(page);});
    loadingTask?.destroy().catch(()=>{});
  }};
}
