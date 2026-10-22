// Group show interaction study — the show's photos and texts as one set of cards,
// handled five ways. As in the card trio study, every pose is written by GSAP.

const SCENE_WIDTH = 1100;
const SCENE_HEIGHT = 700;
const HEADER_SPACE = 90;
const STACK_GROUPS = ["main-space", "text", "front-space"];
const STACK_NAMES = { "main-space": "Main Space", text: "Textes", "front-space": "Front Space" };

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const speed = (duration) => (reducedMotion() ? 0 : duration);

// Stable pseudo-random numbers, so a pile or a scatter looks the same on every visit.
const noise = (index, seed) => {
  const value = Math.sin((index + 1) * 12.9898 + seed * 78.233) * 43758.5453;
  return value - Math.floor(value);
};

/* Poses — { x, y, rotation, scale, zIndex } relative to the centre of the scene. */

function pilePose(position, count, scale) {
  return {
    x: (noise(position, 1) - .5) * 18,
    y: (noise(position, 2) - .5) * 14,
    rotation: (noise(position, 3) - .5) * 8,
    scale,
    zIndex: count - position,
  };
}

function fanPose(index, count) {
  const angle = -34 + (68 * index) / (count - 1);
  const radians = (angle * Math.PI) / 180;
  const radius = 760;
  return { x: Math.sin(radians) * radius, y: (1 - Math.cos(radians)) * radius - 30, rotation: angle, scale: .95, zIndex: count - index };
}

function sheetPose(index, count) {
  const cols = 7;
  const rows = Math.ceil(count / cols);
  return {
    x: ((index % cols) - (cols - 1) / 2) * 152,
    y: (Math.floor(index / cols) - (rows - 1) / 2) * 214,
    rotation: 0,
    scale: .6,
    zIndex: index + 1,
  };
}

function scatterPose(index, seed) {
  return {
    x: (noise(index, seed * 3 + 1) - .5) * 860,
    y: (noise(index, seed * 3 + 2) - .5) * 420,
    rotation: (noise(index, seed * 3 + 3) - .5) * 26,
    scale: .85,
    zIndex: index + 1,
  };
}

function stackPose(position, count, x, scale, y = 10) {
  return {
    x: x + (noise(position, 7) - .5) * 16,
    y: y + (noise(position, 8) - .5) * 12,
    rotation: (noise(position, 9) - .5) * 8,
    scale,
    zIndex: count - position + 1,
  };
}

// Sends every card to the pose `poseFor` gives it; z-order switches at once, the rest tweens.
function arrange(ctx, poseFor, { duration = .8, ease = "power3.inOut", delayFor = () => 0 } = {}) {
  ctx.cards.forEach((card, index) => {
    const { zIndex, ...pose } = poseFor(index, card);
    if (zIndex !== undefined) gsap.set(card, { zIndex });
    gsap.to(card, { autoAlpha: 1, ...pose, duration: speed(duration), delay: speed(delayFor(index)), ease, overwrite: "auto" });
  });
  updateStatus(ctx);
}

/* Paquet — the top card leaves, the pile steps up, it slides back in underneath. */

const DECK_SCALE = 1.5;
const deckScale = (ctx) => isRecordStory(ctx) ? 2.25 : DECK_SCALE;

function cycleDeck(ctx, direction) {
  if (ctx.busy || ctx.state.focused) return;
  ctx.busy = true;
  const { cards, state } = ctx;
  const count = cards.length;
  const [front, ...rest] = state.order;
  state.order = [...rest, front];
  state.turns += 1;

  const frontCard = cards[front];
  const top = pilePose(0, count, deckScale(ctx));
  const { zIndex: backZ, ...back } = pilePose(count - 1, count, deckScale(ctx));
  const timeline = gsap.timeline({ onComplete: () => { ctx.busy = false; } })
    .set(frontCard, { zIndex: count + 1 }, 0)
    .to(frontCard, { x: top.x + 360 * direction, y: top.y - 26, rotation: 16 * direction, duration: speed(.4), ease: "power2.out" }, 0);
  rest.forEach((cardIndex, position) => {
    const { zIndex, ...pose } = pilePose(position, count, deckScale(ctx));
    timeline
      .set(cards[cardIndex], { zIndex }, .1)
      .to(cards[cardIndex], { ...pose, duration: speed(.5), ease: "power3.inOut" }, .1 + Math.min(position, 6) * .02);
  });
  timeline
    .set(frontCard, { zIndex: 0 }, .4)
    .to(frontCard, { ...back, duration: speed(.6), ease: "power3.inOut" }, .4)
    .set(frontCard, { zIndex: backZ });
  updateStatus(ctx);
}

function focusDeckImage(ctx, card) {
  if (!card || card.dataset.group === "text" || ctx.busy || ctx.state.focused) return;
  ctx.state.focused = card;
  card.classList.add("is-expanded");
  ctx.cards.forEach((other) => {
    if (other !== card) gsap.to(other, { autoAlpha: .16, duration: speed(.28), overwrite: "auto" });
  });
  gsap.set(card, { zIndex: ctx.cards.length + 10 });
  gsap.to(card, { x: 0, y: 0, rotation: 0, scale: 2.8, duration: speed(.5), ease: "power3.inOut", overwrite: "auto" });
}

function closeDeckFocus(ctx) {
  const focused = ctx.state.focused;
  if (!focused) return;
  ctx.state.focused = null;
  focused.classList.remove("is-expanded");
  ctx.cards.forEach((card) => {
    if (card !== focused) gsap.to(card, { autoAlpha: 1, duration: speed(.35), overwrite: "auto" });
  });
  ctx.state.order.forEach((cardIndex, position) => {
    const card = ctx.cards[cardIndex];
    const { zIndex, ...pose } = pilePose(position, ctx.cards.length, deckScale(ctx));
    gsap.to(card, { ...pose, duration: speed(.5), ease: "power3.inOut", overwrite: "auto", onComplete: () => gsap.set(card, { zIndex }) });
  });
}

function tapDeck(ctx, card) {
  if (ctx.state.focused) return closeDeckFocus(ctx);
  if (!card) return;
  const pending = ctx.state.pendingTap;
  if (pending?.card === card && performance.now() - pending.time < 320) {
    clearTimeout(pending.timer);
    ctx.state.pendingTap = null;
    focusDeckImage(ctx, card);
    return;
  }
  if (pending) {
    clearTimeout(pending.timer);
    cycleDeck(ctx, 1);
  }
  const timer = setTimeout(() => {
    ctx.state.pendingTap = null;
    cycleDeck(ctx, 1);
  }, 320);
  ctx.state.pendingTap = { card, time: performance.now(), timer };
}

/* Planche — fan, contact sheet, one card isolated. */

function showFan(ctx) {
  ctx.state = { mode: "fan" };
  const count = ctx.cards.length;
  arrange(ctx, (index) => fanPose(index, count), { delayFor: (index) => (count - 1 - index) * .015 });
}

function showSheet(ctx) {
  ctx.state = { mode: "sheet" };
  const count = ctx.cards.length;
  const centre = (count - 1) / 2;
  arrange(ctx, (index) => sheetPose(index, count), { delayFor: (index) => Math.abs(index - centre) * .02 });
}

function focusCard(ctx, focused) {
  ctx.state = { mode: "focus", focused };
  const count = ctx.cards.length;
  arrange(ctx, (index, card) => (card === focused
    ? { x: 0, y: 0, rotation: 0, scale: card.dataset.group === "text" ? 1.7 : 2.3, zIndex: 100 }
    : { ...sheetPose(index, count), scale: .55, autoAlpha: .15 }), { duration: .7 });
}

/* Table — free scatter, cards picked up and thrown. */

function scatter(ctx) {
  ctx.state.seed += 1;
  ctx.state.top = ctx.cards.length;
  arrange(ctx, (index) => scatterPose(index, ctx.state.seed), { duration: 1, ease: "expo.inOut", delayFor: (index) => index * .015 });
}

/* Deux espaces — three independent decks, one for each space and one for texts. */

const stackX = { "main-space": -250, text: 0, "front-space": 250 };
const stackScale = { "main-space": .9, text: .8, "front-space": .9 };
const isRecordStory = (ctx) => document.body.dataset.capture === "on" && ctx.canvas?.dataset.captureFormat === "story";
const recordDeckScale = (ctx) => document.body.dataset.capture === "on" ? (isRecordStory(ctx) ? 2.6 : 1.5) : 1;
const recordDeckSpacing = (ctx) => document.body.dataset.capture === "on" ? (isRecordStory(ctx) ? 1.4 : 1.43) : 1;

function groupPose(ctx, card, position = ctx.state.orders[card.dataset.group].indexOf(card)) {
  const group = card.dataset.group;
  return stackPose(position, ctx.state.orders[group].length, stackX[group] * recordDeckSpacing(ctx), stackScale[group] * recordDeckScale(ctx));
}

function showThreeStacks(ctx, duration = .65) {
  ctx.cards.forEach((card) => {
    const { zIndex, ...pose } = groupPose(ctx, card);
    gsap.set(card, { zIndex });
    gsap.to(card, { ...pose, autoAlpha: 1, duration: speed(duration), ease: "power3.inOut", overwrite: "auto" });
  });
  STACK_GROUPS.forEach((group) => {
    const label = ctx.labels[group];
    if (label) gsap.to(label, { x: stackX[group], y: 220, autoAlpha: 1, duration: speed(duration), overwrite: "auto" });
  });
  updateStatus(ctx);
}

function cycleStack(ctx, card) {
  if (!card || ctx.state.focused) return;
  const group = card.dataset.group;
  if (ctx.state.busyGroups.has(group)) return;
  const state = ctx.state;
  state.busyGroups.add(group);
  const order = state.orders[group];
  order.splice(order.indexOf(card), 1);
  order.push(card);
  const { zIndex: backZ, ...back } = groupPose(ctx, card);
  const direction = group === "main-space" ? -1 : 1;
  const timeline = gsap.timeline({ onComplete: () => state.busyGroups.delete(group) });
  timeline
    .set(card, { zIndex: 100 })
    .to(card, { x: stackX[group] + direction * 170, y: -35, rotation: direction * 16, duration: speed(.28), ease: "power2.out" }, 0);
  order.slice(0, -1).forEach((other, position) => {
    const { zIndex, ...pose } = groupPose(ctx, other, position);
    timeline.set(other, { zIndex }, .12).to(other, { ...pose, duration: speed(.42), ease: "power3.inOut" }, .12);
  });
  timeline.set(card, { zIndex: 0 }, .28)
    .to(card, { ...back, duration: speed(.45), ease: "power3.inOut" }, .28)
    .set(card, { zIndex: backZ });
  updateStatus(ctx);
}

function focusStackCard(ctx, card) {
  if (!card || ctx.state.busyGroups.size) return;
  ctx.state.focused = card;
  card.classList.add("is-expanded");
  ctx.cards.forEach((other) => {
    if (other === card) return;
    gsap.to(other, { autoAlpha: .18, duration: speed(.3), overwrite: "auto" });
  });
  Object.values(ctx.labels).forEach((label) => gsap.to(label, { autoAlpha: 0, duration: speed(.3), overwrite: "auto" }));
  gsap.set(card, { zIndex: 100 });
  gsap.to(card, { x: 0, y: 0, rotation: 0, scale: card.dataset.group === "text" ? 1.7 : 2.3, duration: speed(.55), ease: "power3.inOut", overwrite: "auto" });
  updateStatus(ctx);
}

function closeStackFocus(ctx) {
  const focused = ctx.state.focused;
  if (!focused) return;
  ctx.state.focused = null;
  focused.classList.remove("is-expanded");
  const { zIndex, ...pose } = groupPose(ctx, focused);
  ctx.cards.forEach((card) => {
    if (card !== focused) gsap.to(card, { autoAlpha: 1, duration: speed(.45), overwrite: "auto" });
  });
  STACK_GROUPS.forEach((group) => {
    const label = ctx.labels[group];
    if (label) gsap.to(label, { autoAlpha: 1, duration: speed(.45), overwrite: "auto" });
  });
  gsap.to(focused, { ...pose, duration: speed(.55), ease: "power3.inOut", overwrite: "auto", onComplete: () => gsap.set(focused, { zIndex }) });
  updateStatus(ctx);
}

function tapStack(ctx, card) {
  if (ctx.state.focused) {
    closeStackFocus(ctx);
    return;
  }
  if (!card) return;
  if (ctx.state.busyGroups.has(card.dataset.group)) return;
  const pending = ctx.state.pendingTap;
  if (pending?.card === card && performance.now() - pending.time < 320) {
    clearTimeout(pending.timer);
    ctx.state.pendingTap = null;
    focusStackCard(ctx, card);
    return;
  }
  if (pending) {
    clearTimeout(pending.timer);
    cycleStack(ctx, pending.card);
  }
  const timer = setTimeout(() => {
    ctx.state.pendingTap = null;
    cycleStack(ctx, card);
  }, 320);
  ctx.state.pendingTap = { card, time: performance.now(), timer };
}

/* Recto / verso — face-down cards turned one by one, or all at once. */

function flipCard(ctx, index, faceUp, delay = 0) {
  const card = ctx.cards[index];
  const { zIndex, ...base } = sheetPose(index, ctx.cards.length);
  if (faceUp) ctx.state.faceUp.add(index);
  else ctx.state.faceUp.delete(index);
  gsap.set(card, { zIndex: 50 });
  gsap.timeline({ delay: speed(delay), onComplete: () => gsap.set(card, { zIndex }) })
    .to(card, { y: base.y - 16, scale: .66, duration: speed(.25), ease: "power2.out" }, 0)
    .to(ctx.inners[index], { rotationY: faceUp ? 0 : 180, duration: speed(.7), ease: "power3.inOut" }, 0)
    .to(card, { y: base.y, scale: base.scale, duration: speed(.45), ease: "power2.inOut" }, .3);
  updateStatus(ctx);
}

function flipAll(ctx) {
  const images = ctx.cards.map((card, index) => index).filter((index) => ctx.cards[index].dataset.group !== "text");
  const reveal = ctx.state.faceUp.size < images.length;
  images.forEach((index, order) => flipCard(ctx, index, reveal, order * .04));
}

/* Variants */

const VARIANTS = {
  paquet: {
    enter(ctx) {
      ctx.state = { order: ctx.cards.map((card, index) => index), turns: 0, focused: null, pendingTap: null };
      ctx.cards.forEach((card, index) => gsap.set(card, pilePose(index, ctx.cards.length, deckScale(ctx))));
    },
    status(ctx) {
      const top = ctx.cards[ctx.state.order[0]];
      return `${(ctx.state.turns % ctx.cards.length) + 1} / ${ctx.cards.length} · ${top.dataset.label}`;
    },
    canDrag: (ctx, card) => !ctx.busy && !ctx.state.focused && card === ctx.cards[ctx.state.order[0]],
    drag(ctx, card, dx, dy) {
      const top = pilePose(0, ctx.cards.length, deckScale(ctx));
      gsap.set(card, { x: top.x + dx, y: top.y + dy * .35, rotation: top.rotation + dx * .05 });
    },
    release(ctx, card, dx) {
      if (Math.abs(dx) > 120) return cycleDeck(ctx, Math.sign(dx));
      const { zIndex, ...top } = pilePose(0, ctx.cards.length, deckScale(ctx));
      gsap.to(card, { ...top, duration: speed(.8), ease: "elastic.out(1, .55)" });
    },
    tap: tapDeck,
    primary: (ctx) => cycleDeck(ctx, 1),
  },

  planche: {
    enter(ctx) {
      ctx.state = { mode: "fan" };
      ctx.cards.forEach((card, index) => gsap.set(card, fanPose(index, ctx.cards.length)));
    },
    status(ctx) {
      const count = ctx.cards.length;
      if (ctx.state.mode === "fan") return `${count} cartes en éventail`;
      if (ctx.state.mode === "sheet") return `Planche · ${count} cartes`;
      return ctx.state.focused.dataset.label;
    },
    tap(ctx, card) {
      if (ctx.state.mode === "sheet") return card ? focusCard(ctx, card) : showFan(ctx);
      showSheet(ctx);
    },
    primary: (ctx) => (ctx.state.mode === "fan" ? showSheet(ctx) : showFan(ctx)),
  },

  table: {
    enter(ctx) {
      ctx.state = { seed: 1, top: ctx.cards.length, lastTap: 0 };
      ctx.cards.forEach((card, index) => gsap.set(card, scatterPose(index, ctx.state.seed)));
    },
    status: () => "Table · aucun ordre imposé",
    canDrag: () => true,
    grab(ctx, card) {
      ctx.state.top += 1;
      gsap.set(card, { zIndex: ctx.state.top });
      gsap.to(card, { scale: .95, duration: speed(.25), ease: "power2.out" });
    },
    drag(ctx, card, dx, dy, press) {
      gsap.set(card, { x: press.originX + dx, y: press.originY + dy });
    },
    release(ctx, card, dx, dy, press) {
      // A quick flick carries the card a little further and tilts it the way it was thrown.
      gsap.to(card, {
        x: gsap.utils.clamp(-500, 500, press.originX + dx + press.vx * 10),
        y: gsap.utils.clamp(-300, 300, press.originY + dy + press.vy * 10),
        rotation: gsap.utils.clamp(-18, 18, gsap.getProperty(card, "rotation") * .6 + press.vx * .5),
        scale: .85,
        duration: speed(.8),
        ease: "power3.out",
      });
    },
    tap(ctx, card) {
      if (card) {
        gsap.to(card, { scale: .85, duration: speed(.5), ease: "back.out(3)" });
        return;
      }
      const now = performance.now();
      if (now - ctx.state.lastTap < 320) scatter(ctx);
      ctx.state.lastTap = now;
    },
    primary: (ctx) => scatter(ctx),
  },

  tri: {
    enter(ctx) {
      ctx.state = {
        orders: Object.fromEntries(STACK_GROUPS.map((group) => [group, ctx.cards.filter((card) => card.dataset.group === group)])),
        busyGroups: new Set(),
        focused: null,
        pendingTap: null,
      };
      showThreeStacks(ctx, 0);
    },
    status(ctx) {
      if (ctx.state.focused) return ctx.state.focused.dataset.label;
      return STACK_GROUPS.map((group) => `${STACK_NAMES[group]} · ${ctx.state.orders[group].length}`).join("  /  ");
    },
    tap: tapStack,
    primary(ctx) {
      if (ctx.state.focused) closeStackFocus(ctx);
      else cycleStack(ctx, ctx.state.orders["main-space"][0]);
    },
  },

  recto: {
    enter(ctx) {
      ctx.state = { faceUp: new Set() };
      ctx.cards.forEach((card, index) => {
        gsap.set(card, sheetPose(index, ctx.cards.length));
        gsap.set(ctx.inners[index], { transformPerspective: 900, rotationY: card.dataset.group === "text" ? 0 : 180 });
      });
    },
    status(ctx) {
      const images = ctx.cards.filter((card) => card.dataset.group !== "text").length;
      return `${ctx.state.faceUp.size} / ${images} vues retournées`;
    },
    tap(ctx, card) {
      if (!card) return;
      if (card.dataset.group === "text") return flipAll(ctx);
      const index = ctx.cards.indexOf(card);
      flipCard(ctx, index, !ctx.state.faceUp.has(index));
    },
    primary: (ctx) => flipAll(ctx),
  },
};

function updateStatus(ctx) {
  ctx.status.textContent = VARIANTS[ctx.variant].status(ctx);
}

/* Setup */

export function initExhibitionMotionStudy(root) {
  if (!window.gsap) return;

  const style = document.createElement("link");
  style.rel = "stylesheet";
  style.href = "/src/styles/exhibition-motion-study.css";
  document.head.append(style);

  const setupAll = () => root.querySelectorAll("[data-gm]:not([data-gm-ready])").forEach(setupStudy);
  setupAll();
  new MutationObserver(setupAll).observe(root, { childList: true, subtree: true });
}

function setupStudy(lab) {
  lab.dataset.gmReady = "true";
  const find = (selector) => lab.querySelector(selector);
  const ctx = {
    lab,
    canvas: lab.closest(".playground-canvas"),
    stage: find(".artist-bio-lab__stage"),
    viewport: find(".gm-lab__viewport"),
    scene: find("[data-gm-scene]"),
    status: find("[data-gm-status]"),
    note: find("[data-gm-note]"),
    cards: [...lab.querySelectorAll("[data-gm-card]")],
    labels: Object.fromEntries([...lab.querySelectorAll("[data-gm-label]")].map((label) => [label.dataset.gmLabel, label])),
    variant: lab.dataset.variant,
    state: {},
    recordFormat: null,
    press: null,
    busy: false,
    intro: null,
  };
  ctx.inners = ctx.cards.map((card) => card.querySelector(".gm-card__inner"));
  STACK_GROUPS.forEach((group) => {
    ctx.cards.filter((card) => card.dataset.group === group).forEach((card, index) => {
      card.dataset.stackIndex = String(index);
    });
  });
  ctx.cards.forEach((card) => {
    card.addEventListener("pointerenter", () => {
      if (ctx.variant !== "tri" || ctx.state.focused) return;
      ctx.cards.filter((other) => other.dataset.group === card.dataset.group).forEach((other) => other.classList.add("is-hover-deck"));
    });
    card.addEventListener("pointerleave", () => {
      ctx.cards.filter((other) => other.dataset.group === card.dataset.group).forEach((other) => other.classList.remove("is-hover-deck"));
    });
  });

  // The scene is drawn at a fixed size and scaled down to whatever room the canvas gives it.
  new ResizeObserver(() => {
    const headerSpace = document.body.dataset.capture === "on" ? 0 : HEADER_SPACE;
    const fit = Math.min(1, ctx.stage.clientWidth / SCENE_WIDTH, (ctx.stage.clientHeight - headerSpace) / SCENE_HEIGHT);
    ctx.viewport.style.setProperty("--gm-fit", Math.max(fit, .3).toFixed(3));
    const format = ctx.canvas?.dataset.captureFormat || null;
    const formatChanged = ctx.recordFormat !== format;
    ctx.recordFormat = format;
    if (formatChanged && document.body.dataset.capture === "on" && ctx.variant === "paquet" && ctx.state.order) {
      ctx.cards.forEach((card, index) => gsap.set(card, pilePose(index, ctx.cards.length, deckScale(ctx))));
    }
    if (ctx.variant === "tri" && ctx.state.orders && !ctx.state.focused) showThreeStacks(ctx, 0);
  }).observe(ctx.stage);

  lab.querySelectorAll("[data-gm-variant]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.gmVariant === ctx.variant) return;
      ctx.variant = button.dataset.gmVariant;
      lab.dataset.variant = ctx.variant;
      lab.querySelectorAll("[data-gm-variant]").forEach((other) => other.setAttribute("aria-pressed", String(other === button)));
      ctx.note.innerHTML = `<strong>${button.textContent}</strong><span>${button.dataset.note}</span>`;
      enterVariant(ctx);
    });
  });

  // Pointer input is handled as press → drag or tap, so a drag never also counts as a click.
  const { scene } = ctx;
  scene.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    ctx.intro?.progress(1);
    const card = event.target.closest("[data-gm-card]");
    const variant = VARIANTS[ctx.variant];
    ctx.press = {
      card,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      lastY: event.clientY,
      vx: 0,
      vy: 0,
      // Pointer pixels → scene pixels, whatever the canvas and fit scales are.
      scale: ctx.viewport.getBoundingClientRect().width / SCENE_WIDTH,
      moved: false,
      dragging: Boolean(card && variant.canDrag?.(ctx, card)),
    };
    if (ctx.press.dragging) {
      ctx.press.originX = gsap.getProperty(card, "x");
      ctx.press.originY = gsap.getProperty(card, "y");
      gsap.killTweensOf(card, "x,y,rotation");
      variant.grab?.(ctx, card);
    }
    if (ctx.variant !== "tri") scene.setPointerCapture(event.pointerId);
  });

  scene.addEventListener("pointermove", (event) => {
    const { press } = ctx;
    if (!press) return;
    const dx = (event.clientX - press.startX) / press.scale;
    const dy = (event.clientY - press.startY) / press.scale;
    press.vx = (event.clientX - press.lastX) / press.scale;
    press.vy = (event.clientY - press.lastY) / press.scale;
    press.lastX = event.clientX;
    press.lastY = event.clientY;
    if (!press.moved && Math.hypot(dx, dy) > 6) press.moved = true;
    if (press.moved && press.dragging) VARIANTS[ctx.variant].drag(ctx, press.card, dx, dy, press);
  });

  const endPress = (event) => {
    const { press } = ctx;
    if (!press) return;
    ctx.press = null;
    const variant = VARIANTS[ctx.variant];
    const dx = (event.clientX - press.startX) / press.scale;
    const dy = (event.clientY - press.startY) / press.scale;
    if (press.dragging && (press.moved || event.type === "pointercancel")) variant.release(ctx, press.card, dx, dy, press);
    else if (!press.moved && event.type === "pointerup" && ctx.variant !== "tri") variant.tap(ctx, press.card);
  };
  scene.addEventListener("pointerup", endPress);
  scene.addEventListener("pointercancel", endPress);
  scene.addEventListener("click", (event) => {
    if (ctx.variant === "tri" && event.detail < 2) tapStack(ctx, event.target.closest("[data-gm-card]"));
  });
  scene.addEventListener("dblclick", (event) => {
    const card = event.target.closest("[data-gm-card]");
    if (!card || card.dataset.group === "text") return;
    event.preventDefault();
    if (ctx.variant === "paquet") {
      if (ctx.state.pendingTap) clearTimeout(ctx.state.pendingTap.timer);
      ctx.state.pendingTap = null;
      focusDeckImage(ctx, card);
      return;
    }
    if (ctx.variant !== "tri") return;
    if (ctx.state.pendingTap) clearTimeout(ctx.state.pendingTap.timer);
    ctx.state.pendingTap = null;
    focusStackCard(ctx, card);
  });

  scene.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      ctx.intro?.progress(1);
      VARIANTS[ctx.variant].primary(ctx);
    }
    if (ctx.variant === "paquet" && (event.key === "ArrowRight" || event.key === "ArrowLeft")) {
      event.preventDefault();
      cycleDeck(ctx, event.key === "ArrowRight" ? 1 : -1);
    }
  });

  enterVariant(ctx);
}

function enterVariant(ctx) {
  const labels = Object.values(ctx.labels);
  const targets = [...ctx.cards, ...ctx.inners, ...labels];
  ctx.cards.forEach((card) => card.classList.remove("is-hover-deck", "is-expanded"));
  if (ctx.state.pendingTap) clearTimeout(ctx.state.pendingTap.timer);
  ctx.intro?.kill();
  gsap.killTweensOf(targets);
  // Cards keep their inline image size variables, so only motion properties are cleared.
  gsap.set(targets, { clearProps: "transform,zIndex,opacity,visibility" });
  gsap.set([...ctx.cards, ...labels], { xPercent: -50, yPercent: -50 });
  gsap.set(labels, { autoAlpha: 0 });
  Object.assign(ctx, { press: null, busy: false, intro: null });

  VARIANTS[ctx.variant].enter(ctx);
  updateStatus(ctx);
  if (!reducedMotion()) {
    ctx.intro = gsap.from(ctx.cards, { y: "+=60", autoAlpha: 0, duration: .8, ease: "expo.out", stagger: { each: .025, from: "end" } });
  }
}
