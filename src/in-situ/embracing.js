import { embracingImages as images } from './embracing-data.js';

const gallery = document.querySelector('.eg-gallery');
const gridToggle = document.querySelector('.eg-grid-toggle');
const stage = document.querySelector('.eg-stage');
const caption = document.querySelector('[data-caption]');
const zoomScale = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--eg-zoom-scale')) || 1;
let active = 1;
let zoomedItem = null;
let zoomPreview = null;
let closingZoom = false;
let previewScrollLeft = 0;
let scrollFrame = 0;
let gridViewer = null;
const fromHash = () => {
  const match = location.hash.match(/^#oeuv-(\d+)$/);
  return match ? Math.max(0, Math.min(images.length - 1, Number(match[1]) - 1)) : 1;
};
const cardLabel = (index, zoomed = false) => `${zoomed ? 'Réduire' : 'Agrandir'} l’image ${index + 1} sur ${images.length} : ${images[index].alt}`;
const carousel = document.createElement('div');
carousel.className = 'eg-carousel';
const cards = images.map((item, index) => {
  const card = document.createElement('figure');
  const image = document.createElement('img');
  card.className = 'eg-carousel-item';
  card.dataset.image = String(index);
  card.tabIndex = 0;
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', cardLabel(index));
  card.setAttribute('aria-pressed', 'false');
  image.src = item.image;
  image.alt = item.alt;
  image.loading = 'lazy';
  card.append(image);
  card.addEventListener('pointerleave', () => card.classList.remove('is-zoom-settling'));
  return card;
});
carousel.append(...cards);
stage.append(carousel);

function positionZoomPreview() {
  if (!zoomedItem || !zoomPreview) return;
  const card = zoomedItem.getBoundingClientRect();
  const stageRect = stage.getBoundingClientRect();
  const width = zoomedItem.offsetWidth;
  const height = zoomedItem.offsetHeight;
  // Rectangles are viewport pixels, while absolute positioning uses layout pixels.
  const pageScale = card.width / width || 1;
  zoomPreview.style.left = `${(card.left + card.width / 2 - stageRect.left) / pageScale - width / 2}px`;
  zoomPreview.style.top = `${(card.bottom - stageRect.top) / pageScale - height}px`;
  zoomPreview.style.width = `${width}px`;
  zoomPreview.style.height = `${height}px`;
  previewScrollLeft = carousel.scrollLeft;
  zoomPreview.style.translate = '0 0';
}

function followCarouselScroll() {
  if (!zoomPreview || scrollFrame) return;
  scrollFrame = requestAnimationFrame(() => {
    scrollFrame = 0;
    if (zoomPreview) zoomPreview.style.translate = `${previewScrollLeft - carousel.scrollLeft}px 0`;
  });
}

function closeZoom(animate = true) {
  if (!zoomedItem || !zoomPreview) return;
  const source = zoomedItem;
  const preview = zoomPreview;
  const finishClose = () => {
    if (zoomedItem !== source || zoomPreview !== preview) return;
    zoomedItem = null;
    zoomPreview = null;
    closingZoom = false;
    preview.remove();
    carousel.classList.remove('is-zoom-closing');
    source.classList.add('is-zoom-settling');
    source.classList.remove('is-zoom-source', 'is-active');
    source.setAttribute('aria-pressed', 'false');
    source.setAttribute('aria-label', cardLabel(Number(source.dataset.image)));
    carousel.style.removeProperty('--eg-active-gutter');
  };
  if (!animate || !preview.classList.contains('is-open') || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    finishClose();
    return;
  }
  if (closingZoom) return;
  closingZoom = true;
  carousel.classList.add('is-zoom-closing');
  source.classList.remove('is-active');
  carousel.style.removeProperty('--eg-active-gutter');
  preview.classList.add('is-closing');
  preview.classList.remove('is-open');
  preview.addEventListener('transitionend', event => {
    if (event.target === preview && event.propertyName === 'scale' && closingZoom) finishClose();
  }, { once: true });
}

function openZoom(item) {
  if (zoomedItem === item && closingZoom && zoomPreview) {
    closingZoom = false;
    carousel.classList.remove('is-zoom-closing');
    item.classList.add('is-active');
    carousel.style.setProperty('--eg-active-gutter', `${item.offsetWidth * (zoomScale - 1) / 2}px`);
    zoomPreview.classList.remove('is-closing');
    zoomPreview.classList.add('is-open');
    return;
  }
  closeZoom(false);
  zoomedItem = item;
  zoomPreview = document.createElement('figure');
  zoomPreview.className = 'eg-zoom-preview';
  zoomPreview.setAttribute('aria-hidden', 'true');
  const image = item.querySelector('img').cloneNode();
  image.alt = '';
  zoomPreview.append(image);
  item.classList.add('is-zoom-source');
  stage.append(zoomPreview);
  const preview = zoomPreview;
  positionZoomPreview();
  item.classList.add('is-active');
  item.setAttribute('aria-pressed', 'true');
  item.setAttribute('aria-label', cardLabel(Number(item.dataset.image), true));
  carousel.style.setProperty('--eg-active-gutter', `${item.offsetWidth * (zoomScale - 1) / 2}px`);
  preview.addEventListener('click', () => {
    if (closingZoom) openZoom(item);
    else closeZoom();
  });
  preview.addEventListener('wheel', event => {
    const horizontalDelta = event.shiftKey ? event.deltaY : event.deltaX;
    if (!horizontalDelta) return;
    event.preventDefault();
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? carousel.clientWidth : 1;
    carousel.scrollLeft += horizontalDelta * unit;
  }, { passive: false });
  requestAnimationFrame(() => {
    if (zoomPreview === preview) preview.classList.add('is-open');
  });
}

function openGridViewer(item) {
  if (!gridViewer) {
    gridViewer = document.createElement('dialog');
    gridViewer.className = 'eg-grid-viewer';
    gridViewer.setAttribute('aria-label', 'Image agrandie');
    gridViewer.innerHTML = `
      <figure class="eg-grid-viewer__media"><span class="eg-grid-viewer__image">
        <img alt="">
      </span></figure>`;
    const hoverCaption = document.createElement('div');
    hoverCaption.className = 'eg-caption eg-grid-viewer__caption';
    hoverCaption.setAttribute('aria-hidden', 'true');
    hoverCaption.hidden = true;
    hoverCaption.innerHTML = '<p></p><p></p>';
    gridViewer.append(hoverCaption);
    gridViewer.addEventListener('click', event => {
      if (event.target !== gridViewer.querySelector('img')) gridViewer.close();
    });
    gridViewer.addEventListener('pointermove', event => {
      if (event.pointerType === 'touch' || event.target !== gridViewer.querySelector('img')) {
        hoverCaption.hidden = true;
        return;
      }
      hoverCaption.hidden = false;
      const bounds = gridViewer.getBoundingClientRect();
      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;
      const gap = 16;
      const edge = 12;
      hoverCaption.style.maxWidth = `${Math.max(48, Math.min(460, innerWidth * .72, innerWidth - event.clientX - gap - edge))}px`;
      const top = y + gap + hoverCaption.offsetHeight > bounds.height - edge
        ? y - gap - hoverCaption.offsetHeight : y + gap;
      hoverCaption.style.left = `${x + gap}px`;
      hoverCaption.style.top = `${Math.max(edge, Math.min(top, bounds.height - hoverCaption.offsetHeight - edge))}px`;
    });
    gridViewer.addEventListener('pointerleave', () => { hoverCaption.hidden = true; });
    gridViewer.addEventListener('close', () => { hoverCaption.hidden = true; });
    document.body.append(gridViewer);
  }
  const source = item.querySelector('img');
  const image = gridViewer.querySelector('img');
  const hoverCaption = gridViewer.querySelector('.eg-grid-viewer__caption');
  hoverCaption.hidden = true;
  hoverCaption.querySelector('p:first-child').textContent = document.querySelector('.eg-information .eg-caption p:first-child').textContent;
  const captionLines = caption.textContent.split('\n');
  if (captionLines[0] === 'Otobong Nkanga, Kicsy Abreu Stable, Beau Disundi, Angyvir Padilla') {
    captionLines[0] = 'Otobong Nkanga, Kicsy Abreu Stable,\nBeau Disundi, Angyvir Padilla';
  }
  hoverCaption.querySelector('p:last-child').textContent = captionLines
    .filter(line => !line.trim().startsWith('Courtesy'))
    .join('\n');
  image.src = source.currentSrc || source.src;
  image.alt = source.alt;
  gridViewer.showModal();
}

function activateCard(item) {
  show(Number(item.dataset.image));
  // The floating zoom preview is positioned for the horizontal carousel.
  // Keep the grid intact by opening its images in a modal instead.
  if (gallery.classList.contains('is-grid')) {
    openGridViewer(item);
    return;
  }
  if (zoomedItem === item && !closingZoom) closeZoom();
  else openZoom(item);
}

carousel.addEventListener('click', event => {
  const item = event.target.closest('.eg-carousel-item');
  if (item) activateCard(item);
});
carousel.addEventListener('keydown', event => {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  const item = event.target.closest('.eg-carousel-item');
  if (!item) return;
  event.preventDefault();
  activateCard(item);
});

function show(index, updateHash = true) {
  active = (index + images.length) % images.length;
  const item = images[active];
  caption.textContent = active === 0 ? '' : item.caption
    .split('\n')
    .filter(line => line !== 'Embracing Grounds, 11 janvier — 28 février 2026')
    .join('\n');
  if (updateHash) history.replaceState(null, '', `#oeuv-${active + 1}`);
}
gridToggle.addEventListener('click', () => {
  closeZoom(false);
  const isGrid = gallery.classList.toggle('is-grid');
  gridToggle.setAttribute('aria-pressed', String(isGrid));
  const label = isGrid ? 'Afficher en carrousel' : 'Afficher en grille';
  gridToggle.setAttribute('aria-label', label);
  gridToggle.title = label;
  if (!isGrid) {
    requestAnimationFrame(() => {
      const current = cards[active];
      carousel.scrollLeft = current.offsetLeft + current.offsetWidth / 2 - carousel.clientWidth / 2;
      const stageRect = stage.getBoundingClientRect();
      const targetY = window.scrollY + stageRect.top + stageRect.height / 2 - window.innerHeight / 2;
      window.scrollTo({ top: Math.max(0, targetY), behavior: 'instant' });
    });
  }
});
addEventListener('hashchange', () => show(fromHash(), false));
addEventListener('keydown', event => {
  if (event.key === 'Escape') closeZoom();
});
carousel.addEventListener('scroll', followCarouselScroll, { passive: true });
addEventListener('resize', () => {
  if (zoomedItem) {
    carousel.style.setProperty('--eg-active-gutter', `${zoomedItem.offsetWidth * (zoomScale - 1) / 2}px`);
    positionZoomPreview();
  }
});
show(fromHash(), false);
// Centre the selected card horizontally without moving the page vertically.
carousel.scrollLeft = cards[active].offsetLeft + cards[active].offsetWidth / 2 - carousel.clientWidth / 2;
