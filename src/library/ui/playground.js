import { getRegistryEntry } from "../registry.js";
import { viewButtons } from "./view-icons.js";

const captureFormats = [
  { id: "square", label: "1:1", width: 1080, height: 1080 },
  { id: "portrait", label: "4:5", width: 1080, height: 1350 },
  { id: "story", label: "9:16", width: 1080, height: 1920 },
  { id: "landscape", label: "16:9", width: 1920, height: 1080 },
];

function familyName(value) {
  return value.replaceAll("-", " ");
}

function captureBar() {
  return `
    <div class="capture-bar" hidden>
      <div role="group" aria-label="Capture format">
        ${captureFormats.map((format, index) => `<button type="button" data-capture-format="${format.id}" aria-pressed="${index === 0}">${format.label}</button>`).join("")}
      </div>
      <label class="capture-scale">Scale <input type="range" min="60" max="120" value="100" step="5"><output>100%</output></label>
      <label class="capture-background">Fond <input type="text" value="#F1F0ED" maxlength="7" spellcheck="false" data-capture-background-code aria-label="Code couleur du fond"></label>
      <button type="button" data-capture-background-effect="vapor" aria-pressed="false">Vapor</button>
      <button type="button" data-capture-replay>Replay</button>
      <button type="button" data-capture-center>Center</button>
      <button type="button" data-capture-export title="Exporte le format choisi en qualité HD">Export vidéo</button>
      <span data-capture-readout></span>
      <button type="button" data-capture-exit aria-label="Quitter le mode Record"><span aria-hidden="true">×</span></button>
    </div>`;
}

function playgroundControls() {
  return `
    <footer class="playground-controls">
      <div class="playground-control-group workspace-screen__view-group">
        <span>View</span>
        <div role="group" aria-label="Preview format" class="workspace-screen__view-icons">
          ${viewButtons()}
        </div>
      </div>
      <label class="playground-scale">Scale <input type="range" min="60" max="120" value="100" step="5"><output>100%</output></label>
      <div class="playground-control-group playground-background">
        <span>Background</span>
        <div role="group" aria-label="Preview background">
          <button type="button" data-background="light" aria-pressed="true">Light</button>
          <button type="button" data-background="dark" aria-pressed="false">Dark</button>
          <button type="button" data-background="transparent" aria-pressed="false">Transparent</button>
          <button type="button" data-background="vapor" aria-pressed="false">Vapor</button>
        </div>
      </div>
    </footer>`;
}

export function renderPlayground(root) {
  const pathId = window.location.pathname.split("/").filter(Boolean).at(-1);
  const pageParams = new URLSearchParams(window.location.search);
  const entry = getRegistryEntry(pageParams.get("component") || document.body.dataset.objectId || pathId);
  const directRecord = pageParams.get("record") === "1";
  const returnArea = pageParams.get("returnArea") || "artist";

  if (!entry) {
    root.innerHTML = '<main class="library-not-found"><p>Component not found.</p><a href="/library/">← Library</a></main>';
    return;
  }

  document.title = `${familyName(entry.family)} / ${entry.name} — FOR ART / LIBRARY`;
  root.innerHTML = `
    <header class="playground-topbar">
      <a href="/library/">← Library</a>
      <h1>${familyName(entry.family)} / ${entry.name}</h1>
      <div class="playground-topbar__meta">
        <button type="button" data-capture-enter>Record</button>
        <span>${entry.code}</span>
      </div>
    </header>
    <main class="playground-stage">
      <div class="playground-canvas" data-view="desktop" data-background="light" data-layout="${entry.layout}">
        <div class="playground-object">${entry.render()}</div>
      </div>
    </main>
    ${playgroundControls()}
    ${captureBar()}`;

  const canvas = root.querySelector(".playground-canvas");
  const object = root.querySelector(".playground-object");
  const syncEmbeddedCapture = () => {
    if (entry.id !== "exhibition-embracing-01" && entry.id !== "exhibition-embracing-02") return;
    object.querySelectorAll("iframe").forEach((frame) => {
      const embeddedRoot = frame.contentDocument?.documentElement;
      if (!embeddedRoot) return;
      const recording = document.body.dataset.capture === "on";
      embeddedRoot.classList.toggle("is-record", recording);
      if (recording && (entry.id === "exhibition-embracing-01" || entry.id === "exhibition-embracing-02")) {
        embeddedRoot.dataset.recordFormat = canvas.dataset.captureFormat;
        if (entry.id === "exhibition-embracing-02") {
          embeddedRoot.style.setProperty("--record-scale", canvas.style.getPropertyValue("--object-scale") || "1");
        }
      } else {
        delete embeddedRoot.dataset.recordFormat;
        embeddedRoot.style.removeProperty("--record-scale");
      }
    });
  };
  object.addEventListener("load", syncEmbeddedCapture, true);
  let savedPreview = {};
  try {
    savedPreview = JSON.parse(localStorage.getItem(`library-preview-${entry.id}`) || "{}");
  } catch {
    savedPreview = {};
  }
  if (["light", "dark", "transparent", "vapor"].includes(savedPreview.background)) {
    canvas.dataset.background = savedPreview.background;
  }
  root.querySelectorAll("[data-background]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.background === canvas.dataset.background));
  });
  root.querySelector("[data-capture-background-effect]")?.setAttribute("aria-pressed", String(canvas.dataset.background === "vapor"));

  const storedSettings = {
    "artist-grid-01": {
      storageKey: "artist-grid-01-settings",
      target: ".section-artist-grid",
      properties: { radius: "--artist-grid-radius", "title-size": "--artist-grid-title-size" },
    },
    "artist-grid-02": {
      storageKey: "artist-grid-02-settings",
      target: ".section-artist-grid",
      properties: { radius: "--artist-grid-radius", "title-size": "--artist-grid-title-size" },
    },
    "artist-bio-05": {
      storageKey: "artist-bio-05-settings",
      target: ".trio-lab",
      properties: { radius: "--trio-card-radius", "text-size": "--trio-text-size" },
    },
  };

  const applyStoredSettings = () => {
    const definition = storedSettings[entry.id];
    if (!definition) return;
    const target = object.querySelector(definition.target);
    if (!target) return;
    let saved = {};
    try {
      saved = JSON.parse(localStorage.getItem(definition.storageKey) || "{}");
    } catch {
      saved = {};
    }
    Object.entries(definition.properties).forEach(([id, property]) => {
      if (Number.isFinite(saved[id])) target.style.setProperty(property, `${saved[id]}px`);
    });
  };
  applyStoredSettings();

  const placeViewSwitch = (insideCanvas = false) => {
    const outside = canvas.parentElement.querySelector(":scope > .section-artist-grid__view-switch");
    const inside = canvas.querySelector(".section-artist-grid__view-switch");
    if (inside && outside && inside !== outside) outside.remove();
    const viewSwitch = inside || outside;
    if (!viewSwitch) return;
    if (insideCanvas) {
      canvas.querySelector(".section-artist-grid")?.append(viewSwitch);
    } else {
      canvas.insertAdjacentElement("afterend", viewSwitch);
    }
  };
  placeViewSwitch();

  root.querySelectorAll("button[data-view]").forEach((button) => {
    button.addEventListener("click", () => {
      canvas.dataset.view = button.dataset.view;
      root.querySelectorAll("button[data-view]").forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
    });
  });
  root.querySelectorAll("button[data-background]").forEach((button) => {
    button.addEventListener("click", () => {
      canvas.dataset.background = button.dataset.background;
      root.querySelectorAll("button[data-background]").forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
    });
  });
  const scaleInputs = [...root.querySelectorAll('.playground-scale input[type="range"], .capture-scale input[type="range"]')];
  const setScale = (value) => {
    canvas.style.setProperty("--object-scale", String(Number(value) / 100));
    syncEmbeddedCapture();
    scaleInputs.forEach((input) => {
      input.value = value;
      input.closest("label").querySelector("output").value = `${value}%`;
    });
  };
  scaleInputs.forEach((input) => input.addEventListener("input", () => setScale(input.value)));

  const captureBackgroundCode = root.querySelector("[data-capture-background-code]");
  captureBackgroundCode.addEventListener("input", () => {
    const raw = captureBackgroundCode.value.trim();
    const color = raw.startsWith("#") ? raw : `#${raw}`;
    const valid = /^#[0-9a-f]{6}$/i.test(color) || /^#[0-9a-f]{3}$/i.test(color);
    captureBackgroundCode.setAttribute("aria-invalid", String(!valid));
    if (valid) {
      canvas.dataset.background = "light";
      root.querySelector("[data-capture-background-effect]")?.setAttribute("aria-pressed", "false");
      canvas.style.setProperty("--capture-background", color);
    }
  });
  canvas.style.setProperty("--capture-background", captureBackgroundCode.value);

  const bar = root.querySelector(".capture-bar");
  const readout = bar.querySelector("[data-capture-readout]");
  const replayButton = bar.querySelector("[data-capture-replay]");
  const exportButton = bar.querySelector("[data-capture-export]");
  let format = entry.id === "editorial-photo-caption-01" ? captureFormats[1] : captureFormats[0];
  bar.querySelectorAll("[data-capture-format]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.captureFormat === format.id));
  });
  if (entry.id === "editorial-photo-caption-01") {
    const captureScale = bar.querySelector('.capture-scale input[type="range"]');
    captureScale.max = "100";
    setScale(100);
  }
  let countdown = null;
  let exporting = false;
  let exportTimer = null;
  let stopExport = null;
  let exportStyleTemplate = null;

  const applyCaptureSize = () => {
    if (document.body.dataset.capture !== "on") return;
    const dpr = window.devicePixelRatio || 1;
    const cssWidth = format.width / dpr;
    const cssHeight = format.height / dpr;
    const fit = Math.min(1, (window.innerWidth - 80) / cssWidth, (window.innerHeight - 200) / cssHeight);
    const width = Math.round(cssWidth * fit);
    const height = Math.round(cssHeight * fit);
    const canvasPadding = Math.min(60, Math.max(20, width * .05));
    canvas.style.setProperty("--capture-width", `${width}px`);
    canvas.style.setProperty("--capture-height", `${height}px`);
    canvas.style.setProperty("--capture-padding", `${canvasPadding}px`);
    canvas.style.setProperty("--capture-content-height", `${Math.max(0, height - canvasPadding * 2)}px`);
    if (entry.id === "artist-grid-02") {
      const componentFit = Math.min(1, (width - canvasPadding * 2) / 880);
      canvas.style.setProperty("--capture-component-fit", String(componentFit));
    } else {
      canvas.style.removeProperty("--capture-component-fit");
    }
    const captured = `${Math.round(width * dpr)}×${Math.round(height * dpr)}`;
    readout.textContent = fit === 1 ? `${captured} px` : `${captured} px · ${Math.round(fit * 100)}% de ${format.width}×${format.height}`;
  };

  let offsetX = 0;
  let offsetY = 0;

  const applyOffset = () => {
    canvas.style.setProperty("--capture-x", `${offsetX}px`);
    canvas.style.setProperty("--capture-y", `${offsetY}px`);
  };

  const recenter = () => {
    offsetX = 0;
    offsetY = 0;
    applyOffset();
    canvas.scrollLeft = 0;
    canvas.scrollTop = 0;
  };

  const syncEditorialCaptureLayout = () => {
    if (entry.id !== "editorial-photo-caption-01" || document.body.dataset.capture !== "on" || format.id !== "portrait") return;
    const section = object.querySelector(".section-editorial-photo-captions");
    const layoutButton = section?.querySelector("[data-editorial-layout-toggle]");
    if (!section || !layoutButton) return;
    section.dataset.layout = "carousel";
    layoutButton.setAttribute("aria-pressed", "true");
    layoutButton.setAttribute("aria-label", "Restore editorial sequence");
    layoutButton.title = "Restore editorial sequence";
  };

  const setCapture = (on) => {
    document.body.dataset.capture = on ? "on" : "off";
    if (on) canvas.dataset.captureFormat = format.id;
    else delete canvas.dataset.captureFormat;
    syncEditorialCaptureLayout();
    syncEmbeddedCapture();
    bar.hidden = !on;
    placeViewSwitch(on);
    if (on) applyCaptureSize();
    else recenter();
  };

  const exitCapture = () => {
    if (directRecord) {
      window.location.href = `/library/?area=${encodeURIComponent(returnArea)}&component=${encodeURIComponent(entry.id)}`;
      return;
    }
    setCapture(false);
  };

  // Record the framed DOM itself, at the format's native pixel dimensions. This
  // avoids recording a scaled Retina screen through QuickTime. Each source frame
  // is rasterized into a canvas, then encoded by MediaRecorder as WebM.
  const copyComputedStyles = (source, clone) => {
    const styles = window.getComputedStyle(source);
    for (const property of styles) clone.style.setProperty(property, styles.getPropertyValue(property), styles.getPropertyPriority(property));
    [...source.children].forEach((child, index) => copyComputedStyles(child, clone.children[index]));
  };

  // Once the static visual treatment is copied, only update the values that
  // GSAP or interaction states can change. Recomputing every CSS property for
  // every DOM node at every video frame makes the live animation stutter.
  const syncAnimatedStyles = (source, clone) => {
    clone.setAttribute("class", source.getAttribute("class") || "");
    const styles = window.getComputedStyle(source);
    ["transform", "transform-origin", "opacity", "visibility", "z-index", "display", "position", "top", "right", "bottom", "left", "width", "height", "overflow"].forEach((property) => {
      clone.style.setProperty(property, styles.getPropertyValue(property));
    });
    [...source.children].forEach((child, index) => syncAnimatedStyles(child, clone.children[index]));
  };

  const canvasFrame = async (targetCanvas, context) => {
    const rect = canvas.getBoundingClientRect();
    const clone = exportStyleTemplate ? exportStyleTemplate.cloneNode(true) : canvas.cloneNode(true);
    if (exportStyleTemplate) syncAnimatedStyles(canvas, clone);
    else {
      copyComputedStyles(canvas, clone);
      exportStyleTemplate = clone.cloneNode(true);
    }
    clone.style.margin = "0";
    clone.style.outline = "0";
    clone.style.outlineOffset = "0";
    const markup = new XMLSerializer().serializeToString(clone);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${format.width}" height="${format.height}" viewBox="0 0 ${rect.width} ${rect.height}"><foreignObject width="${rect.width}" height="${rect.height}"><div xmlns="http://www.w3.org/1999/xhtml">${markup}</div></foreignObject></svg>`;
    const image = new Image();
    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
    try {
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
        image.src = url;
      });
      context.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
      context.drawImage(image, 0, 0, targetCanvas.width, targetCanvas.height);
    } finally {
      URL.revokeObjectURL(url);
    }
  };

  const exportVideo = async () => {
    if (exporting) return;
    if (!window.MediaRecorder || !navigator.mediaDevices?.getDisplayMedia) {
      exportButton.textContent = "Export indisponible";
      return;
    }
    exporting = true;
    exportStyleTemplate = null;
    bar.classList.add("is-exporting");
    exportButton.disabled = true;
    try {
      exportButton.textContent = "Choisir l’onglet…";
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: "browser", frameRate: { ideal: 30, max: 30 } },
        audio: false,
        selfBrowserSurface: "include",
        surfaceSwitching: "exclude",
      });
      const videoTrack = stream.getVideoTracks()[0];
      if (!videoTrack) throw new Error("No video track returned");
      if (!window.CropTarget || typeof videoTrack.cropTo !== "function") {
        stream.getTracks().forEach((track) => track.stop());
        throw new Error("Element crop is not supported by this browser");
      }
      const cropTarget = await window.CropTarget.fromElement(canvas);
      await videoTrack.cropTo(cropTarget);
      const mimeType = ["video/mp4;codecs=avc1.42E01E", "video/mp4", "video/webm;codecs=vp8", "video/webm;codecs=vp9", "video/webm"].find((type) => MediaRecorder.isTypeSupported(type));
      const extension = mimeType?.startsWith("video/mp4") ? "mp4" : "webm";
      const chunks = [];
      let exportFailed = false;
      const resetExportUi = (label = "Export vidéo") => {
        exporting = false;
        stopExport = null;
        bar.classList.remove("is-exporting");
        window.clearInterval(exportTimer);
        exportTimer = null;
        exportButton.disabled = false;
        exportButton.textContent = label;
      };
      const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 24_000_000 });
      recorder.addEventListener("dataavailable", (event) => {
        if (event.data.size) chunks.push(event.data);
      });
      recorder.addEventListener("error", () => { exportFailed = true; });
      recorder.addEventListener("stop", () => {
        stream.getTracks().forEach((track) => track.stop());
        if (exportFailed || !chunks.length) {
          resetExportUi("Réessayer");
          return;
        }
        const blob = new Blob(chunks, { type: mimeType || "video/webm" });
        const download = document.createElement("a");
        download.href = URL.createObjectURL(blob);
        download.download = `${entry.id}-${format.width}x${format.height}.${extension}`;
        download.style.display = "none";
        document.body.append(download);
        download.click();
        window.setTimeout(() => {
          URL.revokeObjectURL(download.href);
          download.remove();
        }, 1_000);
        resetExportUi();
      }, { once: true });
      recorder.start(250);
      const startedAt = performance.now();
      stopExport = () => {
        if (recorder.state !== "recording") return;
        exportButton.disabled = true;
        exportButton.textContent = "Finalisation…";
        recorder.requestData();
        recorder.stop();
      };
      exportButton.disabled = false;
      exportTimer = window.setInterval(() => {
        const elapsed = Math.floor((performance.now() - startedAt) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = String(elapsed % 60).padStart(2, "0");
        exportButton.textContent = `Stop · REC ${minutes}:${seconds}`;
      }, 100);
      videoTrack.addEventListener("ended", () => {
        if (recorder.state === "recording") recorder.stop();
      }, { once: true });
    } catch (error) {
      console.error("Video export failed", error);
      exporting = false;
      stopExport = null;
      bar.classList.remove("is-exporting");
      exportButton.disabled = false;
      exportButton.textContent = "Export indisponible";
    }
  };

  // Drag the framed content so the right part of it sits inside the recording area.
  canvas.addEventListener("pointerdown", (event) => {
    if (document.body.dataset.capture !== "on") return;
    if (event.button !== 0) return;
    if (event.target.closest("button, a, input, label, select, textarea, [role='button'], [data-gm]")) return;

    const startX = event.clientX - offsetX;
    const startY = event.clientY - offsetY;
    document.body.dataset.captureDragging = "on";
    canvas.setPointerCapture(event.pointerId);

    const onMove = (moveEvent) => {
      offsetX = moveEvent.clientX - startX;
      offsetY = moveEvent.clientY - startY;
      applyOffset();
    };
    const onUp = () => {
      delete document.body.dataset.captureDragging;
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
    };

    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
  });

  const replay = () => {
    if (countdown) return;
    let remaining = 3;
    replayButton.disabled = true;
    replayButton.textContent = String(remaining);
    countdown = window.setInterval(() => {
      remaining -= 1;
      if (remaining > 0) {
        replayButton.textContent = String(remaining);
        return;
      }
      window.clearInterval(countdown);
      countdown = null;
      replayButton.disabled = false;
      replayButton.textContent = "Replay";
      object.innerHTML = entry.render();
      applyStoredSettings();
      placeViewSwitch(document.body.dataset.capture === "on");
      syncEditorialCaptureLayout();
    }, 700);
  };

  root.querySelector("[data-capture-enter]").addEventListener("click", () => setCapture(true));
  bar.addEventListener("click", (event) => {
    const formatButton = event.target.closest("[data-capture-format]");
    if (formatButton) {
      format = captureFormats.find((item) => item.id === formatButton.dataset.captureFormat) || format;
      canvas.dataset.captureFormat = format.id;
      if (entry.id === "editorial-photo-caption-01") {
        bar.querySelector('.capture-scale input[type="range"]').max = format.id === "portrait" ? "100" : "120";
      }
      if (entry.id === "editorial-photo-caption-01" && format.id === "portrait") {
        setScale(Math.min(100, Number(scaleInputs[0].value)));
        syncEditorialCaptureLayout();
      }
      syncEmbeddedCapture();
      bar.querySelectorAll("[data-capture-format]").forEach((item) => item.setAttribute("aria-pressed", String(item === formatButton)));
      recenter();
      applyCaptureSize();
      return;
    }
    const backgroundEffect = event.target.closest("[data-capture-background-effect]");
    if (backgroundEffect) {
      const active = backgroundEffect.getAttribute("aria-pressed") === "true";
      backgroundEffect.setAttribute("aria-pressed", String(!active));
      canvas.dataset.background = active ? "light" : backgroundEffect.dataset.captureBackgroundEffect;
      return;
    }
    if (event.target.closest("[data-capture-replay]")) replay();
    if (event.target.closest("[data-capture-center]")) recenter();
    if (event.target.closest("[data-capture-export]")) {
      if (exporting) stopExport?.();
      else exportVideo();
      return;
    }
    if (event.target.closest("[data-capture-exit]")) exitCapture();
  });

  window.addEventListener("resize", applyCaptureSize);
  document.addEventListener("keydown", (event) => {
    if (event.target.closest("input, textarea, select, button, a, [role='button']")) return;
    const on = document.body.dataset.capture === "on";
    if (event.key.toLowerCase() === "r") {
      if (on && directRecord) exitCapture();
      else setCapture(!on);
      return;
    }
    if (!on) return;
    if (event.key === "Escape") exitCapture();
    if (event.key === " ") {
      event.preventDefault();
      replay();
    }
  });

  setCapture(directRecord);
}
