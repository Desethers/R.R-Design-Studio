import { arrowLink, artworkCaption, objectImage } from "../../primitives/index.js";

export function ArtworkCardMinimal(artwork) {
  return `
    <article class="pattern-artwork pattern-artwork--minimal">
      <figure>
        <div class="pattern-artwork__media">${objectImage(artwork, "pattern-artwork__image")}</div>
        ${artworkCaption(artwork)}
      </figure>
    </article>`;
}

export function ArtworkCardInquire(artwork) {
  return `
    <article class="pattern-artwork pattern-artwork--inquire">
      <figure class="pattern-artwork__figure">
        ${objectImage(artwork, "pattern-artwork__image")}
        <figcaption class="pattern-artwork__caption pattern-artwork__caption--inquiry">
          <p class="pattern-artwork__artist">${artwork.artist}</p>
          <p class="pattern-artwork__title-line">
            <span class="pattern-artwork__title">${artwork.title}</span><span>, </span><span class="pattern-artwork__date">${artwork.year}</span>
          </p>
          <p class="pattern-artwork__medium">${artwork.medium},</p>
          <p class="pattern-artwork__dimensions">${artwork.dimensions}</p>
          <a
            class="btn-outline pattern-artwork__inquiry"
            href="#inquire"
            role="button"
            data-inquiry-artist="${artwork.artist}"
            data-inquiry-work="${artwork.title}"
          >Inquire</a>
        </figcaption>
      </figure>
    </article>`;
}

export function ArtworkCardHoverInfo(artwork) {
  return `
    <article class="pattern-artwork pattern-artwork--hover" tabindex="0">
      <figure>
        <div class="pattern-artwork__media">
          ${objectImage(artwork, "pattern-artwork__image")}
          <div class="pattern-artwork__hover-panel">${artworkCaption(artwork)}</div>
        </div>
      </figure>
    </article>`;
}

export function ArtworkMeta(artwork) {
  return `
    <dl class="pattern-artwork-meta">
      <div><dt>Artist</dt><dd>${artwork.artist}</dd></div>
      <div><dt>Work</dt><dd><em>${artwork.title}</em>, ${artwork.year}</dd></div>
      <div><dt>Medium</dt><dd>${artwork.medium}</dd></div>
      <div><dt>Dimensions</dt><dd>${artwork.dimensions}</dd></div>
    </dl>`;
}

export function ArtworkCardCompact(artwork) {
  return `
    <article class="pattern-artwork-compact">
      <div class="pattern-artwork-compact__media">${objectImage(artwork, "pattern-artwork-compact__image")}</div>
      <div class="pattern-artwork-compact__content">
        <p class="pattern-artwork__artist">${artwork.artist}</p>
        <p><em>${artwork.title}</em>, ${artwork.year}</p>
        <p class="pattern-artwork__details">${artwork.medium}<br>${artwork.dimensions}</p>
      </div>
      ${arrowLink("View", "#")}
    </article>`;
}
