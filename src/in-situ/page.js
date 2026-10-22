import { artists, exhibitions, news, homeUrl, artistUrl, exhibitionUrl } from './data.js';
import { Home, ArtistDetail, ExhibitionDetail, NotFound, ArtworkMetadata, escapeHtml } from './components.js';

const params = new URLSearchParams(location.search);
const artistId = params.get('artist');
const exhibitionId = params.get('exhibition');
const artist = artists.find(item => item.id === artistId && item.exhibition);
const exhibition = exhibitions.find(item => item.id === exhibitionId);
const main = document.querySelector('#main');
if (artistId) {
  main.innerHTML = artist ? ArtistDetail(artist) : NotFound();
  document.title = `${artist?.name || 'Page introuvable'} — In Situ · Fabienne Leclerc`;
} else if (exhibitionId) {
  main.innerHTML = exhibition ? ExhibitionDetail(exhibition) : NotFound();
  document.title = `${exhibition?.title || 'Page introuvable'} — In Situ · Fabienne Leclerc`;
} else {
  main.innerHTML = Home();
}

const navTarget = artistId ? '#artistes' : exhibitionId ? '#expositions' : location.hash;
document.querySelectorAll('.desktop-nav a').forEach(link => {
  if (navTarget && new URL(link.href).hash === navTarget) link.setAttribute('aria-current', 'page');
});

// Keep the original anchors working after the shared content is mounted.
if (location.hash) {
  requestAnimationFrame(() => {
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    document.getElementById(id)?.scrollIntoView({ behavior: 'instant' });
  });
}

const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('#mobile-menu');
function closeMenu(returnFocus = false) {
  mobileMenu.hidden = true;
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.querySelector('span').textContent = '+';
  if (returnFocus) menuToggle.focus();
}
menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  mobileMenu.hidden = !open;
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.querySelector('span').textContent = open ? '−' : '+';
});
mobileMenu.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !mobileMenu.hidden) closeMenu(true); });
document.addEventListener('click', event => { if (!mobileMenu.hidden && !event.target.closest('.site-header')) closeMenu(); });
matchMedia('(min-width: 701px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

// Preloaded images overlap in a single preview area; only their opacity changes.
const preview = document.querySelector('.artist-preview');
if (preview) {
  const showPreview = id => {
    const targetArtist = artists.find(item => item.id === id);
    preview.querySelectorAll('[data-preview-id]').forEach(img => {
      const active = img.dataset.previewId === id;
      img.classList.toggle('is-active', active);
      img.setAttribute('aria-hidden', String(!active));
    });
    preview.querySelector('[data-preview-caption]').textContent = targetArtist.exhibition ? targetArtist.name : `${targetArtist.name} — Fiche officielle ↗`;
  };
  document.querySelectorAll('[data-artist-preview]').forEach(link => {
    link.addEventListener('pointerenter', event => { if (event.pointerType !== 'touch') showPreview(link.dataset.artistPreview); });
    link.addEventListener('focus', () => showPreview(link.dataset.artistPreview));
  });
}

const viewer = document.querySelector('[data-viewer]');
if (viewer) {
  const data = exhibitions.find(item => item.id === viewer.dataset.viewer);
  let active = 0;
  const show = direction => {
    active = (active + direction + data.images.length) % data.images.length;
    viewer.querySelectorAll('[data-slide]').forEach(slide => { slide.hidden = Number(slide.dataset.slide) !== active; });
    viewer.querySelector('[data-artwork-metadata]').innerHTML = ArtworkMetadata(data, active);
  };
  viewer.querySelector('[data-viewer-prev]').addEventListener('click', () => show(-1));
  viewer.querySelector('[data-viewer-next]').addEventListener('click', () => show(1));
  viewer.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      show(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });
}

// Read the nearest image to the upper third of the viewport. This handles
// fast scrolling and scrolling back up, without competing observers.
const caption = document.querySelector('[data-sticky-caption]');
if (caption && exhibition) {
  const figures = [...document.querySelectorAll('[data-caption-index]')];
  let queued = false;
  let active = 0;
  function updateCaption() {
    queued = false;
    const line = Math.max(180, innerHeight * .35);
    let nearest = figures[0];
    let distance = Infinity;
    for (const figure of figures) {
      const rect = figure.getBoundingClientRect();
      const current = rect.top <= line && rect.bottom >= line ? 0 : Math.min(Math.abs(rect.top - line), Math.abs(rect.bottom - line));
      if (current < distance) { nearest = figure; distance = current; }
    }
    const next = Number(nearest.dataset.captionIndex);
    if (next !== active) { active = next; caption.innerHTML = ArtworkMetadata(exhibition, active); }
  }
  const schedule = () => { if (!queued) { queued = true; requestAnimationFrame(updateCaption); } };
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  figures.forEach(figure => figure.querySelector('img').addEventListener('load', schedule));
  schedule();
}

const dialog = document.querySelector('.search-dialog');
const search = document.querySelector('#site-search');
const results = document.querySelector('.search-results');
const status = document.querySelector('[data-search-status]');
const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('fr').trim();
const searchItems = [
  ...artists.map(item => ({ title: item.name, type: 'Artiste', href: item.exhibition ? artistUrl(item.id) : item.official })),
  ...exhibitions.map(item => ({ title: item.title, context: item.artist, type: item.label, href: exhibitionUrl(item.id) })),
  ...news.map(item => ({ title: `${item.title} — ${item.place}`, type: 'Actualité', href: item.artistId ? `${artistUrl(item.artistId)}#news` : 'https://www.insituparis.fr/fr/actualites/liste' })),
];
let searchOpener;
function updateSearch() {
  const query = normalize(search.value);
  const found = query ? searchItems.filter(item => normalize(`${item.title} ${item.context || ''}`).includes(query)) : [];
  status.textContent = !query ? 'Rechercher parmi les artistes, expositions et actualités de cette sélection.' : found.length ? `${found.length} résultat${found.length > 1 ? 's' : ''}` : 'Aucun résultat. Essayez un autre nom ou titre.';
  results.innerHTML = found.map(item => `<li><a href="${escapeHtml(item.href)}"><span>${escapeHtml(item.title)}</span><span class="micro">${escapeHtml(item.type)} ↗</span></a></li>`).join('');
}
document.querySelectorAll('[data-search-open]').forEach(button => button.addEventListener('click', () => {
  searchOpener = button.closest('.mobile-menu') ? menuToggle : button;
  closeMenu();
  dialog.showModal();
  updateSearch();
  search.focus();
}));
document.querySelector('[data-search-close]').addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => searchOpener?.focus());
dialog.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    event.preventDefault();
    dialog.close();
  }
});
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
});
search.addEventListener('input', updateSearch);
