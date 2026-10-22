import { lesObjecteurs } from "../../data/exhibition-views.js";

const groupShowVariants = [
  { id: "paquet", name: "Paquet", note: "clic ou glisser · une carte à la fois, chacune seule" },
  { id: "planche", name: "Planche", note: "clic · l’éventail s’étale, clic sur une carte pour l’isoler" },
  { id: "table", name: "Table", note: "glisser · rapprocher librement · double-clic sur le fond pour éparpiller" },
  { id: "tri", name: "Deux espaces", note: "clic · la carte passe derrière son tas · double-clic pour l’agrandir" },
  { id: "recto", name: "Recto / verso", note: "clic · retourner une carte · clic sur un texte pour tout retourner" },
];

const CARD_LONG_SIDE = 230;

function ImageCard(show, view) {
  const ratio = view.width / view.height;
  const width = Math.round(ratio >= 1 ? CARD_LONG_SIDE : 184);
  const height = Math.round(ratio >= 1 ? CARD_LONG_SIDE / ratio : 200);
  const space = view.filters.map((id) => show.filters.find((filter) => filter.id === id).name).join(", ");
  return `
    <article class="gm-card gm-card--image" data-gm-card data-group="${view.filters[0]}" data-orientation="${ratio >= 1 ? "landscape" : "portrait"}" data-label="Vue ${view.id} · ${space}" style="--img-w: ${width}px; --img-h: ${height}px">
      <div class="gm-card__inner">
        <div class="gm-card__face gm-card__face--front">
          <img src="${view.image}" alt="Vue ${view.id} de l’exposition ${show.title}, ${space}" loading="lazy" decoding="async" draggable="false">
          <p class="gm-card__caption">
            <span>Vue de l’exposition</span>
            <span>${show.venue} 2026</span>
          </p>
        </div>
        <div class="gm-card__face gm-card__face--back" aria-hidden="true">
          <p class="gm-card__number">${view.id}</p>
          <div>
            <p>${space}</p>
            <p class="gm-card__muted"><em>${show.title}</em></p>
          </div>
        </div>
      </div>
    </article>`;
}

function TextCard(kind, label, content) {
  return `
    <article class="gm-card gm-card--text gm-card--${kind}" data-gm-card data-group="text" data-label="${label}">
      <div class="gm-card__inner">
        <div class="gm-card__face gm-card__face--front">${content}</div>
      </div>
    </article>`;
}

export function GroupShowMotionStudy(show = lesObjecteurs) {
  const requestedVariant = new URLSearchParams(window.location.search).get("variant");
  const initialVariant = groupShowVariants.find((variant) => variant.id === requestedVariant) || groupShowVariants[0];
  const views = show.views.map((view) => ImageCard(show, view));
  const titleCard = TextCard("title", show.title, `
    <p class="gm-card__kicker">${show.type}</p>
    <h3>${show.title}</h3>
    <p>${show.dates}<br>${show.venue}</p>
    <p class="gm-card__credit">${show.credit}</p>`);
  const artistsCard = TextCard("artists", "Artistes de l’exposition", `
    <p class="gm-card__kicker">Avec</p>
    <ul>${show.artists.map((artist) => `<li>${artist}</li>`).join("")}</ul>`);
  const quoteWords = show.quote.text.trim().split(/\s+/);
  const quoteLastWord = quoteWords.pop();
  const quoteCard = TextCard("quote", show.quote.source, `
    <blockquote>${quoteWords.join(" ")} <span class="gm-card__quote-ending">${quoteLastWord}<span class="gm-card__quote-close">”</span></span></blockquote>
    <p class="gm-card__credit">${show.quote.source}</p>`);
  // Texts are shuffled in among the views, so the deck reads as one set of objects.
  const cards = [titleCard, ...views.slice(0, 4), artistsCard, ...views.slice(4, 9), quoteCard, ...views.slice(9)];

  return `
    <section class="artist-bio-lab gm-lab" data-gm data-variant="${initialVariant.id}" aria-label="Étude d’interactions avec les cartes de l’exposition ${show.title}">
      <header class="artist-bio-lab__header">
        <div class="artist-bio-lab__switch" role="group" aria-label="Type d’interaction">
          ${groupShowVariants.map((variant) => `<button type="button" data-gm-variant="${variant.id}" data-record-variant="${variant.id}" data-note="${variant.note}" aria-pressed="${variant === initialVariant}">${variant.name}</button>`).join("")}
        </div>
        <p class="artist-bio-lab__note" data-gm-note><strong>${initialVariant.name}</strong><span>${initialVariant.note}</span></p>
      </header>
      <div class="artist-bio-lab__stage">
        <div class="gm-lab__viewport">
          <div class="gm-lab__scene" data-gm-scene tabindex="0" role="group" aria-label="Cartes de l’exposition : Entrée pour interagir, flèches pour le paquet">
            <p class="gm-lab__status" data-gm-status aria-live="polite"></p>
            ${cards.join("")}
          </div>
        </div>
      </div>
    </section>`;
}
