import { objectImage } from "../../primitives/index.js";

export function ExhibitionCardMinimal(exhibition) {
  return `
    <article class="pattern-exhibition-card">
      <a href="/exhibition-your-friends.html">
        <figure>
          <div class="pattern-exhibition-card__media">${objectImage(exhibition, "pattern-exhibition-card__image")}</div>
          <figcaption>
            <span>${exhibition.venue}</span>
            <h3>${exhibition.artist}</h3>
            <p><em>${exhibition.title}</em></p>
            <p>${exhibition.dates}</p>
          </figcaption>
        </figure>
      </a>
    </article>`;
}

export function ExhibitionRow(exhibition) {
  return `
    <article class="pattern-exhibition-row">
      <span>${exhibition.status}</span>
      <h3>${exhibition.artist}</h3>
      <p><em>${exhibition.title}</em></p>
      <p>${exhibition.venue}</p>
      <time>${exhibition.dates}</time>
      <a href="/exhibition-your-friends.html" aria-label="Open ${exhibition.title}">↗</a>
    </article>`;
}

export function ExhibitionCardImageFirst(exhibition) {
  return `
    <article class="pattern-exhibition-card pattern-exhibition-card--image-first">
      <a href="/exhibition-your-friends.html">
        <figure>
          <div class="pattern-exhibition-card__media">${objectImage(exhibition, "pattern-exhibition-card__image")}</div>
          <figcaption>
            <span>${exhibition.status} / ${exhibition.venue}</span>
            <h3>${exhibition.artist}<br><em>${exhibition.title}</em></h3>
            <p>${exhibition.dates}</p>
          </figcaption>
        </figure>
      </a>
    </article>`;
}
