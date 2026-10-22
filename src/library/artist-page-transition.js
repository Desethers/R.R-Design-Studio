// Measure the actual iframe layout: no guessed offsets or snapshot crossfades.
export async function expandArtistPage(card, update, reducedMotion) {
  const frame = card.querySelector(".pattern-artist-bio__full-page iframe");
  const page = frame.parentElement;
  const surface = card.querySelector(".pattern-artist-bio__surface");
  const pairs = [
    [".pattern-artist-bio__image", ".artist-portrait"],
    [".pattern-artist-bio__heading h2", ".artist-info h1"],
    [".pattern-artist-bio__date", ".artist-meta"],
    [".pattern-artist-bio__intro", ".artist-bio > p:first-child"],
  ];
  const overlay = document.createElement("div");
  overlay.className = "artist-page-morph";
  overlay.setAttribute("aria-hidden", "true");
  const animations = [];
  const hidden = [];
  let updated = false;
  const apply = () => { if (!updated) { updated = true; update(); } };
  const geometry = (rect, offset = { left: 0, top: 0 }) => ({
    left: `${rect.left + offset.left}px`, top: `${rect.top + offset.top}px`,
    width: `${rect.width}px`, height: `${rect.height}px`,
  });
  const typography = (style) => ({
    fontSize: style.fontSize, lineHeight: style.lineHeight,
    letterSpacing: style.letterSpacing, color: style.color,
  });
  const finish = () => animations.forEach((animation) => animation.finish());

  try {
    // The eagerly loaded iframe normally finishes while the compact card is visible.
    await Promise.race([
      (async () => {
        if (frame.contentDocument?.readyState !== "complete") {
          await new Promise((resolve) => {
            const done = () => { clearTimeout(timer); frame.removeEventListener("load", done); resolve(); };
            const timer = setTimeout(done, 2500);
            frame.addEventListener("load", done, { once: true });
          });
        }
        await frame.contentDocument?.fonts.ready;
        await frame.contentDocument?.querySelector(".artist-portrait")?.decode().catch(() => {});
      })(),
      new Promise((resolve) => setTimeout(resolve, 3000)),
    ]);
    const doc = frame.contentDocument;
    if (reducedMotion || !doc || !pairs.every(([, selector]) => doc.querySelector(selector))) {
      apply();
      return;
    }

    const fromCard = geometry(card.getBoundingClientRect());
    const layers = pairs.map(([selector, targetSelector], index) => {
      const source = card.querySelector(selector);
      const style = getComputedStyle(source);
      return {
        source, target: doc.querySelector(targetSelector), index,
        from: { ...geometry(source.getBoundingClientRect()), ...typography(style),
          borderRadius: index === 0 ? getComputedStyle(source.parentElement).borderRadius : "0px" },
      };
    });
    card.classList.add("is-morphing-page");
    page.style.opacity = "0";
    surface.style.visibility = "hidden";
    apply();
    frame.contentWindow.scrollTo(0, 0);
    const offset = frame.getBoundingClientRect();
    const toCard = geometry(card.getBoundingClientRect());
    const background = document.createElement("div");
    Object.assign(background.style, { position: "fixed", background: "#fff", borderRadius: "18px", ...toCard });
    overlay.append(background);

    const timing = { duration: 1150, easing: "cubic-bezier(.4, 0, .2, 1)", fill: "both" };
    for (const layer of layers) {
      const targetStyle = frame.contentWindow.getComputedStyle(layer.target);
      const clone = layer.target.cloneNode(true);
      clone.removeAttribute("id");
      // Copy iframe typography into the parent document before animating it.
      for (const property of targetStyle) clone.style.setProperty(property, targetStyle.getPropertyValue(property));
      if (layer.index === 0) clone.src = layer.target.src;
      const to = { ...geometry(layer.target.getBoundingClientRect(), offset),
        ...typography(targetStyle), borderRadius: targetStyle.borderRadius };
      Object.assign(clone.style, {
        position: "fixed", margin: "0", padding: "0", minWidth: "0", minHeight: "0",
        maxWidth: "none", maxHeight: "none", boxSizing: "border-box",
        transform: "none", transition: "none", animation: "none", visibility: "visible",
        opacity: "1", viewTransitionName: "none", pointerEvents: "none", ...to,
      });
      overlay.append(clone);
      layer.clone = clone;
      layer.to = to;
      hidden.push([layer.target, layer.target.style.visibility]);
      layer.target.style.visibility = "hidden";
    }
    document.body.append(overlay);
    animations.push(background.animate([fromCard, toCard], timing));
    for (const layer of layers) animations.push(layer.clone.animate([layer.from, layer.to], timing));
    // Reveal only the additional page content while the shared elements arrive.
    animations.push(background.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 230, delay: 920, fill: "both" }));
    animations.push(page.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 230, delay: 920, fill: "both" }));
    window.addEventListener("resize", finish, { once: true });
    await Promise.all(animations.map((animation) => animation.finished));
  } catch (error) {
    console.warn("Artist page transition fell back to the final layout.", error);
    apply();
  } finally {
    window.removeEventListener("resize", finish);
    hidden.forEach(([element, visibility]) => { element.style.visibility = visibility; });
    page.style.removeProperty("opacity");
    surface.style.removeProperty("visibility");
    animations.forEach((animation) => animation.cancel());
    overlay.remove();
    card.classList.remove("is-morphing-page");
  }
}
