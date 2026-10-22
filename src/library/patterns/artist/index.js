import { objectImage } from "../../primitives/index.js";

export function ArtistCardMinimal(artist) {
  return `
    <article class="pattern-artist-card">
      <a href="/artist.html">
        <figure>
          <div class="pattern-artist-card__media">${objectImage({...artist, artist: artist.name, title: "Portrait"}, "pattern-artist-card__image")}</div>
          <figcaption><h3>${artist.name}</h3><p>${artist.location}</p></figcaption>
        </figure>
      </a>
    </article>`;
}

const artistBioEngines = [
  { id: "native", name: "Native", note: "View Transition · fluide" },
  { id: "motion", name: "Motion", note: "spring · souple" },
  { id: "gsap", name: "GSAP Flip", note: "FLIP · précis" },
  { id: "anime", name: "Anime.js", note: "layout · expressif" },
];

function ArtistBioExpandSample(artist, engine) {
  const pageArtist = {
    ...artist,
    image: "/images/Pieces/Vincent%20van%20Gogh/MV5BOTg5MTU4NDk1Nl5BMl5BanBnXkFtZTgwNjE3MjY3NjM%40._V1_.jpg",
    born: "Born 1853, Zundert, Netherlands — Died 1890, Auvers-sur-Oise, France",
    intro: "Vincent van Gogh became an artist at twenty-seven after working as an art dealer and preacher.",
  };
  artist = pageArtist;
  return `
    <article class="pattern-artist-bio" data-expand-step="0" data-animation-engine="${engine.id}" data-animation-label="${engine.name}">
      <span class="pattern-artist-bio__surface" aria-hidden="true"></span>
      <button type="button" class="pattern-artist-bio__trigger" data-artist-bio-expand aria-expanded="false" aria-label="Développer la carte ${engine.name} de ${artist.name}">
        <figure class="pattern-artist-bio__media">
          ${objectImage({ ...artist, artist: artist.name, title: "Portrait" }, "pattern-artist-bio__image")}
        </figure>
        <h2 class="pattern-artist-bio__compact-title">${artist.name}</h2>
        <div class="pattern-artist-bio__details">
          <div class="pattern-artist-bio__heading">
            <h2>${artist.name}</h2>
            <span class="pattern-artist-bio__step" aria-hidden="true">+</span>
          </div>
          <p class="pattern-artist-bio__date">${artist.born}</p>
          <p class="pattern-artist-bio__intro">${artist.intro}</p>
          <p class="pattern-artist-bio__more">${artist.bio}</p>
        </div>
      </button>
      <div class="pattern-artist-bio__full-page" aria-hidden="true">
        <iframe src="/artist-van-gogh-expand-lab.html" title="Prototype Expand Lab de Vincent Van Gogh" loading="eager"></iframe>
        <button type="button" class="pattern-artist-bio__close-full" data-artist-bio-close aria-label="Refermer la page ${engine.name} de Vincent Van Gogh">×</button>
      </div>
    </article>`;
}

function ArtistBioStorySample(artist) {
  const portraitArtist = {
    ...artist,
    image: "/images/Pieces/Vincent%20van%20Gogh/MV5BOTg5MTU4NDk1Nl5BMl5BanBnXkFtZTgwNjE3MjY3NjM%40._V1_.jpg",
  };
  const starryNight = {
    artist: "Vincent van Gogh",
    title: "The Starry Night",
    image: "/images/Pieces/Vincent%20van%20Gogh/VanGogh-starry_night_ballance1.jpg",
  };

  return `
    <article class="pattern-artist-story" data-story-step="0">
      <button type="button" class="pattern-artist-story__trigger" data-artist-story-expand aria-expanded="false" aria-label="Développer la seconde carte de ${artist.name}">
        <figure class="pattern-artist-story__media">
          ${objectImage({ ...portraitArtist, artist: artist.name, title: "Portrait" }, "pattern-artist-story__portrait")}
        </figure>
        <h2 class="pattern-artist-story__compact-title">
          <span>${artist.name}</span>
        </h2>
        <div class="pattern-artist-story__details">
          <div class="pattern-artist-story__heading">
            <h2>${artist.name}</h2>
          </div>
          <p class="pattern-artist-story__date">Born 1853, Zundert, Netherlands — Died 1890, Auvers-sur-Oise, France</p>
          <p>Vincent van Gogh became an artist at twenty-seven after working as an art dealer and preacher.</p>
          <p class="pattern-artist-story__more">Largely self-taught, he learned through sustained drawing and close study, then developed a bold visual language in which colour, line and brushwork carry unusual emotional intensity.</p>
        </div>
        <span class="pattern-artist-story__step pattern-artist-story__step--details" aria-hidden="true">
          <svg class="pattern-artist-story__expand-icon" viewBox="0 0 18 18" fill="none"><path d="M10.5 3.5h4v4M7.5 14.5h-4v-4" stroke="currentColor" stroke-width="2" stroke-linecap="square"/></svg>
          <svg class="pattern-artist-story__close-icon" viewBox="0 0 18 18" fill="none"><path d="M4 4l10 10M14 4L4 14" stroke="currentColor" stroke-width="1.8"/></svg>
        </span>
        <figure class="pattern-artist-story__artwork">
          ${objectImage(starryNight, "pattern-artist-story__artwork-image")}
        </figure>
      </button>
    </article>`;
}

export function ExpandableArtistCard(artist) {
  const initialEngine = artistBioEngines[0];
  return `
    <section class="artist-bio-lab" data-active-engine="${initialEngine.id}" aria-label="Animation d’expansion vers la page artiste">
      <header class="artist-bio-lab__header">
        <div class="artist-bio-lab__switch" role="group" aria-label="Bibliothèque d’animation">
          ${artistBioEngines.map((engine, index) => `<button type="button" data-artist-bio-engine="${engine.id}" data-engine-name="${engine.name}" data-engine-note="${engine.note}" aria-pressed="${index === 0}">${engine.name}</button>`).join("")}
        </div>
        <p class="artist-bio-lab__note"><strong>${initialEngine.name}</strong><span>${initialEngine.note}</span></p>
      </header>
      <div class="artist-bio-lab__stage">
        <div class="artist-bio-lab__samples">
          ${ArtistBioExpandSample(artist, initialEngine)}
        </div>
      </div>
    </section>`;
}

export function GsapExpandableArtistCard(artist) {
  const gsapEngine = artistBioEngines.find((engine) => engine.id === "gsap");
  return `
    <section class="artist-bio-lab artist-bio-lab--single" data-active-engine="gsap" aria-label="Étude d’animation GSAP Flip">
      <div class="artist-bio-lab__stage">
        <div class="artist-bio-lab__samples">
          ${ArtistBioExpandSample(artist, gsapEngine)}
        </div>
      </div>
    </section>`;
}

export function AstraExpandableArtistCard(artist) {
  return `
    <section class="artist-bio-lab artist-bio-lab--single" data-active-engine="astra" aria-label="Étude d’animation Astra avec trois cartes">
      <div class="artist-bio-lab__stage">
        <div class="astra-expand-stack" data-astra-expand-stack data-expanded="false">
          <button class="astra-expand-toggle" type="button" data-astra-expand-toggle aria-expanded="false" aria-label="Rassembler les trois cartes en une fiche"></button>
          <article class="astra-expand-card astra-expand-card--artwork" aria-label="Œuvre de Hilma af Klint">
            <img src="/images/Pieces/the-swan-no-10-af-klint.jpg" alt="The Swan No. 10 de Hilma af Klint">
          </article>
          <article class="astra-expand-card astra-expand-card--bio">
            <div>
              <h2>Hilma Af Klint</h2>
              <p class="astra-expand-card__date">Born 1862, Solna, Sweden —<br>Died 1944, Danderyd, Sweden</p>
            </div>
            <p>Hilma af Klint became an artist after studying at Stockholm’s Royal Academy of Fine Arts.<br><br>Trained in traditional painting, she developed a radical abstract style driven by spirituality, nature, and geometry, using bold forms, color, and symbols to explore inner worlds.</p>
          </article>
          <article class="astra-expand-card astra-expand-card--portrait" aria-label="Portrait de Hilma af Klint">
            <img src="/images/Pieces/Hilma-af-Klint-uncropped.jpg" alt="Hilma af Klint">
          </article>
        </div>
      </div>
    </section>`;
}

const cardTrioVariants = [
  { id: "fiche", name: "Profile", shortName: "Profile", note: "click · the cards form a single profile" },
  { id: "triptyque", name: "Triptych", shortName: "Trip.", note: "click · the cards unfold side by side" },
  { id: "paquet", name: "Stack", shortName: "Stack", note: "click or drag · the top card moves behind" },
  { id: "parallaxe", name: "Depth", shortName: "Depth", note: "hover · the cards follow the pointer in 3D" },
  { id: "recto", name: "Front / back", shortName: "Flip", note: "click · the portrait flips to reveal the biography" },
  { id: "focus", name: "Artwork focus", shortName: "Focus", note: "click · the artwork fills the composition" },
];

export function CardTrioMotionStudy() {
  const [initialVariant] = cardTrioVariants;
  return `
    <section class="artist-bio-lab trio-lab" data-trio data-variant="${initialVariant.id}" aria-label="Étude de mouvements à trois cartes">
      <header class="artist-bio-lab__header">
        <div class="artist-bio-lab__switch" role="group" aria-label="Type d’animation">
          ${cardTrioVariants.map((variant, index) => `<button type="button" data-trio-variant="${variant.id}" data-record-label="${variant.shortName}" data-note="${variant.note}" aria-pressed="${index === 0}">${variant.name}</button>`).join("")}
        </div>
      </header>
      <div class="artist-bio-lab__stage">
        <div class="trio-lab__viewport">
          <div class="trio-lab__scene">
            <div class="trio-lab__sheet" aria-hidden="true"></div>
            <article class="trio-card trio-card--artwork" data-trio-card="artwork" aria-label="Œuvre de Hilma af Klint">
              <img src="/images/Pieces/the-swan-no-10-af-klint.jpg" alt="The Swan No. 10 de Hilma af Klint">
            </article>
            <article class="trio-card trio-card--bio" data-trio-card="bio">
              <div class="trio-card__text">
                <div>
                  <h2>Hilma Af Klint</h2>
                  <p class="trio-card__date">Born 1862, Solna, Sweden —<br>Died 1944, Danderyd, Sweden</p>
                </div>
                <p class="trio-card__body">Hilma af Klint became an artist after studying at Stockholm’s Royal Academy of Fine Arts.<br><br>Trained in traditional painting, she developed a radical abstract style driven by spirituality, nature, and geometry, using bold forms, color, and symbols to explore inner worlds.</p>
              </div>
            </article>
            <article class="trio-card trio-card--portrait" data-trio-card="portrait" aria-label="Portrait de Hilma af Klint">
              <img src="/images/Pieces/Hilma-af-Klint-uncropped.jpg" alt="Hilma af Klint">
            </article>
          </div>
          <button type="button" class="trio-lab__hit" data-trio-hit aria-expanded="false" aria-label="Déplier les trois cartes"></button>
        </div>
      </div>
    </section>`;
}

export function ArtistStoryCard(artist) {
  return `
    <section class="artist-bio-lab artist-bio-lab--story" aria-label="Animation d’expansion avec œuvre">
      <div class="artist-bio-lab__stage">
        <div class="artist-bio-lab__samples">
          ${ArtistBioStorySample(artist)}
        </div>
      </div>
    </section>`;
}

export function ArtistIndexRow(artist, index = 0) {
  return `
    <article class="pattern-artist-row">
      <span>${String(index + 1).padStart(2, "0")}</span>
      <h3>${artist.name}</h3>
      <p>${artist.location}</p>
      <p>${artist.years}</p>
      <a href="/artist.html" aria-label="Open ${artist.name}">↗</a>
    </article>`;
}
