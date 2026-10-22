// Les Objecteurs — installation views from galeriegaillard.com (photos : Rebecca Fanuele).
// The site does not say which works each view shows, so views are grouped by space;
// add `works` entries ({ artist, title, year }) to a view once the checklist is confirmed.
export const lesObjecteurs = {
  title: "Les Objecteurs",
  type: "Exposition collective",
  venue: "Galerie Christophe Gaillard, Paris",
  dates: "5 — 26 septembre 2026",
  credit: "Photos : Rebecca Fanuele",
  quote: { text: "Chacun d’eux est seul, entièrement seul", source: "Alain Jouffroy, Les Objecteurs, 1965" },
  artists: [
    "Arman", "Tetsumi Kudo", "Daniel Pommereulle", "Jean-Pierre Raynaud", "Daniel Spoerri",
    "Pierre Ardouvin", "Eric Baudart", "Anita Molinero", "David Douard", "Mimosa Echard",
  ],
  filterLabel: "Filtrer les vues par espace",
  allLabel: "Toutes les vues",
  filters: [
    { id: "main-space", name: "Main Space" },
    { id: "front-space", name: "Front Space" },
  ],
  // Same order as the gallery's page; width/height let the grid fit each photo.
  views: [
    { id: "01", image: "/images/exhibitions/les-objecteurs/vue_objecteurs-01.jpg", width: 2000, height: 1325, filters: ["main-space"], works: [] },
    { id: "02", image: "/images/exhibitions/les-objecteurs/vue_objecteurs-2.jpg", width: 2000, height: 1328, filters: ["main-space"], works: [] },
    { id: "03", image: "/images/exhibitions/les-objecteurs/vue_objecteurs-3.jpg", width: 2000, height: 1333, filters: ["main-space"], works: [] },
    { id: "04", image: "/images/exhibitions/les-objecteurs/vue_objecteurs-4.jpg", width: 2000, height: 1328, filters: ["main-space"], works: [] },
    { id: "05", image: "/images/exhibitions/les-objecteurs/vue_objecteurs-7.jpg", width: 2000, height: 1334, filters: ["main-space"], works: [] },
    { id: "06", image: "/images/exhibitions/les-objecteurs/vue_objecteurs-5.jpg", width: 2000, height: 1334, filters: ["main-space"], works: [] },
    { id: "07", image: "/images/exhibitions/les-objecteurs/vue_objecteurs-6.jpg", width: 2000, height: 1326, filters: ["main-space"], works: [] },
    { id: "08", image: "/images/exhibitions/les-objecteurs/vue_objecteurs-8.jpg", width: 2000, height: 1329, filters: ["main-space"], works: [] },
    { id: "09", image: "/images/exhibitions/les-objecteurs/vue_objecteurs-9.jpg", width: 2000, height: 1333, filters: ["main-space"], works: [] },
    { id: "10", image: "/images/exhibitions/les-objecteurs/vuefront_objecteurs-1.jpg", width: 577, height: 850, filters: ["front-space"], works: [] },
    { id: "11", image: "/images/exhibitions/les-objecteurs/vuefront_objecteurs-3.jpg", width: 1225, height: 1772, filters: ["front-space"], works: [] },
    { id: "12", image: "/images/exhibitions/les-objecteurs/vuefront_objecteurs-4.jpg", width: 2000, height: 1334, filters: ["front-space"], works: [] },
    { id: "13", image: "/images/exhibitions/les-objecteurs/vuefront_objecteurs-5.jpg", width: 2000, height: 1334, filters: ["front-space"], works: [] },
    { id: "14", image: "/images/exhibitions/les-objecteurs/vuefront_objecteurs-6.jpg", width: 2000, height: 1333, filters: ["front-space"], works: [] },
    { id: "15", image: "/images/exhibitions/les-objecteurs/vuefront_objecteurs-7.jpg", width: 1181, height: 1772, filters: ["front-space"], works: [] },
    { id: "16", image: "/images/exhibitions/les-objecteurs/vuefront_objecteurs-8.jpg", width: 1200, height: 1772, filters: ["front-space"], works: [] },
  ],
};
