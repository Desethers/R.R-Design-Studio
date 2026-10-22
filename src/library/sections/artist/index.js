import { ArtistIndexRow } from "../../patterns/artist/index.js";
import { objectImage } from "../../primitives/index.js";
import { GridArtistStory } from "./grid-story.js";

export function ArtistIndex(artists) {
  return `
    <section class="section-artist-index">
      <header><p>Artists</p><span>A–Z</span></header>
      ${artists.map(ArtistIndexRow).join("")}
    </section>`;
}

function artistItem(artist, order, linked = true) {
  const hasLink = linked === true || (linked === "van-gogh-only" && artist.id === "vincent-van-gogh");
  const tag = hasLink ? "a" : "div";
  const href = hasLink ? ' href="/artist.html"' : "";
  return `
    <${tag}${href} data-artist-id="${artist.id}" data-image-format="${order % 2 === 0 ? "landscape" : "portrait"}" class="section-artist-grid__item" style="order:${order}">
      <figure>${objectImage({ ...artist, artist: artist.name, title: "Portrait" }, "section-artist-grid__image")}</figure>
      <h3>${artist.name}</h3>
    </${tag}>`;
}

function artistGridBody(artists, linked = true) {
  const left = artists.filter((_, i) => i % 2 === 0);
  const right = artists.filter((_, i) => i % 2 === 1);
  return `
    <div class="section-artist-grid__body">
      <header><p>Artists</p></header>
      <div class="section-artist-grid__items">
        <div class="section-artist-grid__col" data-col="left">
          ${left.map((artist) => artistItem(artist, artists.indexOf(artist) + 1, linked)).join("")}
        </div>
        <div class="section-artist-grid__col" data-col="right">
          ${right.map((artist) => artistItem(artist, artists.indexOf(artist) + 1, linked)).join("")}
        </div>
      </div>
    </div>`;
}

export function ArtistGrid(artists) {
  artists = artists.map(artist => artist.id === "sacha-elron"
    ? {
        ...artist,
        id: "gustave-caillebotte",
        name: "Gustave Caillebotte",
        image: "/images/Pieces/Gustave_Caillebotte_-_Un_balcon,_Boulevard_Haussmann.jpg",
      }
    : artist.id === "paul-klee"
      ? { ...artist, id: "paul-cezanne", name: "Paul Cezanne" }
      : artist);
  return `
    <section class="section-artist-grid section-artist-grid--formats">
      ${artistGridBody(artists, false)}
      <div class="section-artist-grid__view-switch" role="group" aria-label="Artist display format">
        <button type="button" data-artist-grid-view="grid" aria-pressed="true">Grille</button>
        <button type="button" data-artist-grid-view="list" aria-pressed="false">Liste</button>
      </div>
    </section>`;
}

export function ArtistGridOnly(artists) {
  artists = artists.map(artist => {
    if (artist.id === "sacha-elron") {
      return {
        ...artist,
        id: "gustave-caillebotte",
        name: "Gustave Caillebotte",
        image: "/images/Pieces/Gustave_Caillebotte_-_Un_balcon,_Boulevard_Haussmann.jpg",
      };
    }
    if (artist.id === "paul-klee") return { ...artist, id: "paul-cezanne", name: "Paul Cezanne" };
    return artist;
  });
  const vanGogh = artists.find(artist => artist.id === "vincent-van-gogh");
  return `
    <section class="section-artist-grid section-artist-grid--cards">
      ${artistGridBody(artists, "van-gogh-only")}
      ${vanGogh ? `<template data-grid-story-template>${GridArtistStory(vanGogh)}</template>` : ""}
    </section>`;
}

export function ArtistFullPage() {
  return `
    <section class="section-embed section-embed--tall">
      <iframe src="/artist-van-gogh-library.html" title="Vincent van Gogh artist page" loading="eager"></iframe>
    </section>`;
}
