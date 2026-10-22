import { expandArtistPage } from "./artist-page-transition.js";
import { initCardTrioMotion } from "./card-trio-motion.js";
import { initEditorialPhotoCaptions } from "./editorial-photo-caption-interaction.js";
import { initExhibitionMotionStudy } from "./exhibition-motion-study.js";
import { initExhibitionViews } from "./exhibition-views-interaction.js";
import { initGridStory } from "./grid-story-interaction.js";
import { registry } from "./registry.js";
import { renderLibraryBrowser } from "./ui/library-browser.js";
import { renderPlayground } from "./ui/playground.js";

const root = document.querySelector("#patterns-app");

if (root) {
  initEditorialPhotoCaptions(root);
  initGridStory(root);
  initCardTrioMotion(root);
  initExhibitionViews(root);
  initExhibitionMotionStudy(root);
  root.addEventListener("click", (event) => {
    const toggle = event.target.closest("[data-astra-expand-toggle]");
    if (!toggle) return;
    const stack = toggle.closest("[data-astra-expand-stack]");
    const expanded = stack.dataset.expanded !== "true";
    stack.dataset.expanded = String(expanded);
    toggle.setAttribute("aria-expanded", String(expanded));
    toggle.setAttribute("aria-label", expanded ? "Remettre les trois cartes en éventail" : "Rassembler les trois cartes en une fiche");
  });
  if (document.body.dataset.libraryMode === "isolation") {
    renderPlayground(root);
  } else {
    renderLibraryBrowser(root, registry);
  }

  // The list preview is centred in the whitespace left of each column, so the
  // real width of the longest name has to be measured — it varies with the
  // font and with the title-size slider.
  const measureListColumns = () => {
    root.querySelectorAll(".section-artist-grid__col").forEach((column) => {
      const widths = [...column.querySelectorAll("h3")].map((heading) => {
        const range = document.createRange();
        range.selectNodeContents(heading);
        return range.getBoundingClientRect().width;
      });
      if (!widths.length) return;
      const next = `${Math.ceil(Math.max(...widths))}px`;
      if (column.style.getPropertyValue("--artist-list-text") !== next) {
        column.style.setProperty("--artist-list-text", next);
      }
    });
  };

  let scheduled = false;
  const scheduleMeasure = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      measureListColumns();
    });
  };

  scheduleMeasure();
  window.addEventListener("resize", scheduleMeasure);
  root.addEventListener("input", scheduleMeasure);
  document.fonts?.ready.then(scheduleMeasure);
  new MutationObserver(scheduleMeasure).observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-view"] });

  const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const applyArtistBioStep = (card, nextStep) => {
    const expandButton = card.querySelector("[data-artist-bio-expand]");
    const fullPage = card.querySelector(".pattern-artist-bio__full-page");
    const closeButton = card.querySelector("[data-artist-bio-close]");
    const engineName = card.dataset.animationLabel || "animation";

    card.dataset.expandStep = String(nextStep);
    expandButton?.setAttribute("aria-expanded", String(nextStep > 0));
    expandButton?.setAttribute(
      "aria-label",
      nextStep === 2
        ? `Refermer la carte ${engineName} de Vincent Van Gogh`
        : `Développer la carte ${engineName} de Vincent Van Gogh`,
    );
    closeButton?.setAttribute("aria-label", `Refermer la page ${engineName} de Vincent Van Gogh`);
    fullPage?.setAttribute("aria-hidden", String(nextStep !== 2));
  };

  const applyArtistStoryStep = (card, nextStep) => {
    const trigger = card.querySelector("[data-artist-story-expand]");
    card.dataset.storyStep = String(nextStep);
    trigger?.setAttribute("aria-expanded", String(nextStep > 0));
    trigger?.setAttribute(
      "aria-label",
      nextStep === 2
        ? "Réduire la seconde carte de Vincent Van Gogh"
        : "Développer la seconde carte de Vincent Van Gogh",
    );
  };

  const runNativeBioTransition = (card, update) => {
    if (!document.startViewTransition) {
      update();
      return Promise.resolve();
    }
    const transition = document.startViewTransition(update);
    return transition.finished.catch(() => {});
  };

  const runMotionBioTransition = async (card, update) => {
    if (!window.Motion?.animateView || !document.startViewTransition) return runNativeBioTransition(card, update);
    let didUpdate = false;
    const performUpdate = () => {
      didUpdate = true;
      update();
    };
    try {
      const builder = window.Motion
        .animateView(performUpdate, { duration: .68, ease: [.22, 1, .36, 1] })
        .add(card)
        .layout({ duration: .72 })
        .old({ opacity: [1, 0] }, { duration: .48, ease: "linear" })
        .new({ opacity: [0, 1] }, { duration: .48, ease: "linear" });
      const controls = await builder;
      await controls?.finished;
    } catch {
      if (!didUpdate) update();
    }
  };

  const runGsapBioTransition = (card, update) => {
    if (!window.gsap || !window.Flip) return runNativeBioTransition(card, update);
    window.gsap.registerPlugin(window.Flip);
    const layoutParts = [
      card,
      card.querySelector(".pattern-artist-bio__surface"),
      card.querySelector(".pattern-artist-bio__trigger"),
      card.querySelector(".pattern-artist-bio__media"),
    ].filter(Boolean);
    const compactTitle = card.querySelector(".pattern-artist-bio__compact-title");
    const details = card.querySelector(".pattern-artist-bio__details");
    const image = card.querySelector(".pattern-artist-bio__image");
    const detailLines = [
      card.querySelector(".pattern-artist-bio__heading"),
      card.querySelector(".pattern-artist-bio__date"),
      card.querySelector(".pattern-artist-bio__intro"),
    ].filter(Boolean);
    const animatedParts = [...layoutParts, compactTitle, details, image, ...detailLines].filter(Boolean);

    window.gsap.killTweensOf(animatedParts);
    card.classList.add("is-gsap-flipping");
    const state = window.Flip.getState(layoutParts, {
      props: "borderRadius,backgroundColor,padding",
    });
    update();

    // Text reflows as the card widens. Keeping it inside Flip's absolute layer
    // makes the intermediate lines overflow and get clipped by the card.
    // Cross-fade the two text states while Flip handles only the geometry.
    window.gsap.set(layoutParts, { willChange: "transform" });
    if (compactTitle) window.gsap.set(compactTitle, { opacity: 1 });
    if (details) window.gsap.set(details, { opacity: 1, x: 0 });
    if (detailLines.length) window.gsap.set(detailLines, { opacity: 0, y: 12 });
    if (image) window.gsap.set(image, { scale: 1.075, transformOrigin: "50% 50%" });

    return new Promise((resolve) => {
      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        card.classList.remove("is-gsap-flipping");
        window.gsap.set(animatedParts, { clearProps: "willChange,opacity,transform,filter" });
        resolve();
      };

      const flip = window.Flip.from(state, {
        targets: layoutParts,
        absolute: false,
        nested: true,
        scale: false,
        prune: true,
        duration: .92,
        ease: "expo.inOut",
      });

      const timeline = window.gsap.timeline({ onComplete: finish, onInterrupt: finish });
      timeline.add(flip, 0);
      timeline.fromTo(card, { filter: "drop-shadow(0 0 0 rgba(0,0,0,0))" }, {
        filter: "drop-shadow(0 18px 24px rgba(0,0,0,.1))",
        duration: .42,
        repeat: 1,
        yoyo: true,
        ease: "sine.inOut",
      }, .2);
      if (compactTitle) timeline.to(compactTitle, { opacity: 0, y: -6, duration: .22, ease: "power2.in" }, 0);
      if (image) timeline.to(image, { scale: 1, duration: 1.05, ease: "power3.out" }, 0);
      if (detailLines.length) timeline.to(detailLines, {
        opacity: 1,
        y: 0,
        duration: .42,
        stagger: .075,
        ease: "power3.out",
      }, .34);
    });
  };

  const runAnimeBioTransition = (card, update) => {
    if (!window.anime?.createLayout) return runNativeBioTransition(card, update);
    return new Promise((resolve) => {
      const layout = window.anime.createLayout(card, {
        duration: 760,
        ease: "outExpo",
        enterFrom: { opacity: 0, scale: .94 },
        leaveTo: { opacity: 0, scale: .94 },
      });
      layout.update(update, { onComplete: resolve });
    });
  };

  const animateArtistBio = (card, update) => {
    if (prefersReducedMotion()) {
      update();
      return Promise.resolve();
    }
    const runners = {
      native: runNativeBioTransition,
      motion: runMotionBioTransition,
      gsap: runGsapBioTransition,
      anime: runAnimeBioTransition,
    };
    return (runners[card.dataset.animationEngine] || runNativeBioTransition)(card, update);
  };

  root.addEventListener("click", (event) => {
    const engineButton = event.target.closest("[data-artist-bio-engine]");
    if (engineButton) {
      const lab = engineButton.closest(".artist-bio-lab");
      const card = lab?.querySelector(".pattern-artist-bio");
      if (!lab || !card || card.dataset.animating === "true") return;

      lab.dataset.activeEngine = engineButton.dataset.artistBioEngine;
      card.dataset.animationEngine = engineButton.dataset.artistBioEngine;
      card.dataset.animationLabel = engineButton.dataset.engineName;
      applyArtistBioStep(card, 0);
      lab.querySelector(".artist-bio-lab__note strong").textContent = engineButton.dataset.engineName;
      lab.querySelector(".artist-bio-lab__note span").textContent = engineButton.dataset.engineNote;
      engineButton.parentElement.querySelectorAll("[data-artist-bio-engine]").forEach((item) => {
        item.setAttribute("aria-pressed", String(item === engineButton));
      });
      return;
    }

    const closeFullPage = event.target.closest("[data-artist-bio-close]");
    if (closeFullPage) {
      const card = closeFullPage.closest(".pattern-artist-bio");
      if (!card || card.dataset.animating === "true") return;
      card.dataset.animating = "true";
      animateArtistBio(card, () => applyArtistBioStep(card, 0))
        .finally(() => { delete card.dataset.animating; });
      return;
    }

    const expandButton = event.target.closest("[data-artist-bio-expand]");
    if (expandButton) {
      const card = expandButton.closest(".pattern-artist-bio");
      if (!card || card.dataset.animating === "true") return;
      const nextStep = (Number(card.dataset.expandStep || 0) + 1) % 3;
      const storyCard = card.closest(".artist-bio-lab")?.querySelector(".pattern-artist-story");
      if (nextStep > 0 && storyCard) applyArtistStoryStep(storyCard, 0);
      card.dataset.animating = "true";
      const transition = nextStep === 2
        ? expandArtistPage(card, () => applyArtistBioStep(card, nextStep), prefersReducedMotion())
        : animateArtistBio(card, () => applyArtistBioStep(card, nextStep));
      transition.finally(() => { delete card.dataset.animating; });
      return;
    }

    const storyButton = event.target.closest("[data-artist-story-expand]");
    if (storyButton) {
      const storyCard = storyButton.closest(".pattern-artist-story");
      if (!storyCard) return;
      const nextStep = (Number(storyCard.dataset.storyStep || 0) + 1) % 3;
      const originalCard = storyCard.closest(".artist-bio-lab")?.querySelector(".pattern-artist-bio");
      if (nextStep > 0 && originalCard) applyArtistBioStep(originalCard, 0);
      applyArtistStoryStep(storyCard, nextStep);
      return;
    }

    const button = event.target.closest("[data-artist-grid-view]");
    if (!button) return;

    const grid = button.closest(".section-artist-grid") || document.querySelector(".section-artist-grid");
    if (!grid) return;

    grid.dataset.view = button.dataset.artistGridView;
    button.parentElement.querySelectorAll("[data-artist-grid-view]").forEach((item) => {
      item.setAttribute("aria-pressed", String(item === button));
    });
  });
}
