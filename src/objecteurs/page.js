import { lesObjecteurs as show } from '../library/data/exhibition-views.js';
const grid = document.querySelector('#view-grid');
const viewer = document.querySelector('#viewer');
const inquiry = document.querySelector('#inquiry');
let visible = show.views;
let active = show.views[0];
const space = view => show.filters.find(filter => filter.id === view.filters[0]).name;
function render() {
  grid.innerHTML = visible.map(view => `<figure class="view-card"><button data-open="${view.id}" aria-label="Agrandir la vue ${view.id}, ${space(view)}"><img src="${view.image}" width="${view.width}" height="${view.height}" loading="lazy" alt="Les Objecteurs — vue ${view.id}, ${space(view)}"><span aria-hidden="true">↗</span></button><figcaption><span>${view.id} — ${space(view)}</span><span>Vue d’exposition</span></figcaption></figure>`).join('');
  document.querySelector('#count').textContent = `${visible.length} vues`;
}
function openView(id) {
  active = show.views.find(view => view.id === id);
  const image = document.querySelector('#viewer-image');
  image.src = active.image;
  image.alt = `Les Objecteurs — vue ${active.id}, ${space(active)}. Photographie : Rebecca Fanuele.`;
  document.querySelector('#viewer-count').textContent = `${active.id} / 16`;
  document.querySelector('#viewer-space').textContent = space(active);
  if (!viewer.open) viewer.showModal();
}
function step(direction) {
  const collection = visible.includes(active) ? visible : show.views;
  openView(collection[(collection.indexOf(active) + direction + collection.length) % collection.length].id);
}
function prepare(view) {
  document.querySelector('#message').value = `Bonjour,\n\nJe souhaiterais obtenir des informations sur ${view ? `une œuvre visible dans la vue ${view.id} (${space(view)}) de l’exposition Les Objecteurs.\nRéférence de la photographie : ${view.image.split('/').pop()}\n\nL’œuvre qui m’intéresse : ` : 'les œuvres de l’exposition Les Objecteurs.\n\n'}\n\nMerci,`;
  document.querySelector('#copy-status').textContent = '';
  inquiry.showModal();
}
document.addEventListener('click', event => {
  const trigger = event.target.closest('[data-open]');
  if (trigger) openView(trigger.dataset.open);
  const close = event.target.closest('[data-close]');
  if (close) document.getElementById(close.dataset.close).close();
  const filter = event.target.closest('[data-filter]');
  if (filter) {
    visible = show.views.filter(view => filter.dataset.filter === 'all' || view.filters.includes(filter.dataset.filter));
    document.querySelectorAll('[data-filter]').forEach(button => button.setAttribute('aria-pressed', String(button === filter)));
    render();
  }
});
viewer.addEventListener('keydown', event => {
  if (inquiry.open) return;
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); step(event.key === 'ArrowRight' ? 1 : -1); }
});
document.querySelector('#previous').onclick = () => step(-1);
document.querySelector('#next').onclick = () => step(1);
document.querySelector('#view-inquiry').onclick = () => prepare(active);
document.querySelector('#general-inquiry').onclick = () => prepare();
document.querySelector('#copy').onclick = async () => {
  const status = document.querySelector('#copy-status');
  try { await navigator.clipboard.writeText(document.querySelector('#message').value); status.textContent = 'Message copié. Vous pouvez le transmettre à la galerie.'; }
  catch { document.querySelector('#message').select(); status.textContent = 'Sélectionnez et copiez le message avec votre clavier.'; }
};
document.querySelector('#artist-list').innerHTML = show.artists.map((artist, i) => `<li><span>${String(i + 1).padStart(2, '0')}</span>${artist}</li>`).join('');
render();
