export function MinimalGalleryHeader() {
  return `
    <header class="pattern-gallery-header">
      <a class="pattern-gallery-header__brand" href="/index.html">FOR ART</a>
      <nav aria-label="Gallery navigation">
        <a href="/artists.html">Artists</a>
        <a href="/exhibitions.html">Exhibitions</a>
        <a href="#">Gallery</a>
      </nav>
      <button type="button" aria-label="Open menu"><span></span><span></span></button>
    </header>`;
}

export function ArtistSubnavigation() {
  const items = ["Selected works", "Exhibitions", "News", "Press", "Biography"];
  return `
    <nav class="pattern-artist-subnav" aria-label="Artist page sections">
      ${items.map((item, index) => `<a href="#"${index === 0 ? ' aria-current="page"' : ""}>${item}</a>`).join("")}
    </nav>`;
}
