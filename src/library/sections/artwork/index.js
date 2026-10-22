import { ArtworkCardInquire, ArtworkCardMinimal } from "../../patterns/artwork/index.js";

function ArtworkGrid(artworks, columns) {
  return `
    <section class="section-artwork-grid section-artwork-grid--${columns}" aria-label="Artwork grid">
      ${artworks.slice(0, columns).map((artwork) => ArtworkCardMinimal(artwork)).join("")}
    </section>`;
}

export function ArtworkGridThree(artworks) {
  return ArtworkGrid(artworks, 3);
}

export function ArtworkGridFour(artworks) {
  return ArtworkGrid(artworks, 4);
}

export function SelectedWorks(artworks) {
  return `
    <section class="section-selected-works">
      <header><p>Selected works</p><span>${String(artworks.length).padStart(2, "0")}</span></header>
      <div class="section-selected-works__grid">
        ${artworks.slice(0, 3).map((artwork, index) => index === 0 ? ArtworkCardInquire(artwork) : ArtworkCardMinimal(artwork)).join("")}
      </div>
    </section>`;
}
