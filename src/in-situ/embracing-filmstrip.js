import { embracingImages as images } from './embracing-data.js';

const filmstrip = document.querySelector('.ef-filmstrip');
const stage = document.querySelector('.ef-stage');
const stageImage = document.querySelector('.ef-image img');
let active = 1;

stageImage.addEventListener('load', () => {
  stage.dataset.imageOrientation = stageImage.naturalWidth > stageImage.naturalHeight ? 'landscape' : 'portrait';
});

const fromHash = () => {
  const match = location.hash.match(/^#oeuv-(\d+)$/);
  return match ? Math.max(0, Math.min(images.length - 1, Number(match[1]) - 1)) : 1;
};

filmstrip.innerHTML = images.map((item, index) => `<button type="button" class="ef-thumb" data-image="${index}" aria-label="Image ${index + 1} sur ${images.length}" aria-current="false"><img src="${item.image}" alt="" loading="lazy"></button>`).join('');
const thumbs = [...filmstrip.children];

// Layout offsets rather than bounding rects: the active thumb is scaled, which would skew rect-based maths.
const thumbCentre = thumb => thumb.offsetLeft + thumb.offsetWidth / 2;
function centreOn(index, behavior) {
  filmstrip.scrollTo({ left: thumbCentre(thumbs[index]) - filmstrip.clientWidth / 2, behavior });
}
function centredIndex() {
  const middle = filmstrip.scrollLeft + filmstrip.clientWidth / 2;
  let best = 0;
  thumbs.forEach((thumb, index) => {
    if (Math.abs(thumbCentre(thumb) - middle) < Math.abs(thumbCentre(thumbs[best]) - middle)) best = index;
  });
  return best;
}

// The centred image is slightly larger; every thumbnail stays upright.
const POP = 0.34;
function applyPerspective() {
  const middle = filmstrip.scrollLeft + filmstrip.clientWidth / 2;
  const pitch = thumbCentre(thumbs[1]) - thumbCentre(thumbs[0]);
  thumbs.forEach(thumb => {
    const offset = (thumbCentre(thumb) - middle) / pitch;
    const ramp = Math.min(Math.abs(offset), 1);
    const stagger = Math.min(Math.abs(offset), 3) * 3;
    thumb.style.transform = `translateY(${stagger}px) scale(${1 + (1 - ramp) * POP})`;
    thumb.style.zIndex = Math.round(100 - Math.abs(offset) * 10);
  });
}

function show(index, updateHash = true) {
  active = (index + images.length) % images.length;
  const item = images[active];
  stageImage.src = item.image;
  stageImage.alt = item.alt;
  document.querySelector('.ef-count').textContent = `${active + 1}/${images.length}`;
  document.querySelector('[data-caption]').textContent = active === 0 ? '' : item.caption;
  thumbs.forEach((thumb, position) => thumb.setAttribute('aria-current', String(position === active)));
  if (updateHash) history.replaceState(null, '', `#oeuv-${active + 1}`);
}

// The thumb sitting at the centre of the strip is the displayed image, so lateral scrolling drives the selection.
let pending = false;
filmstrip.addEventListener('scroll', () => {
  if (pending) return;
  pending = true;
  requestAnimationFrame(() => {
    pending = false;
    applyPerspective();
    const index = centredIndex();
    if (index !== active) show(index);
  });
}, { passive: true });
addEventListener('resize', applyPerspective);

filmstrip.addEventListener('click', event => {
  const thumb = event.target.closest('[data-image]');
  if (thumb) centreOn(Number(thumb.dataset.image), 'smooth');
});

function keyboard(event) {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    centreOn((active + (event.key === 'ArrowLeft' ? -1 : 1) + images.length) % images.length, 'smooth');
  }
}
addEventListener('keydown', keyboard);
addEventListener('hashchange', () => centreOn(fromHash(), 'instant'));

show(fromHash(), false);
centreOn(active, 'instant');
applyPerspective();
