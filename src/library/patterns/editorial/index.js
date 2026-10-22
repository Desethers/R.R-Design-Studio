export function EditorialQuote() {
  return `
    <blockquote class="pattern-editorial-quote">
      <p>Shared light is the simplest form of friendship—what falls on the wall falls on us both.</p>
      <cite>Sacha Elron</cite>
    </blockquote>`;
}

const allenImageBase = "/images/exhibitions/galerie-allen-jason-dodge/";
const allenExhibitionDates = "3rd September, 2026&nbsp;—&nbsp;26th September, 2026";

export const galerieAllenPhotoCaptions = [
  { image: "jd26exh2.jpg", alt: "Exhibition view of Jason Dodge at Galerie Allen", size: "wide", caption: `Exhibition view<br><br>${allenExhibitionDates}, Galerie Allen` },
  { image: "jd26exh1.jpg", alt: "Another exhibition view of Jason Dodge at Galerie Allen", size: "wide", caption: `Exhibition view<br><br>${allenExhibitionDates}, Galerie Allen` },
  { image: "jason_dodge_galerie_allen_3948.jpg", alt: "Jason Dodge, Untitled, 300 x 80 x 150 cm", size: "narrow", caption: "Jason Dodge<br><em>Untitled</em><br>300 x 80 x 150 cm<br>Photo: Aurélien Mole<br>Courtesy the artist and Galerie Allen, Paris" },
  { image: "jason_dodge_galerie_allen_3949.jpg", alt: "Jason Dodge, Untitled, dimensions variables", size: "narrow", caption: "Jason Dodge<br><em>Untitled</em><br>dimensions variables<br>Photo: Aurélien Mole<br>Courtesy the artist and Galerie Allen, Paris" },
  { image: "jason_dodge_galerie_allen_3945.jpg", alt: "Jason Dodge, Untitled, dimensions variables", size: "wide", caption: "Jason Dodge<br><em>Untitled</em><br>dimensions variables<br>Photo: Aurélien Mole<br>Courtesy the artist and Galerie Allen, Paris" },
  { image: "jason_dodge_galerie_allen_3946.jpg", alt: "Jason Dodge, Untitled, 180 x 75 x 31 cm", size: "wide", caption: "Jason Dodge<br><em>Untitled</em><br>180 x 75 x 31 cm<br>Photo: Aurélien Mole<br>Courtesy the artist and Galerie Allen, Paris" },
  { image: "jason_dodge_galerie_allen_3947.jpg", alt: "Jason Dodge, Untitled, 420 x 36 cm", size: "wide", caption: "Jason Dodge<br><em>Untitled</em><br>420 x 36 cm<br>Photo: Aurélien Mole<br>Courtesy the artist and Galerie Allen, Paris" },
];

export function EditorialPhotoCaption(photo) {
  const src = photo.src || `${allenImageBase}${photo.image}`;
  return `
    <figure class="pattern-editorial-photo-caption pattern-editorial-photo-caption--${photo.size}">
      <div class="pattern-editorial-photo-caption__stage">
        <figcaption aria-hidden="true">${photo.caption}</figcaption>
        <button class="pattern-editorial-photo-caption__image-button" type="button" data-editorial-photo-toggle aria-expanded="false" aria-label="Reveal caption for ${photo.alt}">
          <img class="pattern-editorial-photo-caption__image" src="${src}" alt="${photo.alt}" loading="lazy">
        </button>
      </div>
    </figure>`;
}

export function EditorialPhotoCaptions(photos = galerieAllenPhotoCaptions) {
  const markerCount = Math.min(photos.length, 5);
  return `<section class="section-editorial-photo-captions" data-layout="sequence" aria-label="Jason Dodge exhibition photographs and captions">
    <div class="section-editorial-photo-captions__items" id="editorial-photo-caption-track" role="group" aria-label="Exhibition photographs">
      ${photos.slice(0, 2).map(EditorialPhotoCaption).join("")}
      <div class="section-editorial-photo-captions__pair">
        ${photos.slice(2, 4).map(EditorialPhotoCaption).join("")}
      </div>
      ${photos.slice(4).map(EditorialPhotoCaption).join("")}
    </div>
    <div class="section-editorial-photo-captions__toolbar">
      <div class="section-editorial-photo-captions__carousel-controls" aria-label="Carousel controls">
      <button class="section-editorial-photo-captions__carousel-arrow" type="button" data-editorial-carousel-step="-1" aria-label="Previous photograph" aria-controls="editorial-photo-caption-track">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m14.5 5-7 7 7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <div class="section-editorial-photo-captions__carousel-pagination" role="group" aria-label="Choose photograph">
        ${Array.from({ length: markerCount }, (_, index) => `<button type="button" data-editorial-carousel-index="${index}" aria-label="Go to carousel position ${index + 1} of ${markerCount}" aria-controls="editorial-photo-caption-track" aria-current="${index === 0}"><span></span></button>`).join("")}
      </div>
      <button class="section-editorial-photo-captions__carousel-arrow" type="button" data-editorial-carousel-step="1" aria-label="Next photograph" aria-controls="editorial-photo-caption-track">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m9.5 5 7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      </div>
      <button class="section-editorial-photo-captions__layout-toggle" type="button" data-editorial-layout-toggle aria-pressed="false" aria-label="Show photographs as a carousel" title="Show photographs as a carousel">
        <svg class="section-editorial-photo-captions__layout-icon--line" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3.5" y="6.5" width="4" height="11" fill="#fff" stroke="currentColor" stroke-width="1.1"/>
          <rect x="10" y="6.5" width="4" height="11" fill="#fff" stroke="currentColor" stroke-width="1.1"/>
          <rect x="16.5" y="6.5" width="4" height="11" fill="#fff" stroke="currentColor" stroke-width="1.1"/>
        </svg>
        <svg class="section-editorial-photo-captions__layout-icon--vertical" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="4" y="4.5" width="16" height="5" fill="#fff" stroke="currentColor" stroke-width="1.1"/>
          <rect x="4" y="14.5" width="16" height="5" fill="#fff" stroke="currentColor" stroke-width="1.1"/>
        </svg>
      </button>
    </div>
  </section>`;
}
