// Installation views: the index (spaces, or artists once known) dims then filters the grid,
// and a view opens into a labelled viewer. GSAP Flip carries the same <img>
// between the grid and the viewer, so the photo never swaps or reloads.

const BACKDROP = "rgba(246, 246, 243, .97)";
const BACKDROP_CLEAR = "rgba(246, 246, 243, 0)";

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const speed = (duration) => (reducedMotion() ? 0 : duration);

export function initExhibitionViews(root) {
  if (!window.gsap || !window.Flip) return;
  gsap.registerPlugin(Flip);

  const style = document.createElement("link");
  style.rel = "stylesheet";
  style.href = "/src/styles/exhibition-views.css";
  document.head.append(style);

  const setupAll = () => root.querySelectorAll("[data-exh-views]:not([data-exh-ready])").forEach(setupViews);
  setupAll();
  new MutationObserver(setupAll).observe(root, { childList: true, subtree: true });
}

function setupViews(section) {
  section.dataset.exhReady = "true";
  const items = [...section.querySelectorAll("[data-exh-view]")];
  const filterButtons = [...section.querySelectorAll("[data-exh-filter]")];
  const count = section.querySelector("[data-exh-count]");
  const dialog = section.querySelector("[data-exh-viewer]");
  const media = dialog.querySelector("[data-exh-media]");
  const label = dialog.querySelector("[data-exh-label]");
  const counter = dialog.querySelector("[data-exh-counter]");
  const panelParts = () => dialog.querySelectorAll(".exh-viewer__panel > *");

  let activeFilter = "all";
  let current = null;
  let closing = false;

  const matches = (item, filter) => filter === "all" || item.dataset.groups.split(" ").includes(filter);
  const visibleItems = () => items.filter((item) => !item.hidden);
  const frameOf = (item) => item.querySelector(".exh-view__frame");

  /* Reveal — views rise in as they scroll into sight. */

  let revealed = reducedMotion();
  const reveal = new IntersectionObserver((entries) => {
    const entering = entries.filter((entry) => entry.isIntersecting).map((entry) => entry.target);
    entering.forEach((item) => reveal.unobserve(item));
    if (entering.length) gsap.to(entering, { autoAlpha: 1, y: 0, duration: .8, ease: "power3.out", stagger: .08 });
  }, { threshold: .15 });

  if (!revealed) {
    gsap.set(items, { autoAlpha: 0, y: 24 });
    items.forEach((item) => reveal.observe(item));
  }

  // Filtering and the viewer move views around, so any still waiting to rise are shown at once.
  const finishReveal = () => {
    if (revealed) return;
    revealed = true;
    reveal.disconnect();
    gsap.killTweensOf(items);
    gsap.set(items, { autoAlpha: 1, y: 0 });
  };

  /* Index — hovering an entry dims the views outside it. */

  const highlight = (filter) => {
    const active = Boolean(filter) && filter !== "all";
    section.classList.toggle("is-highlighting", active);
    items.forEach((item) => item.classList.toggle("is-match", active && matches(item, filter)));
  };

  const linkFilters = (item, on) => {
    filterButtons.forEach((button) => {
      const filter = button.dataset.exhFilter;
      button.classList.toggle("is-linked", on && filter !== "all" && matches(item, filter));
    });
  };

  // Choosing an entry keeps only its views; Flip slides the remaining ones into place.
  const applyFilter = (filter) => {
    activeFilter = filter;
    filterButtons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.exhFilter === filter)));
    finishReveal();
    highlight(null);

    const state = Flip.getState(items);
    items.forEach((item) => { item.hidden = !matches(item, filter); });

    const shown = visibleItems().length;
    const name = filterButtons.find((button) => button.dataset.exhFilter === filter).dataset.name;
    count.textContent = filter === "all" ? `${shown} vues` : `${shown} ${shown > 1 ? "vues" : "vue"} · ${name}`;

    Flip.from(state, {
      duration: speed(.7),
      ease: "power3.inOut",
      absolute: true,
      stagger: .02,
      onEnter: (entering) => gsap.fromTo(entering, { autoAlpha: 0, scale: .96 }, { autoAlpha: 1, scale: 1, duration: speed(.5), delay: speed(.2), ease: "power2.out" }),
      onLeave: (leaving) => gsap.to(leaving, { autoAlpha: 0, scale: .96, duration: speed(.3), ease: "power1.in" }),
    });
  };

  /* Viewer — the photo flies out of the grid, the label follows. */

  const fillPanel = (item) => {
    const list = visibleItems();
    counter.textContent = `Vue ${item.dataset.exhView} — ${list.indexOf(item) + 1} / ${list.length}`;
    label.replaceChildren(item.querySelector("template").content.cloneNode(true));
  };

  const openView = (item) => {
    if (dialog.open) return;
    finishReveal();
    current = item;
    fillPanel(item);

    const image = item.querySelector("img");
    const state = Flip.getState(image);
    dialog.showModal();
    media.append(image);

    gsap.fromTo(dialog, { backgroundColor: BACKDROP_CLEAR }, { backgroundColor: BACKDROP, duration: speed(.45), ease: "power1.out" });
    Flip.from(state, { duration: speed(.75), ease: "power3.inOut", scale: true });
    gsap.fromTo(panelParts(), { autoAlpha: 0, y: 12 }, {
      autoAlpha: 1, y: 0, duration: speed(.5), delay: speed(.3), ease: "power2.out", stagger: .05, overwrite: true,
    });
  };

  const closeView = () => {
    if (!dialog.open || closing) return;
    closing = true;
    const image = media.querySelector("img");

    gsap.to(panelParts(), { autoAlpha: 0, duration: speed(.2), overwrite: true });
    gsap.to(dialog, {
      backgroundColor: BACKDROP_CLEAR,
      duration: speed(.35),
      ease: "power1.inOut",
      onComplete: () => {
        // Record the photo where it is, put it back in its frame, then fly it home over the page.
        const state = Flip.getState(image);
        frameOf(current).append(image);
        dialog.close();
        Flip.from(state, {
          duration: speed(.6), ease: "power3.inOut", scale: true, zIndex: 30,
          onComplete: () => { closing = false; },
        });
      },
    });
  };

  // Stepping only walks through the views the current filter shows.
  const stepView = (direction) => {
    if (!dialog.open || closing) return;
    const list = visibleItems();
    const next = list[(list.indexOf(current) + direction + list.length) % list.length];
    if (next === current) return;

    frameOf(current).append(media.querySelector("img"));
    current = next;
    const image = next.querySelector("img");
    image.loading = "eager";
    media.append(image);
    fillPanel(next);

    gsap.fromTo(image, { autoAlpha: 0, x: 40 * direction }, {
      autoAlpha: 1, x: 0, duration: speed(.55), ease: "power3.out", clearProps: "opacity,visibility,transform",
    });
    gsap.fromTo(label.children, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: speed(.45), ease: "power2.out", stagger: .05 });
  };

  /* Wiring */

  filterButtons.forEach((button) => {
    const filter = button.dataset.exhFilter;
    button.addEventListener("pointerenter", () => highlight(filter));
    button.addEventListener("pointerleave", () => highlight(null));
    button.addEventListener("focus", () => highlight(filter));
    button.addEventListener("blur", () => highlight(null));
    button.addEventListener("click", () => applyFilter(filter === activeFilter ? "all" : filter));
  });

  items.forEach((item) => {
    item.addEventListener("pointerenter", () => linkFilters(item, true));
    item.addEventListener("pointerleave", () => linkFilters(item, false));
    item.querySelector(".exh-view__open").addEventListener("click", () => openView(item));
  });

  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeView();
  });
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog || event.target === media) closeView();
  });
  dialog.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") stepView(1);
    if (event.key === "ArrowLeft") stepView(-1);
  });
  dialog.querySelector("[data-exh-close]").addEventListener("click", closeView);
  dialog.querySelectorAll("[data-exh-step]").forEach((button) => {
    button.addEventListener("click", () => stepView(Number(button.dataset.exhStep)));
  });
}
