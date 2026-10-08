import UIkit from "uikit";
import Icons from "uikit/dist/js/uikit-icons.js";
import "@kalkurama-theme";

UIkit.use(Icons);

document.documentElement.dataset.theme = __KALKURAMA_THEME__;

document.querySelectorAll("[data-active-theme]").forEach((node) => {
  node.textContent = __KALKURAMA_THEME__;
});

const currentPage = document.body.dataset.page;
document.querySelectorAll("[data-nav-page]").forEach((item) => {
  const active = item.dataset.navPage === currentPage;
  item.classList.toggle("uk-active", active);

  const link = item.matches("a") ? item : item.querySelector("a");
  if (link) {
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  }
});

document.querySelectorAll("[data-project-row]").forEach((row) => {
  row.addEventListener("click", (event) => {
    if (event.target.closest("a, button, input, select, textarea")) return;

    document.querySelectorAll("[data-project-row]").forEach((candidate) => {
      candidate.classList.remove("kalkurama-row-selected");
      candidate.setAttribute("aria-selected", "false");
    });

    row.classList.add("kalkurama-row-selected");
    row.setAttribute("aria-selected", "true");
  });
});
