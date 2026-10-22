const icons = {
  desktop: `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="1.5" y="2.5" width="13" height="8" rx="1" stroke="currentColor" stroke-width="1.2"/><path d="M6 13.5h4M8 10.5v3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>`,
  mobile: `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4.5" y="1.5" width="7" height="13" rx="1.5" stroke="currentColor" stroke-width="1.2"/><circle cx="8" cy="12.2" r=".6" fill="currentColor"/></svg>`,
  square: `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2.5" y="2.5" width="11" height="11" rx="1" stroke="currentColor" stroke-width="1.2"/></svg>`,
  portrait: `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3.5" y="1.5" width="9" height="13" rx="1" stroke="currentColor" stroke-width="1.2"/></svg>`,
};

const labels = { desktop: "Desktop", mobile: "Mobile", square: "Square", portrait: "4:5" };

export function viewButtons(activeView = "desktop") {
  return Object.entries(icons).map(([view, svg]) => `
    <button type="button" data-view="${view}" aria-pressed="${view === activeView}" aria-label="${labels[view]}" title="${labels[view]}">${svg}</button>`).join("");
}
