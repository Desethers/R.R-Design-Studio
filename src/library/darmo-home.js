const menuButton = document.querySelector(".darmo-header__menu-button");
const navigation = document.querySelector(".darmo-header__nav");

menuButton?.addEventListener("click", () => {
  const open = menuButton.getAttribute("aria-expanded") !== "true";
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  navigation.dataset.open = String(open);
});

const cookieNotice = document.querySelector(".darmo-cookie");
if (sessionStorage.getItem("darmo-preview-cookie-dismissed") === "true") cookieNotice.hidden = true;
cookieNotice?.addEventListener("click", (event) => {
  if (!event.target.closest("[data-cookie-close], [data-cookie-accept], [data-cookie-settings]")) return;
  cookieNotice.hidden = true;
  sessionStorage.setItem("darmo-preview-cookie-dismissed", "true");
});

document.querySelector(".darmo-newsletter__form")?.addEventListener("submit", (event) => {
  event.preventDefault();
  document.querySelector(".darmo-newsletter__notice").hidden = false;
});
