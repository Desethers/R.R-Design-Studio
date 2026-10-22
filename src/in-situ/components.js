import { artists, exhibitions, news, homeUrl, artistUrl, exhibitionUrl } from './data.js';

export const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const e = escapeHtml;
const count = value => String(value).padStart(2, '0');
const external = (url, label) => `<a class="text-link" href="${e(url)}" target="_blank" rel="noopener">${e(label)} <span aria-hidden="true">↗</span><span class="sr-only"> (nouvel onglet)</span></a>`;
const image = (item, eager = false) => `<img src="${e(item.src)}" alt="${e(item.alt)}" ${item.width ? `width="${item.width}" height="${item.height}"` : ''} loading="${eager ? 'eager' : 'lazy'}" ${eager ? 'fetchpriority="high"' : ''}>`;

export function SectionHeader(label, index, extra = '') {
  return `<header class="section-header"><h2>${e(label)}</h2><span class="micro">${e(index)}</span>${extra}</header>`;
}

export function ExpandableText(label, content, className = '') {
  return `<details class="disclosure ${className}"><summary>${e(label)}<span class="disclosure-symbol" aria-hidden="true"></span></summary><div class="disclosure-content">${content}</div></details>`;
}

export function ArchiveList(items) {
  return `<ol class="archive-list">${items.map(item => `<li><a href="${exhibitionUrl(item.id)}"><span class="meta">${e(item.date || item.label)}</span><span>${e(item.title)}<small>${e(item.artist)}</small></span><span class="micro archive-place">${e(item.place || item.label)}</span><span aria-hidden="true">↗</span></a></li>`).join('')}</ol>`;
}

export function ArtistIndex() {
  const letters = [...new Set(artists.map(artist => artist.letter))];
  return `<section class="editorial-section" id="artistes" aria-labelledby="artists-title">
    <header class="section-header"><h2 id="artists-title">Artistes</h2><span class="micro">Index / ${count(artists.length)}</span>${external('https://www.insituparis.fr/fr/artistes/liste', 'Le roster complet')}</header>
    <div class="artist-index"><div class="index-groups">${letters.map(letter => `<section class="index-group" aria-label="Artistes — ${letter}"><h3 class="micro">${letter}</h3><ul>${artists.filter(artist => artist.letter === letter).map(artist => `<li><a data-artist-preview="${artist.id}" href="${artist.exhibition ? artistUrl(artist.id) : artist.official}" ${artist.exhibition ? '' : 'target="_blank" rel="noopener"'}>${e(artist.name)}<span class="index-arrow" aria-hidden="true">${artist.exhibition ? '→' : '↗'}</span>${artist.exhibition ? '' : '<span class="sr-only"> (site officiel, nouvel onglet)</span>'}</a></li>`).join('')}</ul></section>`).join('')}</div>
    <aside class="artist-preview" aria-label="Aperçu des artistes"><div class="preview-images">${artists.filter(a => a.exhibition).map((artist, index) => { const item = exhibitions.find(ex => ex.id === artist.exhibition); return `<img data-preview-id="${artist.id}" aria-hidden="${index !== 0}" ${index === 0 ? 'class="is-active"' : ''} src="${item.images[0].src}" alt="${e(item.images[0].alt)}" loading="lazy">`; }).join('')}</div><p class="micro" data-preview-caption>Beau Disundi</p></aside></div>
  </section>`;
}

function NewsItem(item) {
  const href = item.artistId ? artistUrl(item.artistId) + '#news' : 'https://www.insituparis.fr/fr/actualites/liste';
  return `<li><a href="${href}"><time class="meta">${item.date}</time><span>${e(item.title)}<small>${e(item.place)}</small></span><span aria-hidden="true">↗</span></a></li>`;
}

export function Home() {
  const current = exhibitions[0];
  return `<section class="current-exhibition" id="top" aria-labelledby="hero-title">
    <div class="context-line"><span class="micro status">À l’affiche</span><span class="micro">Romainville · Grand Paris</span></div>
    <div class="exhibition-intro"><div class="intro-aside"><p class="meta">Exposition<br>${current.date}</p><a class="text-link meta" href="${exhibitionUrl(current.id)}">Découvrir l’exposition <span aria-hidden="true">↗</span></a></div><div class="intro-title"><h1 class="display" id="hero-title">L’« Ergriffenheit »</h1><p class="exhibition-author">${e(current.artist)}</p></div></div>
    <div class="home-image-row"><p class="micro image-note">IN SITU<br>FABIENNE LECLERC<br><br>01 / 05</p><a class="current-image" href="${exhibitionUrl(current.id)}" aria-label="Découvrir L’Ergriffenheit">${image(current.images[0], true)}</a></div>
  </section>
  ${ArtistIndex()}
  <section class="editorial-section" id="expositions" aria-labelledby="program-title"><header class="section-header"><h2 id="program-title">Expositions & œuvres</h2><span class="micro">Sélection / 04</span></header><div class="section-lead"><p>Des œuvres,<br>avant les mots.</p><p class="meta">Une sélection d’expositions<br>et de projets des artistes.</p></div>${ArchiveList(exhibitions.slice(1, 3))}${ExpandableText('Voir la suite de la sélection (02)', ArchiveList(exhibitions.slice(3)))}</section>
  <section class="editorial-section" id="actualites" aria-labelledby="news-title"><header class="section-header"><h2 id="news-title">Actualités</h2><span class="micro">Hors les murs / 2026</span></header><div class="section-lead"><p>Les artistes de<br>la galerie ailleurs.</p></div><ul class="news-list">${news.slice(0, 2).map(NewsItem).join('')}</ul>${ExpandableText('Toutes les actualités (03)', `<ul class="news-list">${news.slice(2).map(NewsItem).join('')}</ul>${external('https://www.insituparis.fr/fr/actualites/liste', 'Consulter les archives')}`)}</section>`;
}

export function ArtworkMetadata(exhibition, index) {
  const item = exhibition.images[index];
  const title = index === 0 ? exhibition.title : item.caption;
  return `<p class="micro image-count">${count(index + 1)} / ${count(exhibition.images.length)}</p><p>${e(title)}</p>${item.caption !== title ? `<p class="meta">${e(item.caption)}</p>` : ''}${index === 0 && exhibition.date ? `<p class="meta">${e(exhibition.date)}</p>` : ''}${exhibition.place && index === 0 ? `<p class="meta">${e(exhibition.place)}</p>` : ''}`;
}

export function ArtworkViewer(exhibition) {
  return `<section class="artwork-viewer" id="works" data-viewer="${exhibition.id}" aria-label="Œuvres et vues d’exposition"><div class="viewer-image">${exhibition.images.map((item, index) => `<figure data-slide="${index}" ${index ? 'hidden' : ''}>${image(item, index === 0)}</figure>`).join('')}</div><aside class="viewer-aside"><div data-artwork-metadata aria-live="polite" aria-atomic="true">${ArtworkMetadata(exhibition, 0)}</div><div class="viewer-controls"><button data-viewer-prev aria-label="Image précédente" ${exhibition.images.length === 1 ? 'disabled' : ''}>←</button><span class="micro">Parcourir les images</span><button data-viewer-next aria-label="Image suivante" ${exhibition.images.length === 1 ? 'disabled' : ''}>→</button></div></aside></section>`;
}

export function ArtistDetail(artist) {
  const exhibition = exhibitions.find(ex => ex.id === artist.exhibition);
  const relatedNews = news.filter(item => item.artistId === artist.id);
  return `<div class="breadcrumb"><a href="${homeUrl}#artistes">← Artistes</a><span class="micro">Index / ${artist.letter}</span></div><header class="detail-heading"><h1 class="display">${e(artist.name)}</h1></header>
    <nav class="section-nav" aria-label="Sections de la fiche artiste"><a href="#works">Œuvres</a><a href="#artist-exhibitions">Expositions</a><a href="#about">Biographie & CV</a>${relatedNews.length ? '<a href="#news">Actualités</a>' : ''}</nav>
    ${ArtworkViewer(exhibition)}
    <section class="editorial-section" id="artist-exhibitions">${SectionHeader('Expositions & projets', 'Sélection')}${ArchiveList([exhibition])}</section>
    <section class="editorial-section about-section" id="about">${SectionHeader('À propos', 'Biographie & CV')}<div class="reading-column">${ExpandableText('Biographie et parcours complet', `<p class="body-copy">${e(artist.name)}</p>${external(artist.official, 'Lire la biographie et consulter le CV sur le site de la galerie')}`)}</div></section>
    ${relatedNews.length ? `<section class="editorial-section" id="news">${SectionHeader('Actualités', 'Hors les murs / 2026')}<ul class="news-list">${relatedNews.map(item => `<li><div class="news-row"><span class="meta">${item.date}</span><span>${e(item.title)}<small>${e(item.place)}</small></span></div></li>`).join('')}</ul>${external('https://www.insituparis.fr/fr/actualites/liste', 'Toutes les actualités')}</section>` : ''}
    <div class="detail-end"><a class="text-link" href="${homeUrl}#artistes">← Retour à l’index</a>${external(artist.official, 'Fiche officielle')}</div>`;
}

export function ExhibitionDetail(exhibition) {
  const artist = artists.find(a => a.id === exhibition.artistId);
  return `<div class="breadcrumb"><a href="${homeUrl}#expositions">← Expositions & œuvres</a><span class="micro">${e(exhibition.label)}</span></div><header class="detail-heading"><p class="meta">${e(exhibition.date)}${exhibition.place ? ` · ${e(exhibition.place)}` : ''}</p><h1 class="display">${e(exhibition.title)}</h1><a class="exhibition-author" href="${artistUrl(artist.id)}">${e(exhibition.artist)} <span aria-hidden="true">↗</span></a></header>
    <section class="exhibition-sequence" aria-label="Images de l’exposition"><div class="sequence-images">${exhibition.images.map((item, index) => `<figure class="exhibition-image" data-caption-index="${index}" id="image-${index + 1}">${image(item, index === 0)}<figcaption class="mobile-caption">${ArtworkMetadata(exhibition, index)}</figcaption></figure>`).join('')}</div><aside class="sticky-caption"><div data-sticky-caption>${ArtworkMetadata(exhibition, 0)}</div><p class="meta caption-artist">${e(exhibition.artist)}</p><a class="text-link meta" href="${artistUrl(artist.id)}">L’artiste <span aria-hidden="true">↗</span></a></aside></section>
    <section class="editorial-section about-section">${SectionHeader('En savoir plus', 'Exposition')}<div class="reading-column">${ExpandableText('Présentation & informations', `<p class="body-copy">${e(exhibition.title)}<br>${e(exhibition.artist)}${exhibition.date ? `<br>${e(exhibition.date)}` : ''}${exhibition.place ? `<br>${e(exhibition.place)}` : ''}</p>${external(exhibition.official || artist.official, 'Lire la présentation sur le site de la galerie')}`)}</div></section>
    <div class="detail-end"><a class="text-link" href="${homeUrl}#expositions">← Retour à la sélection</a>${external(exhibition.official || artist.official, 'Site officiel')}</div>`;
}

export function NotFound() {
  return `<section class="detail-heading"><p class="micro">Page introuvable</p><h1 class="display">Revenir<br>à l’index.</h1><a class="text-link" href="${homeUrl}#artistes">Artistes & expositions →</a></section>`;
}
