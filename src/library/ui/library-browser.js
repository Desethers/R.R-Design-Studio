import { viewButtons } from "./view-icons.js";

function familyName(value) {
  return value.replaceAll("-", " ");
}

const libraryGroups = [
  {
    id: "pages",
    label: "Pages",
    categories: [
      { id: "home", label: "Home", componentIds: [] },
      { id: "artist", label: "Artist", componentIds: ["artist-full-page-03", "artist-full-page-02", "artist-full-page-01"] },
      { id: "exhibition", label: "Exhibition", componentIds: ["exhibition-embracing-01", "exhibition-embracing-02", "exhibition-archive-01"] },
      { id: "artwork", label: "Artwork", componentIds: ["selected-works-01"] },
      { id: "shop", label: "Shop", componentIds: [] },
    ],
  },
  {
    id: "components",
    label: "Components",
    categories: [
      { id: "navigation", label: "Navigation", componentIds: ["gallery-header-01", "artist-subnavigation-01", "artist-index-row-01", "exhibition-filters-01"] },
      { id: "artwork-viewing", label: "Artwork Viewing", componentIds: ["artwork-card-01", "artwork-card-02", "artist-grid-01", "artist-grid-02", "exhibition-views-01"] },
      { id: "editorial", label: "Editorial", componentIds: ["artist-bio-01", "artist-bio-02", "artist-bio-03", "artist-bio-04", "artist-bio-05", "exhibition-text-01", "exhibition-motion-01", "artwork-quote-01", "editorial-photo-caption-01"] },
    ],
  },
  {
    id: "gallery-sites",
    label: "Gallery Sites",
    flat: true,
    categories: [
      { id: "darmo", label: "Darmo", componentIds: ["template-darmo-01", "template-darmo-02"] },
      { id: "in-situ-fabienne-leclerc", label: "In Situ — Fabienne Leclerc", componentIds: ["template-in-situ-01"] },
      { id: "les-objecteurs", label: "Les Objecteurs", componentIds: ["template-objecteurs-01"] },
      { id: "galerie-allen", label: "Galerie Allen", componentIds: ["template-galerie-allen-01"] },
      { id: "galerie-template", label: "Galerie Template", componentIds: ["template-galerie-01"] },
    ],
  },
];

function categoryEntries(registry, category) {
  return category.componentIds.map((id) => registry.find((entry) => entry.id === id)).filter(Boolean);
}

function componentButton(entry, activeId) {
  return `
    <button type="button" data-component-id="${entry.id}" aria-pressed="${entry.id === activeId}">
      <strong>${entry.name}</strong>
    </button>`;
}

function componentList(entries, activeId) {
  return entries.map((entry) => componentButton(entry, activeId)).join("");
}

function visualOnly(entry) {
  const markup = entry.render();
  const template = document.createElement("template");
  template.innerHTML = markup;
  const trioViewport = template.content.querySelector(".trio-lab__viewport");
  if (trioViewport) {
    return `<div class="workspace-tile__frame" aria-hidden="true" inert><div class="workspace-tile__content is-focused is-trio-preview"><div class="workspace-tile__trio">${trioViewport.outerHTML}</div></div></div>`;
  }
  const focused = template.content.querySelector(".pattern-artist-bio, .pattern-artist-story, .astra-expand-stack");
  return `<div class="workspace-tile__frame" aria-hidden="true" inert><div class="workspace-tile__content${focused ? " is-focused" : ""}">${focused ? focused.outerHTML : markup}</div></div>`;
}

function workspaceGrid(entries, activeId, openInWorkspace = false) {
  if (!entries.length) return '<div class="workspace-tiles__empty" aria-label="Nothing here yet"></div>';
  return `
    <div class="workspace-tiles__grid">
      ${entries.map((entry) => {
        const externalLink = entry.href && !openInWorkspace;
        return `
        <${externalLink ? "a" : "article"} class="workspace-tile" data-layout="${entry.layout}" data-interaction="${entry.interaction}" data-tile-component="${entry.id}" ${externalLink ? `href="${entry.href}" target="_blank" rel="noopener" aria-label="${entry.name} (nouvel onglet)"` : `role="button" tabindex="0" aria-label="${entry.name}" aria-pressed="${entry.id === activeId}"`}>
          <span class="workspace-tile__label">${entry.name}</span>
          ${visualOnly(entry)}
        </${externalLink ? "a" : "article"}>`;
      }).join("")}
    </div>`;
}

const categoryIcons = {
  home: "⌂", artist: "◎", exhibition: "▦", artwork: "□", shop: "◇",
  navigation: "↳", "artwork-viewing": "◉", editorial: "¶", "galerie-template": "▭", "les-objecteurs": "▭", "in-situ-fabienne-leclerc": "▭", "galerie-allen": "▭",
};

function archiveNavigation(activeGroup, activeCategory, activeEntryId) {
  return libraryGroups.map((group) => `
    <section class="workspace-archive-group">
      <h2>${group.label}</h2>
      ${group.categories.map((category) => {
        const active = group.id === activeGroup.id && category.id === activeCategory.id;
        return `
          <button type="button" class="workspace-archive-category" data-group-id="${group.id}" data-category-id="${category.id}" aria-pressed="${active}">
            <span aria-hidden="true">${categoryIcons[category.id] || "·"}</span><strong>${category.label}</strong>
          </button>
          ${category.id === "darmo" && group.id === "gallery-sites" ? `
            <div class="workspace-category-items workspace-category-items--darmo" aria-label="Versions Darmo">
              <button type="button" data-component-id="template-darmo-01" aria-pressed="${activeEntryId === "template-darmo-01"}"><strong>Version 1</strong></button>
              <button type="button" data-component-id="template-darmo-02" aria-pressed="${activeEntryId === "template-darmo-02"}"><strong>Version 2</strong></button>
            </div>` : ""}`;
      }).join("")}
    </section>`).join("");
}

const componentSettings = {
  "artist-grid-01": {
    storageKey: "artist-grid-01-settings",
    target: ".section-artist-grid",
    controls: [
      { id: "radius", label: "Image corner radius", min: 0, max: 24, value: 20, property: "--artist-grid-radius", icon: "radius" },
      { id: "title-size", label: "Artist title size", min: 10, max: 22, value: 15, property: "--artist-grid-title-size", icon: "type" },
    ],
  },
  "artist-grid-02": {
    storageKey: "artist-grid-02-settings",
    target: ".section-artist-grid",
    controls: [
      { id: "radius", label: "Image corner radius", min: 0, max: 40, value: 12, property: "--artist-grid-radius", icon: "radius" },
      { id: "title-size", label: "Artist title size", min: 10, max: 24, value: 15, property: "--artist-grid-title-size", icon: "type" },
    ],
  },
  "artist-bio-05": {
    storageKey: "artist-bio-05-settings",
    target: ".trio-lab",
    controls: [
      { id: "radius", label: "Card corner radius", min: 0, max: 40, value: 12, property: "--trio-card-radius", icon: "radius" },
      { id: "text-size", label: "Biography text size", min: 10, max: 17, value: 13, property: "--trio-text-size", icon: "type" },
    ],
  },
};

const settingIcons = {
  radius: '<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 10V6a3.5 3.5 0 0 1 3.5-3.5h4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
  type: '<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M9 4v3h5v12h3V7h5V4H9zM3 12v3h3v4h3v-4h3v-3H3z"/></svg>',
};

function componentTools(entry) {
  const settings = componentSettings[entry.id];
  if (!settings) return "";

  const saved = JSON.parse(localStorage.getItem(settings.storageKey) || "{}");

  return `
    <div class="workspace-screen__settings">
      <button class="workspace-screen__settings-toggle" type="button" data-settings-toggle aria-expanded="false" aria-label="Afficher les réglages">
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 5h12M4 10h12M4 15h12M7 3v4M13 8v4M9 13v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
      </button>
      <div class="workspace-screen__tools" aria-label="${entry.name} controls" hidden>
        ${settings.controls.map((control) => {
          const value = Number.isFinite(saved[control.id]) ? saved[control.id] : control.value;
          return `<label>
            <span class="sr-only">${control.label}</span>
            <span class="workspace-screen__tool-icon" aria-hidden="true">${settingIcons[control.icon]}</span>
            <input type="range" min="${control.min}" max="${control.max}" step="1" value="${value}" data-component-setting="${control.id}">
            <output>${value} px</output>
          </label>`;
        }).join("")}
      </div>
    </div>`;
}

function applyComponentSettings(root, entry) {
  const settings = componentSettings[entry?.id];
  if (!settings) return;
  const target = root.querySelector(settings.target);
  if (!target) return;
  const saved = JSON.parse(localStorage.getItem(settings.storageKey) || "{}");
  settings.controls.forEach((control) => {
    const value = Number.isFinite(saved[control.id]) ? saved[control.id] : control.value;
    target.style.setProperty(control.property, `${value}px`);
  });
}

const previewViews = new Set(["desktop", "mobile", "square", "portrait"]);
const previewBackgrounds = new Set(["white", "light", "dark", "transparent", "vapor"]);

function previewState(entry) {
  let saved = {};
  try {
    saved = JSON.parse(localStorage.getItem(`library-preview-${entry.id}`) || "{}");
  } catch {
    saved = {};
  }
  return {
    view: previewViews.has(saved.view) ? saved.view : "desktop",
    background: previewBackgrounds.has(saved.background) ? saved.background : previewBackground(entry),
    scale: Number.isFinite(saved.scale) ? Math.min(120, Math.max(60, saved.scale)) : 100,
  };
}

function savePreviewState(entry, values) {
  if (!entry) return;
  const current = previewState(entry);
  localStorage.setItem(`library-preview-${entry.id}`, JSON.stringify({ ...current, ...values }));
}

function viewTools(activeView) {
  return `
    <div class="workspace-screen__view-settings">
      <button class="workspace-screen__view-toggle" type="button" data-view-toggle aria-expanded="false" aria-label="Afficher les formats d’affichage">
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="1.5" y="2.5" width="13" height="8" rx="1" stroke="currentColor" stroke-width="1.2"/><path d="M6 13.5h4M8 10.5v3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
      </button>
      <div role="group" aria-label="Preview format" class="workspace-screen__view-icons workspace-screen__view-popover" hidden>
        ${viewButtons(activeView)}
      </div>
    </div>`;
}

const backgroundLabels = { white: "White", light: "Light", dark: "Dark", transparent: "Transparent", vapor: "Vapor" };

function previewBackground(entry) {
  return entry?.background || "light";
}

function backgroundTools(activeBackground) {
  return `
    <div class="workspace-screen__background-settings">
      <button class="workspace-screen__background-toggle" type="button" data-background-toggle aria-expanded="false" aria-label="Afficher les fonds">
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="5.6" stroke="currentColor" stroke-width="1.2"/><path d="M8 2.4a5.6 5.6 0 0 1 0 11.2z" fill="currentColor"/></svg>
      </button>
      <div role="group" aria-label="Preview background" class="workspace-screen__background-icons workspace-screen__view-popover" hidden>
        ${["white", "light", "dark", "transparent", "vapor"].map((value) => `
        <button type="button" data-background="${value}" data-swatch="${value}" aria-pressed="${value === activeBackground}" aria-label="${backgroundLabels[value]}" title="${backgroundLabels[value]}"></button>`).join("")}
      </div>
    </div>`;
}

function scaleTools(activeScale) {
  return `
    <div class="workspace-screen__scale-settings">
      <button class="workspace-screen__scale-toggle" type="button" data-scale-toggle aria-expanded="false" aria-label="Afficher l’échelle">
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M9.5 2.5h4v4M13.5 2.5 9.8 6.2M6.5 13.5h-4v-4M2.5 13.5l3.7-3.7" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <div class="workspace-screen__scale-popover workspace-screen__view-popover" hidden>
        <label class="playground-scale"><span class="sr-only">Scale</span><input type="range" min="60" max="120" value="${activeScale}" step="5"><output>${activeScale}%</output></label>
      </div>
    </div>`;
}

function preview(entry, category, entries) {
  if (!entry) {
    return `<div class="workspace-screen__empty"><p>${category.label}</p><span>Nothing here yet.</span></div>`;
  }
  const state = previewState(entry);
  return `
    <header class="workspace-screen__header">
      <div class="workspace-screen__title">
        <button type="button" class="workspace-screen__back" data-return-grid>← Grid</button>
      </div>
      <div class="workspace-screen__tools-slot">
        ${viewTools(state.view)}
        ${backgroundTools(state.background)}
        ${scaleTools(state.scale)}
        ${componentTools(entry)}
      </div>
      <a href="/library/record/?component=${encodeURIComponent(entry.id)}&record=1&returnArea=${encodeURIComponent(category.id)}">Record <span aria-hidden="true">↗</span></a>
    </header>
    <div class="workspace-screen__canvas" data-view="${state.view}" data-background="${state.background}" data-layout="${entry.layout}" style="--object-scale:${state.scale / 100}">
      <div class="workspace-screen__object">${entry.render()}</div>
    </div>`;
}

export function renderLibraryBrowser(root, registry) {
  const params = new URLSearchParams(window.location.search);
  const requestedComponent = params.get("component");
  const categoryForComponent = (id) => libraryGroups
    .flatMap((group) => group.categories.map((category) => ({ group, category })))
    .find(({ category }) => category.componentIds.includes(id));
  const requestedLocation = categoryForComponent(requestedComponent);
  let activeGroup = libraryGroups.find((group) => group.id === params.get("area")) || requestedLocation?.group || libraryGroups[0];
  let activeCategory = activeGroup.categories.find((category) => category.id === params.get("category"))
    || (requestedLocation?.group === activeGroup ? requestedLocation.category : activeGroup.categories.find((category) => category.componentIds.length));
  let entries = categoryEntries(registry, activeCategory);
  let selected = entries.find((entry) => entry.id === requestedComponent) || entries[0];
  let currentView = requestedComponent && selected?.id === requestedComponent && params.get("view") !== "grid" ? "page" : "grid";
  let query = "";

  const syncUrl = () => {
    const next = new URLSearchParams({ area: activeGroup.id, category: activeCategory.id });
    if (selected) next.set("component", selected.id);
    next.set("view", currentView);
    window.history.replaceState(null, "", `${window.location.pathname}?${next}`);
  };

  root.innerHTML = `
    <main class="library-workspace" data-area="${activeGroup.id}">
      <button type="button" class="workspace-panel__toggle" aria-label="Collapse panel" aria-pressed="false">‹</button>
      <aside class="workspace-panel">
        <header class="workspace-panel__header">
          <div><p>R.R Design Studio</p><span>forart.world</span></div>
        </header>
        <div class="workspace-panel__controls">
          <label>
            <span>Search</span>
            <input type="search" placeholder="Search components..." autocomplete="off">
          </label>
        </div>
        <nav class="workspace-archive-nav" aria-label="Library archive">
          ${archiveNavigation(activeGroup, activeCategory, selected?.id)}
        </nav>
        <nav class="workspace-component-list workspace-command-palette" aria-label="Search results" hidden></nav>
      </aside>
      <section class="${currentView === "page" ? "workspace-screen" : "workspace-tiles"}" aria-live="polite">
        ${currentView === "page" ? preview(selected, activeCategory, entries) : workspaceGrid(entries, selected?.id, activeGroup.id === "gallery-sites")}
      </section>
    </main>`;

  const archiveNav = root.querySelector(".workspace-archive-nav");
  const list = root.querySelector(".workspace-command-palette");
  const screen = root.querySelector(".workspace-tiles, .workspace-screen");
  const search = root.querySelector('.workspace-panel input[type="search"]');
  const workspace = root.querySelector(".library-workspace");
  const panelToggle = root.querySelector(".workspace-panel__toggle");
  const cataloguePreviewSize = 250;
  if (currentView === "page") applyComponentSettings(screen, selected);

  panelToggle.addEventListener("click", () => {
    const collapsed = workspace.dataset.panel === "collapsed";
    workspace.dataset.panel = collapsed ? "expanded" : "collapsed";
    panelToggle.setAttribute("aria-pressed", String(!collapsed));
    panelToggle.textContent = collapsed ? "‹" : "›";
    panelToggle.setAttribute("aria-label", collapsed ? "Collapse panel" : "Expand panel");
  });

  // Measure the rendered object at its natural width, then fit the miniature.
  let previewFrame;
  const fitTiles = () => {
    cancelAnimationFrame(previewFrame);
    previewFrame = requestAnimationFrame(() => {
      screen.querySelectorAll(".workspace-tile").forEach((tile) => {
        const frame = tile.querySelector(".workspace-tile__frame");
        const content = tile.querySelector(".workspace-tile__content");
        const focused = content.classList.contains("is-focused");
        const object = content.firstElementChild;
        const width = focused ? object.offsetWidth : content.offsetWidth;
        const height = focused ? object.offsetHeight : content.offsetHeight;
        if (!width || !height) return;
        const availableWidth = Math.max(120, tile.clientWidth - 20);
        const previewSize = Math.min(cataloguePreviewSize, availableWidth);
        const scale = Math.min(previewSize / width, cataloguePreviewSize / height, 1.12);
        content.style.transform = `translate(-50%, -50%) scale(${scale})`;
        frame.style.width = `${Math.ceil(previewSize) + 20}px`;
        frame.style.height = `${Math.ceil(height * scale) + 20}px`;
      });
    });
  };
  new ResizeObserver(fitTiles).observe(screen);
  screen.addEventListener("load", fitTiles, true);
  const fitGalleryFrame = () => {
    const host = screen.querySelector('.workspace-screen .section-embed[data-external-site="true"]');
    if (!host) return;
    const frame = host.querySelector("iframe");
    const width = host.clientWidth;
    const height = host.clientHeight;
    if (!frame || !width || !height) return;
    const pageWidth = Math.max(width, 1440);
    const scale = width / pageWidth;
    frame.style.width = `${pageWidth}px`;
    frame.style.height = `${height / scale}px`;
    frame.style.transform = `scale(${scale})`;
  };
  const galleryFrameObserver = new ResizeObserver(fitGalleryFrame);
  const fitDesktopPageFrame = () => {
    const host = screen.querySelector('.workspace-screen .section-embed[data-desktop-preview="true"]');
    if (!host) return;
    const frame = host.querySelector("iframe");
    if (!frame) return;
    const isDesktop = host.closest('.workspace-screen__canvas')?.dataset.view === "desktop";
    if (!isDesktop) {
      frame.style.removeProperty("width");
      frame.style.removeProperty("height");
      frame.style.removeProperty("transform");
      return;
    }
    const width = host.clientWidth;
    const height = host.clientHeight;
    if (!width || !height) return;
    const pageWidth = Math.max(width, 1100);
    const scale = width / pageWidth;
    frame.style.width = `${pageWidth}px`;
    frame.style.height = `${height / scale}px`;
    frame.style.transform = `scale(${scale})`;
  };
  const desktopPageObserver = new ResizeObserver(fitDesktopPageFrame);
  const observeGalleryFrame = () => {
    galleryFrameObserver.disconnect();
    desktopPageObserver.disconnect();
    const host = screen.querySelector(".workspace-screen .section-embed");
    if (activeGroup.id === "gallery-sites" && host) galleryFrameObserver.observe(host);
    if (host?.dataset.desktopPreview === "true") desktopPageObserver.observe(host);
  };
  screen.addEventListener("load", (event) => {
    if (event.target.tagName !== "IFRAME") return;
    const frame = event.target;
    let page;
    try {
      page = frame.contentDocument;
    } catch {
      // Third-party pages cannot be styled from the library document.
    }
    if (page && !page.querySelector('style[data-library-cursor-fallback]')) {
      const cursorFallback = page.createElement("style");
      cursorFallback.dataset.libraryCursorFallback = "";
      cursorFallback.textContent = `
        html:has(style[data-browser-comment-cursor-style]),
        html:has(style[data-browser-comment-cursor-style]) body,
        html:has(style[data-browser-comment-cursor-style]) body * {
          cursor: default !important;
        }
        html:has(style[data-browser-comment-cursor-style]) a,
        html:has(style[data-browser-comment-cursor-style]) button,
        html:has(style[data-browser-comment-cursor-style]) [role="button"] {
          cursor: pointer !important;
        }
        html:has(style[data-browser-comment-cursor-style]) input,
        html:has(style[data-browser-comment-cursor-style]) textarea {
          cursor: text !important;
        }`;
      page.head.append(cursorFallback);
    }
    fitDesktopPageFrame();
    if (activeGroup.id !== "gallery-sites") return;
    const host = frame.closest(".section-embed");
    if (!host) return;
    host.dataset.externalSite = String(!page);
    if (!page) {
      workspace.style.setProperty("--gallery-site-background", "#fff");
      fitGalleryFrame();
      return;
    }
    frame.style.removeProperty("width");
    frame.style.removeProperty("height");
    frame.style.removeProperty("transform");
    try {
      const bodyBackground = getComputedStyle(page.body).backgroundColor;
      const htmlBackground = getComputedStyle(page.documentElement).backgroundColor;
      const background = bodyBackground === "rgba(0, 0, 0, 0)" ? htmlBackground : bodyBackground;
      workspace.style.setProperty("--gallery-site-background", background === "rgba(0, 0, 0, 0)" ? "#fff" : background);
    } catch {
      workspace.style.setProperty("--gallery-site-background", "#fff");
    }
  }, true);
  document.fonts?.ready.then(fitTiles);
  fitTiles();
  if (currentView === "page") observeGalleryFrame();

  const renderNavigation = () => {
    workspace.dataset.area = activeGroup.id;
    archiveNav.innerHTML = archiveNavigation(activeGroup, activeCategory, selected?.id);
    archiveNav.hidden = Boolean(query);
    list.hidden = !query;
    if (!query) return;
    const canonicalIds = new Set(libraryGroups.flatMap((group) => group.categories.flatMap((category) => category.componentIds)));
    const results = registry.filter((entry) => canonicalIds.has(entry.id)).filter((entry) => {
      const text = [entry.code, entry.family, entry.name, entry.type, ...entry.tags].join(" ").replaceAll("-", " ").toLowerCase();
      return text.includes(query);
    });
    list.innerHTML = `<p>Results · ${results.length}</p>${results.length ? componentList(results, selected?.id) : '<span class="workspace-empty">No components found.</span>'}`;
  };

  const showGrid = () => {
    currentView = "grid";
    galleryFrameObserver.disconnect();
    desktopPageObserver.disconnect();
    screen.className = "workspace-tiles";
    screen.innerHTML = workspaceGrid(entries, selected?.id, activeGroup.id === "gallery-sites");
    fitTiles();
    syncUrl();
  };

  const showPreview = () => {
    currentView = "page";
    workspace.style.removeProperty("--gallery-site-background");
    screen.className = "workspace-screen";
    screen.innerHTML = preview(selected, activeCategory, entries);
    observeGalleryFrame();
    applyComponentSettings(screen, selected);
    syncUrl();
  };

  const selectEntry = (id) => {
    const location = categoryForComponent(id);
    if (location) {
      activeGroup = location.group;
      activeCategory = location.category;
      entries = categoryEntries(registry, activeCategory);
    }
    selected = registry.find((entry) => entry.id === id) || selected;
    query = "";
    search.value = "";
    renderNavigation();
    showPreview();
  };

  const stepVariant = (direction) => {
    if (entries.length < 2 || !selected) return;
    const index = entries.findIndex((entry) => entry.id === selected.id);
    selectEntry(entries[(index + direction + entries.length) % entries.length].id);
  };

  archiveNav.addEventListener("click", (event) => {
    const version = event.target.closest(".workspace-category-items--darmo [data-component-id]");
    if (version) {
      selectEntry(version.dataset.componentId);
      return;
    }
    const button = event.target.closest("[data-category-id]");
    if (!button) return;
    if (button.dataset.groupId === "gallery-sites" && button.dataset.categoryId === "darmo") {
      selectEntry("template-darmo-01");
      return;
    }
    activeGroup = libraryGroups.find((group) => group.id === button.dataset.groupId) || activeGroup;
    activeCategory = activeGroup.categories.find((category) => category.id === button.dataset.categoryId) || activeGroup.categories[0];
    entries = categoryEntries(registry, activeCategory);
    selected = entries[0];
    query = "";
    search.value = "";
    renderNavigation();
    showGrid();
  });

  list.addEventListener("click", (event) => {
    const button = event.target.closest("[data-component-id]");
    if (button) selectEntry(button.dataset.componentId);
  });
  search.addEventListener("input", () => {
    query = search.value.trim().replaceAll("-", " ").toLowerCase();
    renderNavigation();
  });

  screen.addEventListener("click", (event) => {
    if (event.target.closest("[data-return-grid]")) {
      showGrid();
      return;
    }
    const recordVariant = event.target.closest("[data-record-variant]");
    if (recordVariant) {
      const recordLink = screen.querySelector('a[href*="/library/record/"]');
      if (recordLink) {
        const recordUrl = new URL(recordLink.href, window.location.origin);
        recordUrl.searchParams.set("variant", recordVariant.dataset.recordVariant);
        recordLink.href = recordUrl.pathname + recordUrl.search;
      }
    }
    const step = event.target.closest("[data-variant-step]");
    if (step) {
      stepVariant(Number(step.dataset.variantStep));
      return;
    }
    const tile = event.target.closest("[data-tile-component]");
    if (!tile || tile.matches("a[href]")) return;
    selectEntry(tile.dataset.tileComponent);
  });

  screen.addEventListener("keydown", (event) => {
    const tile = event.target.closest("[data-tile-component]");
    if (tile && !tile.matches("a[href]") && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      selectEntry(tile.dataset.tileComponent);
    }
  });

  window.addEventListener("keydown", (event) => {
    if (!screen.classList.contains("workspace-screen") || event.metaKey || event.ctrlKey || event.altKey || event.target.closest("input, select, textarea, button, [contenteditable]")) return;
    if (event.key === "Escape") showGrid();
    if (event.key === "ArrowLeft") stepVariant(-1);
    if (event.key === "ArrowRight") stepVariant(1);
  });

  root.addEventListener("input", (event) => {
    const control = event.target.closest("[data-component-setting]");
    if (control) {
      const settings = componentSettings[selected?.id];
      const definition = settings?.controls.find((item) => item.id === control.dataset.componentSetting);
      const target = settings && root.querySelector(`.workspace-screen ${settings.target}`);
      if (!settings || !definition || !target) return;
      const value = Number(control.value);
      target.style.setProperty(definition.property, `${value}px`);
      control.nextElementSibling.value = `${value} px`;
      const saved = JSON.parse(localStorage.getItem(settings.storageKey) || "{}");
      saved[definition.id] = value;
      localStorage.setItem(settings.storageKey, JSON.stringify(saved));
      return;
    }

    const scaleInput = event.target.closest(".playground-scale input");
    if (scaleInput) {
      const canvas = screen.querySelector(".workspace-screen__canvas");
      canvas.style.setProperty("--object-scale", String(Number(scaleInput.value) / 100));
      scaleInput.nextElementSibling.value = `${scaleInput.value}%`;
      savePreviewState(selected, { scale: Number(scaleInput.value) });
    }
  });

  const popoverLabels = {
    "data-view-toggle": ["Afficher les formats d’affichage", "Masquer les formats d’affichage"],
    "data-background-toggle": ["Afficher les fonds", "Masquer les fonds"],
    "data-scale-toggle": ["Afficher l’échelle", "Masquer l’échelle"],
    "data-settings-toggle": ["Afficher les réglages", "Masquer les réglages"],
  };
  const popoverToggles = Object.keys(popoverLabels);

  const closePopovers = (except) => {
    screen.querySelectorAll(popoverToggles.map((attr) => `[${attr}]`).join(",")).forEach((toggle) => {
      if (toggle === except) return;
      const attr = popoverToggles.find((name) => toggle.hasAttribute(name));
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", popoverLabels[attr][0]);
      toggle.nextElementSibling.hidden = true;
    });
  };

  root.addEventListener("click", (event) => {
    const toggle = event.target.closest(popoverToggles.map((attr) => `[${attr}]`).join(","));
    if (toggle) {
      const attr = popoverToggles.find((name) => toggle.hasAttribute(name));
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      closePopovers(toggle);
      toggle.setAttribute("aria-expanded", String(!expanded));
      toggle.setAttribute("aria-label", popoverLabels[attr][expanded ? 0 : 1]);
      toggle.nextElementSibling.hidden = expanded;
      return;
    }

    if (!event.target.closest(".workspace-screen__view-popover, .workspace-screen__tools")) closePopovers();

    const viewButton = event.target.closest("[data-view]");
    if (viewButton) {
      const canvas = screen.querySelector(".workspace-screen__canvas");
      canvas.dataset.view = viewButton.dataset.view;
      fitDesktopPageFrame();
      savePreviewState(selected, { view: viewButton.dataset.view });
      viewButton.parentElement.querySelectorAll("[data-view]").forEach((item) => {
        item.setAttribute("aria-pressed", String(item === viewButton));
      });
      closePopovers();
      return;
    }

    const bgButton = event.target.closest(".workspace-screen__background-icons [data-background]");
    if (bgButton) {
      const canvas = screen.querySelector(".workspace-screen__canvas");
      canvas.dataset.background = bgButton.dataset.background;
      savePreviewState(selected, { background: bgButton.dataset.background });
      bgButton.parentElement.querySelectorAll("[data-background]").forEach((item) => {
        item.setAttribute("aria-pressed", String(item === bgButton));
      });
      closePopovers();
    }
  });

  syncUrl();
}
