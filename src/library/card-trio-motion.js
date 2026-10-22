// Card trio motion study — one set of three cards, several choreographies.
// Every pose is written by GSAP, so switching variant never leaves CSS leftovers.

const SCENE_WIDTH = 760;
const SCENE_HEIGHT = 620;
const HEADER_SPACE = 90;

// Resting fan, relative to the centre of the scene (front card first).
const FAN = {
  portrait: { x: -74, y: 32, rotation: -4, zIndex: 3 },
  bio: { x: -4, y: -13, rotation: 0, zIndex: 2 },
  artwork: { x: 74, y: -36, rotation: 2.5, zIndex: 1 },
};
const DECK_SLOTS = [FAN.portrait, FAN.bio, FAN.artwork];
const DEPTH = { portrait: 1, bio: .55, artwork: .2 };
const HOVER_VARIANTS = new Set(["fiche", "triptyque", "recto", "focus"]);

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const pose = (name) => {
  const { zIndex, ...rest } = FAN[name];
  return rest;
};
const spreadPose = (name) => {
  const { x, y, rotation } = FAN[name];
  return { x: x * 1.3, y: y * 1.25, rotation: rotation * 2 };
};

// Open timelines. Closing plays them in reverse, so each close mirrors its open.
const OPEN = {
  fiche({ cards, images, text, sheet }) {
    return gsap.timeline({ defaults: { duration: .9, ease: "power4.inOut" } })
      .to(text, { autoAlpha: 0, duration: .18, ease: "power1.out" }, 0)
      .to(sheet, { opacity: 1, scale: 1, duration: .8, ease: "expo.out" }, .12)
      .to(cards.portrait, { x: -155, y: -128, width: 226, height: 274, rotation: 0, borderRadius: "var(--trio-card-radius)" }, 0)
      .to(cards.bio, { x: 120, y: -128, width: 296, height: 274, rotation: 0, borderRadius: "var(--trio-card-radius)" }, .05)
      .to(cards.artwork, { x: 0, y: 143, width: 536, height: 244, rotation: 0, borderRadius: "var(--trio-card-radius)" }, .1)
      .to([images.portrait, images.artwork], { scale: 1, duration: 1.1, ease: "expo.out" }, .1)
      .to(text, { autoAlpha: 1, duration: .4, ease: "power1.out" }, .72);
  },

  triptyque({ cards, images, text }) {
    const row = [cards.portrait, cards.bio, cards.artwork];
    return gsap.timeline()
      .to(text, { autoAlpha: 0, duration: .15, ease: "power1.out" }, 0)
      .to(row, { y: "-=18", scale: 1.03, duration: .28, ease: "power2.out", stagger: .03 }, 0)
      .to(row, {
        x: (index) => (index - 1) * 248, y: 0, scale: 1, rotation: 0,
        width: 232, height: 320,
        duration: .95, ease: "power4.inOut", stagger: .06,
      }, .2)
      .to(row, { borderRadius: "var(--trio-card-radius)", duration: .95, ease: "power4.inOut" }, .2)
      .to([images.portrait, images.artwork], { scale: 1.02, duration: 1, ease: "power3.inOut" }, .3)
      .to(text, { autoAlpha: 1, duration: .4, ease: "power1.out" }, .95);
  },

  recto({ cards, images }) {
    const centre = { x: -60, y: 10, rotation: 0, width: 280, height: 330 };
    return gsap.timeline({ defaults: { ease: "power3.inOut" } })
      .set([cards.portrait, cards.bio], { transformPerspective: 1000 }, 0)
      .to(cards.bio, { autoAlpha: 0, duration: .2, ease: "power1.out" }, 0)
      .to(cards.artwork, { x: 150, y: -24, rotation: 7, scale: .94, duration: .8 }, 0)
      .to([cards.portrait, cards.bio], { ...centre, duration: .6 }, 0)
      .to(images.portrait, { scale: 1.15, duration: .6 }, 0)
      .to(cards.portrait, { rotationY: -90, duration: .32, ease: "power2.in" }, .5)
      .set(cards.portrait, { autoAlpha: 0 }, .82)
      .set(cards.bio, { rotationY: 90, zIndex: 4, autoAlpha: 1 }, .82)
      .to(cards.bio, { rotationY: 0, duration: .55, ease: "back.out(1.4)" }, .82);
  },

  focus({ cards, images, body, text }) {
    return gsap.timeline({ defaults: { duration: .95, ease: "power4.inOut" } })
      .to(text, { autoAlpha: 0, duration: .16, ease: "power1.out" }, 0)
      .to(cards.artwork, { x: 0, y: -100, width: 640, height: 400, rotation: 0, borderRadius: "var(--trio-card-radius)" }, 0)
      .to(images.artwork, { scale: 1, duration: 1.2, ease: "expo.out" }, 0)
      .to(cards.portrait, { x: -228, y: 212.5, width: 180, height: 205, rotation: 0, borderRadius: "var(--trio-card-radius)" }, .08)
      .to(images.portrait, { scale: 1, duration: 1.05, ease: "expo.out" }, .08)
      .to(cards.bio, { x: 95, y: 212.5, width: 455, height: 205, rotation: 0, borderRadius: "var(--trio-card-radius)", padding: "16px 20px" }, .13)
      .to(text, { autoAlpha: 1, duration: .36, ease: "power1.out" }, .72)
      .to(body, { autoAlpha: 1 }, .72);
  },
};

const HIT_LABELS = {
  paquet: () => "Passer à la carte suivante",
  parallaxe: () => "Survoler pour faire bouger les cartes en profondeur",
  default: (open) => (open ? "Refermer les trois cartes" : "Déplier les trois cartes"),
};

export function initCardTrioMotion(root) {
  if (!window.gsap) return;

  const style = document.createElement("link");
  style.rel = "stylesheet";
  style.href = "/src/styles/card-trio-motion.css";
  document.head.append(style);

  const setupAll = () => root.querySelectorAll("[data-trio]:not([data-trio-ready])").forEach(setupTrio);
  setupAll();
  new MutationObserver(setupAll).observe(root, { childList: true, subtree: true });
}

function setupTrio(lab) {
  lab.dataset.trioReady = "true";
  const find = (selector) => lab.querySelector(selector);
  const ctx = {
    lab,
    stage: find(".artist-bio-lab__stage"),
    viewport: find(".trio-lab__viewport"),
    scene: find(".trio-lab__scene"),
    sheet: find(".trio-lab__sheet"),
    hit: find("[data-trio-hit]"),
    note: find("[data-trio-note]"),
    text: find(".trio-card__text"),
    body: find(".trio-card__body"),
    cards: {
      portrait: find('[data-trio-card="portrait"]'),
      bio: find('[data-trio-card="bio"]'),
      artwork: find('[data-trio-card="artwork"]'),
    },
    images: {
      portrait: find('[data-trio-card="portrait"] img'),
      artwork: find('[data-trio-card="artwork"] img'),
    },
    variant: lab.dataset.variant,
    order: [],
    tl: null,
    intro: null,
    quick: null,
    drag: null,
    dragged: false,
    busy: false,
    hover: false,
  };

  // The scene is drawn at a fixed size and scaled down to whatever room the canvas gives it.
  new ResizeObserver(() => {
    const fit = Math.min(1, ctx.stage.clientWidth / SCENE_WIDTH, (ctx.stage.clientHeight - HEADER_SPACE) / SCENE_HEIGHT);
    ctx.viewport.style.setProperty("--trio-fit", Math.max(fit, .4).toFixed(3));
  }).observe(ctx.stage);

  lab.querySelectorAll("[data-trio-variant]").forEach((button) => {
    button.addEventListener("click", () => setVariant(ctx, button));
  });

  const { hit } = ctx;
  hit.addEventListener("click", () => {
    if (ctx.dragged) {
      ctx.dragged = false;
      return;
    }
    toggle(ctx);
  });
  hit.addEventListener("pointerenter", () => {
    ctx.hover = true;
    if (ctx.variant === "parallaxe") enterDepth(ctx);
    else settleFan(ctx);
  });
  hit.addEventListener("pointerleave", () => {
    ctx.hover = false;
    if (ctx.variant === "parallaxe") leaveDepth(ctx);
    else settleFan(ctx);
  });
  hit.addEventListener("pointermove", (event) => {
    if (ctx.variant === "parallaxe") moveDepth(ctx, event);
    else if (ctx.variant === "paquet" && ctx.drag) dragDeck(ctx, event);
  });
  hit.addEventListener("pointerdown", (event) => {
    if (ctx.variant === "paquet") startDrag(ctx, event);
  });
  hit.addEventListener("pointerup", (event) => endDrag(ctx, event));
  hit.addEventListener("pointercancel", (event) => endDrag(ctx, event));

  reset(ctx);
  playIntro(ctx);
}

function setVariant(ctx, button) {
  const variant = button.dataset.trioVariant;
  if (variant === ctx.variant) return;
  ctx.variant = variant;
  ctx.lab.dataset.variant = variant;
  ctx.lab.querySelectorAll("[data-trio-variant]").forEach((other) => {
    other.setAttribute("aria-pressed", String(other === button));
  });
  if (ctx.note) ctx.note.innerHTML = `<strong>${button.textContent}</strong><span>${button.dataset.note}</span>`;
  reset(ctx);
  playIntro(ctx);
}

function reset(ctx) {
  ctx.tl?.kill();
  ctx.intro?.kill();
  Object.assign(ctx, { tl: null, intro: null, drag: null, dragged: false, busy: false });
  ctx.order = ["portrait", "bio", "artwork"];

  const targets = [ctx.scene, ctx.sheet, ctx.text, ctx.body, ...Object.values(ctx.cards), ...Object.values(ctx.images)];
  gsap.killTweensOf(targets);
  gsap.set(targets, { clearProps: "all" });
  gsap.set(ctx.sheet, { opacity: 0, scale: .8 });
  Object.entries(FAN).forEach(([name, fanPose]) => {
    gsap.set(ctx.cards[name], { xPercent: -50, yPercent: -50, ...fanPose, z: ctx.variant === "parallaxe" ? fanPose.zIndex : 0 });
  });

  ctx.quick = ctx.variant === "parallaxe" ? createDepth(ctx) : null;
  updateHit(ctx, false);
}

function playIntro(ctx) {
  if (reducedMotion()) return;
  const { portrait, bio, artwork } = ctx.cards;
  ctx.intro = gsap.from([artwork, bio, portrait], {
    y: "+=40", autoAlpha: 0, duration: .7, ease: "expo.out", stagger: .07,
  });
}

function updateHit(ctx, open) {
  const label = HIT_LABELS[ctx.variant] || HIT_LABELS.default;
  ctx.hit.setAttribute("aria-label", label(open));
  if (HOVER_VARIANTS.has(ctx.variant)) ctx.hit.setAttribute("aria-expanded", String(open));
  else ctx.hit.removeAttribute("aria-expanded");
}

function toggle(ctx) {
  ctx.intro?.progress(1);
  if (ctx.variant === "paquet") return cycleDeck(ctx, 1);
  if (!OPEN[ctx.variant]) return;

  const speed = reducedMotion() ? 12 : 1;
  if (!ctx.tl) {
    // Stop the hover spread so the open starts from wherever the cards are.
    gsap.killTweensOf(Object.values(ctx.cards), "x,y,rotation");
    ctx.tl = OPEN[ctx.variant](ctx).timeScale(speed);
    ctx.tl.eventCallback("onReverseComplete", () => {
      ctx.tl.kill();
      ctx.tl = null;
      settleFan(ctx);
    });
    updateHit(ctx, true);
    return;
  }

  const closing = !ctx.tl.reversed();
  // reverse()/play() rather than reversed(): a finished timeline has to be resumed too.
  ctx.tl.timeScale(speed * (closing ? 1.25 : 1));
  if (closing) ctx.tl.reverse();
  else ctx.tl.play();
  updateHit(ctx, !closing);
}

// Hovering a closed fan opens it slightly, as a hint that it reacts.
function settleFan(ctx) {
  if (!HOVER_VARIANTS.has(ctx.variant) || ctx.tl) return;
  Object.keys(FAN).forEach((name) => {
    gsap.to(ctx.cards[name], {
      ...(ctx.hover ? spreadPose(name) : pose(name)),
      duration: .7, ease: "expo.out", overwrite: "auto",
    });
  });
}

/* Paquet — the front card leaves, the others step forward, it slides in at the back. */

function cycleDeck(ctx, direction) {
  if (ctx.busy) return;
  ctx.busy = true;
  const [front, ...rest] = ctx.order;
  ctx.order = [...rest, front];
  const frontCard = ctx.cards[front];
  const restCards = rest.map((name) => ctx.cards[name]);
  const back = DECK_SLOTS[2];

  gsap.timeline({ onComplete: () => { ctx.busy = false; } })
    .timeScale(reducedMotion() ? 12 : 1)
    .set(frontCard, { zIndex: 4 }, 0)
    .to(frontCard, { x: DECK_SLOTS[0].x + 300 * direction, y: DECK_SLOTS[0].y - 30, rotation: 16 * direction, duration: .4, ease: "power2.out" }, 0)
    .set(restCards, { zIndex: (index) => 3 - index }, .12)
    .to(restCards, {
      x: (index) => DECK_SLOTS[index].x, y: (index) => DECK_SLOTS[index].y, rotation: (index) => DECK_SLOTS[index].rotation,
      duration: .7, ease: "power3.inOut", stagger: .05,
    }, .12)
    .set(frontCard, { zIndex: 0 }, .4)
    .to(frontCard, { x: back.x, y: back.y, rotation: back.rotation, duration: .7, ease: "power3.inOut" }, .4)
    .set(frontCard, { zIndex: 1 });
}

function startDrag(ctx, event) {
  ctx.dragged = false;
  if (ctx.busy) return;
  ctx.intro?.progress(1);
  const card = ctx.cards[ctx.order[0]];
  gsap.killTweensOf(card);
  ctx.drag = {
    card,
    startX: event.clientX,
    startY: event.clientY,
    // Pointer pixels → scene pixels, whatever the canvas and fit scales are.
    scale: ctx.viewport.getBoundingClientRect().width / SCENE_WIDTH,
    moved: false,
  };
  ctx.hit.setPointerCapture(event.pointerId);
}

function dragDeck(ctx, event) {
  const { drag } = ctx;
  const dx = (event.clientX - drag.startX) / drag.scale;
  const dy = (event.clientY - drag.startY) / drag.scale;
  if (Math.abs(dx) + Math.abs(dy) > 6) drag.moved = true;
  const slot = DECK_SLOTS[0];
  gsap.set(drag.card, { x: slot.x + dx, y: slot.y + dy * .35, rotation: slot.rotation + dx * .06 });
}

function endDrag(ctx, event) {
  const { drag } = ctx;
  if (!drag) return;
  ctx.drag = null;
  if (!drag.moved) return; // A plain press is handled by the click listener.
  ctx.dragged = true;
  const dx = (event.clientX - drag.startX) / drag.scale;
  if (Math.abs(dx) > 110) {
    cycleDeck(ctx, Math.sign(dx));
    return;
  }
  const { x, y, rotation } = DECK_SLOTS[0];
  gsap.to(drag.card, { x, y, rotation, duration: .8, ease: "elastic.out(1, .55)" });
}

/* Profondeur — the scene tilts toward the pointer and each card drifts by its depth. */

function createDepth(ctx) {
  const quick = (target, property) => gsap.quickTo(target, property, { duration: .9, ease: "power3.out" });
  return {
    rotateX: quick(ctx.scene, "rotationX"),
    rotateY: quick(ctx.scene, "rotationY"),
    cards: Object.fromEntries(Object.keys(FAN).map((name) => [name, { x: quick(ctx.cards[name], "x"), y: quick(ctx.cards[name], "y") }])),
    images: { portrait: quick(ctx.images.portrait, "x"), artwork: quick(ctx.images.artwork, "x") },
  };
}

function enterDepth(ctx) {
  ctx.intro?.progress(1);
  const { portrait, bio, artwork } = ctx.cards;
  gsap.to(portrait, { z: 90, rotation: -6, duration: .9, ease: "expo.out" });
  gsap.to(bio, { z: 45, duration: .9, ease: "expo.out" });
  gsap.to(artwork, { z: 0, rotation: 4, duration: .9, ease: "expo.out" });
}

function moveDepth(ctx, event) {
  if (!ctx.quick || reducedMotion()) return;
  const rect = ctx.viewport.getBoundingClientRect();
  const nx = gsap.utils.clamp(-1, 1, ((event.clientX - rect.left) / rect.width) * 2 - 1);
  const ny = gsap.utils.clamp(-1, 1, ((event.clientY - rect.top) / rect.height) * 2 - 1);
  ctx.quick.rotateY(nx * 14);
  ctx.quick.rotateX(-ny * 10);
  Object.entries(FAN).forEach(([name, fanPose]) => {
    ctx.quick.cards[name].x(fanPose.x * 1.35 + nx * 40 * DEPTH[name]);
    ctx.quick.cards[name].y(fanPose.y * 1.3 + ny * 28 * DEPTH[name]);
  });
  ctx.quick.images.portrait(-nx * 16);
  ctx.quick.images.artwork(-nx * 10);
}

function leaveDepth(ctx) {
  if (!ctx.quick) return;
  ctx.quick.rotateX(0);
  ctx.quick.rotateY(0);
  Object.entries(FAN).forEach(([name, fanPose]) => {
    ctx.quick.cards[name].x(fanPose.x);
    ctx.quick.cards[name].y(fanPose.y);
    gsap.to(ctx.cards[name], { z: fanPose.zIndex, rotation: fanPose.rotation, duration: .9, ease: "expo.out" });
  });
  ctx.quick.images.portrait(0);
  ctx.quick.images.artwork(0);
}
