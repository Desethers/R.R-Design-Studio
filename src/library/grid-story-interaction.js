// Grid-only interaction; the Expand Lab remains independent.
// Vertical gap between cards, expressed in the fine rows used to pack the grid.
const ROW_GAP = 46;

export function initGridStory(root) {
  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = '/src/styles/grid-artist-story.css';
  document.head.append(style);

  const packGrid = grid => {
    const items = [...grid.querySelectorAll('.section-artist-grid__item, .grid-artist-story')];
    const expanded = !!grid.querySelector('.grid-artist-story');
    grid.classList.toggle('is-story-packed', expanded);
    items.forEach(item => item.style.removeProperty('grid-row-end'));
    if (!expanded) return;
    const isStory = item => item.classList.contains('grid-artist-story');
    // Every card spans the same number of fine rows — otherwise a name wrapping
    // to two lines shifts its column and the row below stops lining up.
    const rowHeight = () => Math.max(...items.filter(item => !isStory(item)).map(item => item.offsetHeight));
    const applySpans = () => {
      const rowUnit = rowHeight() + ROW_GAP;
      items.forEach(item => {
        // An expanded card keeps its own height but rounds up to a whole number
        // of rows, so the columns beside it stay lined up.
        const span = isStory(item) ? Math.ceil(item.offsetHeight / rowUnit) * rowUnit : rowUnit;
        item.style.gridRowEnd = `span ${Math.ceil(span)}`;
      });
    };
    applySpans();

    // The fully expanded card also ends level with the second row of cards.
    // Card heights follow the column width, so measure them — but use their
    // heights, not their positions, which the expanded card itself shifts.
    grid.querySelectorAll('.grid-artist-story:not([data-story-step="2"])')
      .forEach(other => other.style.removeProperty('--story-target-height'));
    const story = grid.querySelector('.grid-artist-story[data-story-step="2"]');
    if (!story || items.length < 2) return;
    story.style.setProperty('--story-target-height', `${Math.round(rowHeight() * 2 + ROW_GAP)}px`);
    applySpans();
  };
  window.addEventListener('resize', () => {
    root.querySelectorAll('.is-story-packed').forEach(packGrid);
  });
  root.addEventListener('load', event => {
    const grid = event.target.closest?.('.is-story-packed');
    if (grid) packGrid(grid);
  }, true);

  root.addEventListener('click', event => {
    const trigger = event.target.closest('[data-grid-story-expand]');
    const source = event.target.closest('.section-artist-grid--cards [data-artist-id="vincent-van-gogh"]');
    if ((!source && !trigger) || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const section = (source || trigger).closest('.section-artist-grid--cards');
    if (!section || section.dataset.storyBusy) return;
    const template = section.querySelector('[data-grid-story-template]');
    if (!template) return;
    event.preventDefault();
    const grid = section.querySelector('.section-artist-grid__items');
    const items = () => [...grid.querySelectorAll('.section-artist-grid__item, .grid-artist-story')];
    const before = new Map(items().map(item => [item, item.getBoundingClientRect()]));
    let card = trigger?.closest('.grid-artist-story');
    const previous = source || card;
    const previousBox = previous.getBoundingClientRect();
    const partSelectors = source
      ? ['figure', 'h3']
      : ['.grid-artist-story__media', '.grid-artist-story__heading h2', '.grid-artist-story__date', '.grid-artist-story__details > p:not(.grid-artist-story__date)', '.grid-artist-story__more'];
    const partRects = partSelectors.map(selector => previous.querySelector(selector)?.getBoundingClientRect());
    // Disable competing CSS transitions before measuring the destination.
    section.dataset.storyBusy = 'true';
    let focusTarget;
    if (source) {
      card = template.content.firstElementChild.cloneNode(true);
      card.style.order = source.style.order;
      card.gridSource = source;
      card.dataset.storyStep = '1';
      source.replaceWith(card);
      before.set(card, before.get(source));
      focusTarget = card.querySelector('[data-grid-story-expand]');
    } else if (card.dataset.storyStep === '1') {
      card.dataset.storyStep = '2';
      focusTarget = trigger;
    } else {
      const original = card.gridSource;
      before.set(original, before.get(card));
      card.replaceWith(original);
      focusTarget = original;
    }
    const button = card.querySelector('[data-grid-story-expand]');
    button.setAttribute('aria-expanded', 'true');
    button.setAttribute('aria-label', card.dataset.storyStep === '2'
      ? 'Fermer la carte de Vincent Van Gogh' : 'Afficher les œuvres de Vincent Van Gogh');
    packGrid(grid);
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timing = { duration: reduced ? 0 : 700, easing: 'cubic-bezier(.22,1,.36,1)' };
    const inner = card.isConnected ? card.querySelector('.grid-artist-story__trigger') : null;
    const cardBox = card.isConnected ? card.getBoundingClientRect() : null;
    // Record fits the complete 880 px workspace with a transform. DOM rects are
    // therefore visual pixels while animated widths/translations use local CSS
    // pixels. Convert every FLIP measurement back to the grid coordinate space.
    const gridBox = grid.getBoundingClientRect();
    const layoutScale = grid.offsetWidth ? gridBox.width / grid.offsetWidth : 1;
    const local = value => value / (layoutScale || 1);
    if (inner) inner.style.width = `${local(cardBox.width)}px`;
    const targets = ['.grid-artist-story__media', '.grid-artist-story__heading h2', '.grid-artist-story__date', '.grid-artist-story__details > p:not(.grid-artist-story__date)', '.grid-artist-story__more'];
    const parts = inner ? targets.map(selector => card.querySelector(selector)) : [];
    const destinations = parts.map(part => part.getBoundingClientRect());
    const animations = items().map(item => {
      const first = before.get(item);
      const last = item.getBoundingClientRect();
      if (!first || !last.width || !last.height) return Promise.resolve();
      const start = { transform: `translate(${local(first.left-last.left)}px, ${local(first.top-last.top)}px)` };
      const end = { transform: 'none' };
      if (item === card) {
        start.width = `${local(first.width)}px`;
        start.height = `${local(first.height)}px`;
        end.width = `${local(last.width)}px`;
        end.height = `${local(last.height)}px`;
      }
      return item.animate([start, end], timing).finished.catch(() => {});
    });
    if (inner) {
      parts.forEach((part, index) => {
        const first = partRects[index];
        const last = destinations[index];
        const start = first ? {
          transform: `translate(${local(first.left-previousBox.left-(last.left-cardBox.left))}px, ${local(first.top-previousBox.top-(last.top-cardBox.top))}px)`,
        } : { opacity: 0, transform: 'translateY(8px)' };
        const end = { transform: 'none', opacity: 1 };
        if (index === 0 && first) {
          start.width = `${local(first.width)}px`;
          start.height = `${local(first.height)}px`;
          end.width = `${local(last.width)}px`;
          end.height = `${local(last.height)}px`;
        }
        animations.push(part.animate([start, end], timing).finished.catch(() => {}));
      });
      if (card.dataset.storyStep === '2') {
        animations.push(card.querySelector('.grid-artist-story__artwork').animate([
          { opacity: 0, clipPath: 'inset(100% 0 0 round 12px)' },
          { opacity: 1, clipPath: 'inset(0 round 12px)' },
        ], timing).finished.catch(() => {}));
      }
    }
    Promise.all(animations).finally(() => {
      inner?.style.removeProperty('width');
      delete section.dataset.storyBusy;
      focusTarget.focus({ preventScroll: true });
    });
  });
}
