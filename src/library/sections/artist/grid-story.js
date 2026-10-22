import { objectImage } from "../../primitives/index.js";

export function GridArtistStory(artist) {
  const portrait = "/images/Pieces/Vincent%20van%20Gogh/MV5BOTg5MTU4NDk1Nl5BMl5BanBnXkFtZTgwNjE3MjY3NjM%40._V1_.jpg";
  const starryNight = {
    artist: "Vincent van Gogh",
    title: "The Starry Night",
    image: "/images/Pieces/Vincent%20van%20Gogh/VanGogh-starry_night_ballance1.jpg",
  };

  return `
    <article class="grid-artist-story" data-story-step="0">
      <button type="button" class="grid-artist-story__trigger" data-grid-story-expand aria-expanded="false" aria-label="Développer la carte de ${artist.name}">
        <figure class="grid-artist-story__media">
          ${objectImage({ ...artist, artist: artist.name, title: "Portrait", image: portrait }, "grid-artist-story__portrait")}
        </figure>
        <h2 class="grid-artist-story__compact-title">
          <span>${artist.name}</span>
          <span class="grid-artist-story__step" aria-hidden="true">
            <svg viewBox="0 0 18 18" fill="none"><path d="M10.5 3.5h4v4M7.5 14.5h-4v-4" stroke="currentColor" stroke-width="2" stroke-linecap="square"/></svg>
          </span>
        </h2>
        <div class="grid-artist-story__details">
          <div class="grid-artist-story__heading">
            <h2>${artist.name}</h2>
          </div>
          <p class="grid-artist-story__date">Born 1853, Zundert, Netherlands — Died 1890, Auvers-sur-Oise, France</p>
          <p>Vincent van Gogh became an artist at twenty-seven after working as an art dealer and preacher.</p>
          <p class="grid-artist-story__more">Largely self-taught, he learned through sustained drawing and close study, then developed a bold visual language in which colour, line and brushwork carry unusual emotional intensity.</p>
        </div>
        <span class="grid-artist-story__step grid-artist-story__step--details" aria-hidden="true">
          <svg class="grid-artist-story__close-icon" viewBox="0 0 18 18" fill="none"><path d="M4 4l10 10M14 4L4 14" stroke="currentColor" stroke-width="1.8"/></svg>
        </span>
        <figure class="grid-artist-story__artwork">
          ${objectImage(starryNight, "grid-artist-story__artwork-image")}
        </figure>
      </button>
    </article>`;
}
