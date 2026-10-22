import { ArtworkCardInquire } from "../../patterns/artwork/index.js";
import { EditorialQuote } from "../../patterns/editorial/index.js";

export function ArtworkWithQuote(artwork) {
  return `
    <section class="section-artwork-quote">
      ${ArtworkCardInquire(artwork)}
      ${EditorialQuote()}
    </section>`;
}
