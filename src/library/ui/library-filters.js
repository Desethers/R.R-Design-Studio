function titleCase(value) {
  return value.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}

function normalize(value) {
  return value.toLowerCase().replaceAll("-", " ").replace(/\s+/g, " ").trim();
}

function textFilter(label, key, value, active = false) {
  return `<button type="button" data-filter-key="${key}" data-filter-value="${value}" aria-pressed="${active}">${label}</button>`;
}

export function renderLibraryControls(registry) {
  const families = [...new Set(registry.map((entry) => entry.family))].sort();
  return `
    <section class="library-controls" aria-label="Library controls">
      <label class="library-search">
        <span>Search</span>
        <input type="search" placeholder="Search components..." autocomplete="off">
      </label>
      <div class="library-filter-block">
        <span>Category</span>
        <div class="library-text-options" aria-label="Filter by category">
          ${textFilter("All", "category", "all", true)}
          ${textFilter("Artwork", "category", "artwork")}
          ${textFilter("Artist", "category", "artist")}
          ${textFilter("Exhibition", "category", "exhibition")}
          ${textFilter("Navigation", "category", "navigation")}
          ${textFilter("Editorial", "category", "editorial")}
        </div>
      </div>
      <div class="library-filter-block">
        <span>Type</span>
        <div class="library-text-options" aria-label="Filter by type">
          ${textFilter("All", "type", "all", true)}
          ${textFilter("Pattern", "type", "pattern")}
          ${textFilter("Section", "type", "section")}
          ${textFilter("Page", "type", "page")}
        </div>
      </div>
      <label class="library-select">
        <span>Family</span>
        <select data-select-key="family">
          <option value="all">All families</option>
          ${families.map((family) => `<option value="${family}">${titleCase(family)}</option>`).join("")}
        </select>
      </label>
      <label class="library-select">
        <span>Interaction</span>
        <select data-select-key="interaction">
          <option value="all">All</option>
          <option value="static">Static</option>
          <option value="hover">Hover</option>
          <option value="animated">Animated</option>
        </select>
      </label>
      <div class="library-filter-block library-view-control">
        <span>View</span>
        <div class="library-text-options" aria-label="Change catalogue view">
          ${textFilter("Grid", "view", "grid", true)}
          ${textFilter("List", "view", "list")}
        </div>
      </div>
      <label class="library-select library-sort">
        <span>Sort</span>
        <select data-select-key="sort">
          <option value="recent">Recent</option>
          <option value="name">Name</option>
          <option value="category">Category</option>
        </select>
      </label>
    </section>`;
}

export function bindLibraryControls(root, onChange) {
  const state = {
    search: "",
    category: "all",
    type: "all",
    family: "all",
    interaction: "all",
    view: "grid",
    sort: "recent",
  };

  const emit = () => onChange({ ...state });
  root.querySelector(".library-search input").addEventListener("input", (event) => {
    state.search = normalize(event.target.value);
    emit();
  });

  root.querySelectorAll("[data-filter-key]").forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.dataset.filterKey;
      state[key] = button.dataset.filterValue;
      root.querySelectorAll(`[data-filter-key="${key}"]`).forEach((item) => {
        item.setAttribute("aria-pressed", String(item === button));
      });
      emit();
    });
  });

  root.querySelectorAll("[data-select-key]").forEach((select) => {
    select.addEventListener("change", () => {
      state[select.dataset.selectKey] = select.value;
      emit();
    });
  });
}

export function filterRegistry(registry, state) {
  const filtered = registry.filter((entry) => {
    const searchable = normalize([entry.id, entry.code, entry.family, entry.name, entry.category, entry.type, ...entry.tags].join(" "));
    return (!state.search || searchable.includes(state.search))
      && (state.category === "all" || entry.category === state.category)
      && (state.type === "all" || entry.type === state.type)
      && (state.family === "all" || entry.family === state.family)
      && (state.interaction === "all" || entry.interaction === state.interaction);
  });

  return filtered.sort((a, b) => {
    if (state.sort === "name") return `${a.family} ${a.name}`.localeCompare(`${b.family} ${b.name}`);
    if (state.sort === "category") return `${a.category} ${a.family}`.localeCompare(`${b.category} ${b.family}`);
    return b.updated.localeCompare(a.updated) || registry.indexOf(a) - registry.indexOf(b);
  });
}
