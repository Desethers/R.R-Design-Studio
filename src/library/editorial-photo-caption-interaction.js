export function initEditorialPhotoCaptions(root) {
  const updateCarouselRevealRoom = (section) => {
    const distances = [...section.querySelectorAll('.pattern-editorial-photo-caption[data-open="true"] .pattern-editorial-photo-caption__stage')]
      .map((stage) => parseFloat(stage.style.getPropertyValue("--reveal-distance")) || 0);
    const distance = Math.max(...distances, 0);
    section.style.setProperty("--carousel-reveal-room", `${distance ? distance + 12 : 0}px`);
  };

  const updateCarouselControls = (section) => {
    const track = section.querySelector(".section-editorial-photo-captions__items");
    const previous = section.querySelector('[data-editorial-carousel-step="-1"]');
    const next = section.querySelector('[data-editorial-carousel-step="1"]');
    if (!track || !previous || !next) return;

    const atStart = track.scrollLeft <= 1;
    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 1;
    previous.disabled = atStart;
    next.disabled = atEnd;

    const markers = [...section.querySelectorAll("[data-editorial-carousel-index]")];
    const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
    const currentIndex = maxScroll ? Math.round(track.scrollLeft / maxScroll * (markers.length - 1)) : 0;
    markers.forEach((button, index) => {
      button.setAttribute("aria-current", String(index === currentIndex));
    });
  };

  const measureReveal = (image) => {
    const stage = image.closest(".pattern-editorial-photo-caption__stage");
    if (!stage) return;

    const captionHeight = stage.querySelector("figcaption").offsetHeight;
    const distance = Math.max(image.getBoundingClientRect().height / 4, captionHeight + 8);
    stage.style.setProperty("--reveal-distance", `${distance}px`);
    stage.style.setProperty("--caption-top", `${distance - captionHeight - 8}px`);
    const section = stage.closest(".section-editorial-photo-captions");
    if (section) updateCarouselRevealRoom(section);
  };

  const imageObserver = new ResizeObserver((entries) => {
    entries.forEach(({ target }) => measureReveal(target));
  });

  const observedCarousels = new WeakSet();
  const observeImages = () => {
    root.querySelectorAll(".pattern-editorial-photo-caption__image").forEach((image) => {
      if (image.dataset.revealObserved) return;
      image.dataset.revealObserved = "true";
      imageObserver.observe(image);
    });
    root.querySelectorAll(".section-editorial-photo-captions").forEach((section) => {
      if (observedCarousels.has(section)) return;
      observedCarousels.add(section);
      const track = section.querySelector(".section-editorial-photo-captions__items");
      track?.addEventListener("scroll", () => updateCarouselControls(section), { passive: true });
      if (track) new ResizeObserver(() => updateCarouselControls(section)).observe(track);
    });
  };

  new MutationObserver(observeImages).observe(root, { childList: true, subtree: true });
  observeImages();

  root.addEventListener("click", (event) => {
    const layoutButton = event.target.closest("[data-editorial-layout-toggle]");
    if (layoutButton && root.contains(layoutButton)) {
      const section = layoutButton.closest(".section-editorial-photo-captions");
      const carousel = section.dataset.layout !== "carousel";
      section.dataset.layout = carousel ? "carousel" : "sequence";
      layoutButton.setAttribute("aria-pressed", String(carousel));
      layoutButton.setAttribute("aria-label", carousel ? "Restore editorial sequence" : "Show photographs as a carousel");
      layoutButton.title = carousel ? "Restore editorial sequence" : "Show photographs as a carousel";
      updateCarouselRevealRoom(section);
      if (carousel) section.querySelector(".section-editorial-photo-captions__items").scrollLeft = 0;
      requestAnimationFrame(() => updateCarouselControls(section));
      return;
    }

    const carouselButton = event.target.closest("[data-editorial-carousel-step]");
    if (carouselButton && root.contains(carouselButton)) {
      const section = carouselButton.closest(".section-editorial-photo-captions");
      const track = section.querySelector(".section-editorial-photo-captions__items");
      const firstFigure = track.querySelector(".pattern-editorial-photo-caption");
      if (!firstFigure) return;
      const direction = Number(carouselButton.dataset.editorialCarouselStep);
      const step = firstFigure.getBoundingClientRect().width + parseFloat(getComputedStyle(track).gap);
      track.scrollBy({ left: direction * step, behavior: "smooth" });
      return;
    }

    const paginationButton = event.target.closest("[data-editorial-carousel-index]");
    if (paginationButton && root.contains(paginationButton)) {
      const section = paginationButton.closest(".section-editorial-photo-captions");
      const track = section.querySelector(".section-editorial-photo-captions__items");
      const markerCount = section.querySelectorAll("[data-editorial-carousel-index]").length;
      const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
      const left = markerCount > 1 ? Number(paginationButton.dataset.editorialCarouselIndex) / (markerCount - 1) * maxScroll : 0;
      track.scrollTo({ left, behavior: "smooth" });
      return;
    }

    const button = event.target.closest("[data-editorial-photo-toggle]");
    if (!button || !root.contains(button)) return;

    const figure = button.closest(".pattern-editorial-photo-caption");
    const image = button.querySelector("img");
    const caption = figure.querySelector("figcaption");
    const opening = figure.dataset.open !== "true";

    measureReveal(image);
    figure.dataset.open = String(opening);
    updateCarouselRevealRoom(figure.closest(".section-editorial-photo-captions"));
    caption.setAttribute("aria-hidden", String(!opening));
    button.setAttribute("aria-expanded", String(opening));
    button.setAttribute("aria-label", `${opening ? "Hide" : "Reveal"} caption for ${image.alt}`);
  });
}
