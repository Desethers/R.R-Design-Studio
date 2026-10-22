import { ExhibitionCardImageFirst, ExhibitionCardMinimal, ExhibitionRow } from "../../patterns/exhibition/index.js";

export function ExhibitionGrid(exhibitions) {
  return `
    <section class="section-exhibition-grid" aria-label="Exhibition grid">
      ${exhibitions.slice(0, 3).map((exhibition, index) => index === 0 ? ExhibitionCardImageFirst(exhibition) : ExhibitionCardMinimal(exhibition)).join("")}
    </section>`;
}

export function ExhibitionText() {
  return `
    <section class="section-embed">
      <iframe src="/exhibition-text-library.html" title="Exhibition text with read-more modal" loading="eager"></iframe>
    </section>`;
}

export function ExhibitionFilters() {
  return `
    <section class="section-embed">
      <iframe src="/exhibitions-library.html" title="Exhibition filters with status pills and year selector" loading="eager"></iframe>
    </section>`;
}

export function ExhibitionArchive(exhibitions) {
  return `
    <section class="section-exhibition-archive">
      <header><p>Exhibition archive</p><span>2026</span></header>
      ${exhibitions.map(ExhibitionRow).join("")}
    </section>`;
}
