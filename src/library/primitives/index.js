export function artworkCaption(artwork) {
  return `
    <figcaption class="pattern-artwork__caption">
      <p class="pattern-artwork__artist">${artwork.artist}</p>
      <p><em>${artwork.title}</em>, ${artwork.year}</p>
      <p class="pattern-artwork__details">${artwork.medium},<br>${artwork.dimensions}</p>
    </figcaption>`;
}

export function objectImage(item, className = "pattern-media") {
  return `<img class="${className}" src="${item.image}" alt="${item.artist}, ${item.title || item.name}" loading="lazy" decoding="async">`;
}

export function arrowLink(label, href = "#") {
  return `<a class="pattern-link" href="${href}">${label} <span aria-hidden="true">↗</span></a>`;
}
