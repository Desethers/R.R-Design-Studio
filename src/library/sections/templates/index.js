import { galleryTemplates, templateStatuses } from "../../data/gallery-templates.js";

// A live page is shown as a desktop-sized iframe scaled down; anything else as a still image.
function TemplatePreview(template) {
  if (template.preview.type === "page") {
    return `<iframe src="${template.preview.src}" title="Aperçu du site ${template.gallery}" loading="lazy" tabindex="-1" aria-hidden="true"></iframe>`;
  }
  return `<img src="${template.preview.src}" alt="" loading="lazy" decoding="async">`;
}

export function GalleryTemplatesDirectory(templates = galleryTemplates) {
  return `
    <section class="section-templates" aria-label="Répertoire des gallery templates">
      <header class="section-templates__head">
        <div>
          <p class="section-templates__kicker">R.R Design Studio · Répertoire</p>
          <h2>Gallery templates</h2>
        </div>
        <p class="section-templates__intro">Sites de galeries redesignés par le studio et diffusés en social content. Concepts non officiels, sans lien avec les galeries citées.</p>
      </header>
      <p class="section-templates__count">${templates.length} ${templates.length > 1 ? "templates" : "template"}</p>
      <ol class="section-templates__grid">
        ${templates.map((template, index) => `
          <li class="tpl-card" data-status="${template.status}">
            <div class="tpl-card__preview">${TemplatePreview(template)}</div>
            <div class="tpl-card__body">
              <div class="tpl-card__top">
                <span>${String(index + 1).padStart(2, "0")} · ${template.city}</span>
                <span class="tpl-card__status">${templateStatuses[template.status]}</span>
              </div>
              <h3 class="tpl-card__name">${template.gallery}</h3>
              <p class="tpl-card__scope">${template.scope}</p>
              <div class="tpl-card__details"><span>Social : ${template.social}</span><span>${template.updated}</span></div>
            </div>
            <a class="tpl-card__link" href="${template.href}" target="_blank" rel="noopener" aria-label="Ouvrir le template ${template.gallery}"></a>
          </li>`).join("")}
        <li class="tpl-card tpl-card--next">
          <span>Prochaine galerie</span>
          <small>Ajouter une entrée dans data/gallery-templates.js</small>
        </li>
      </ol>
    </section>`;
}

export function GalleryTemplatePage(templateId) {
  const template = galleryTemplates.find((entry) => entry.id === templateId);
  return `
    <section class="section-embed section-embed--tall">
      <iframe src="${template.href}" title="Template ${template.gallery}" loading="eager"></iframe>
    </section>`;
}
