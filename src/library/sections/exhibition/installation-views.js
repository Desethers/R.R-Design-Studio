import { lesObjecteurs } from "../../data/exhibition-views.js";

// A view's label: its space, then the works it shows once they are known.
function ViewLabel(show, view, groupNames) {
  const works = view.works.map((work) => `
    <p class="exh-label__work">${work.artist}${work.title ? `, <em>${work.title}</em>` : ""}${work.year ? `, ${work.year}` : ""}</p>`).join("");
  return `
    <div class="exh-label__artist">
      <p class="exh-label__name">${groupNames}</p>
      ${works || `<p class="exh-label__work">${show.venue}</p>`}
    </div>`;
}

export function ExhibitionInstallationViews(show = lesObjecteurs) {
  const filterName = (id) => show.filters.find((filter) => filter.id === id).name;
  const viewsIn = (filterId) => show.views.filter((view) => view.filters.includes(filterId)).length;
  const artistList = show.artists.join(", ");

  return `
    <section class="section-exh-views" data-exh-views aria-label="Vues de l’exposition ${show.title}">
      <header class="section-exh-views__head">
        <div>
          <p class="section-exh-views__kicker">${show.type} · Vues de l’exposition</p>
          <h2>${show.title}</h2>
          <p class="section-exh-views__artists"><span>Avec</span> ${artistList}</p>
        </div>
        <p class="section-exh-views__meta">${show.venue}<br>${show.dates}<br>${show.credit}</p>
      </header>
      <div class="section-exh-views__bar">
        <div class="section-exh-views__index" role="group" aria-label="${show.filterLabel}">
          <button type="button" data-exh-filter="all" data-name="${show.allLabel}" aria-pressed="true">${show.allLabel}<span>${show.views.length}</span></button>
          ${show.filters.map((filter) => `<button type="button" data-exh-filter="${filter.id}" data-name="${filter.name}" aria-pressed="false">${filter.name}<span>${viewsIn(filter.id)}</span></button>`).join("")}
        </div>
        <p class="section-exh-views__count" data-exh-count aria-live="polite">${show.views.length} vues</p>
      </div>
      <ol class="section-exh-views__grid">
        ${show.views.map((view) => {
          const groupNames = view.filters.map(filterName).join(", ");
          return `
          <li class="exh-view" data-exh-view="${view.id}" data-groups="${view.filters.join(" ")}" data-fit="${view.width / view.height >= 1.5 ? "width" : "height"}">
            <button type="button" class="exh-view__open" aria-haspopup="dialog" aria-label="Agrandir la vue ${view.id}, ${groupNames}">
              <span class="exh-view__frame"><img src="${view.image}" width="${view.width}" height="${view.height}" alt="Vue de l’exposition collective ${show.title}, ${groupNames}. ${show.credit}." loading="lazy" decoding="async"></span>
            </button>
            <p class="exh-view__caption"><span>${view.id}</span>${groupNames}</p>
            <template>${ViewLabel(show, view, groupNames)}</template>
          </li>`;
        }).join("")}
      </ol>
      <dialog class="exh-viewer" data-exh-viewer aria-label="Vue agrandie de l’exposition ${show.title}">
        <div class="exh-viewer__media" data-exh-media></div>
        <aside class="exh-viewer__panel">
          <div class="exh-viewer__top">
            <p class="exh-viewer__counter" data-exh-counter></p>
            <button type="button" class="exh-viewer__close" data-exh-close aria-label="Fermer la vue">×</button>
          </div>
          <div class="exh-viewer__label" data-exh-label></div>
          <div class="exh-viewer__artists">
            <p class="exh-label__name">Artistes de l’exposition</p>
            <p>${artistList}</p>
          </div>
          <p class="exh-viewer__credit">Vue de l’exposition collective <em>${show.title}</em>.<br>${show.credit}.</p>
          <div class="exh-viewer__nav">
            <button type="button" data-exh-step="-1">← Précédente</button>
            <button type="button" data-exh-step="1">Suivante →</button>
          </div>
        </aside>
      </dialog>
    </section>`;
}
