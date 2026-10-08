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


document.querySelectorAll("[data-project-list]").forEach((list) => {
  const rows = [...list.querySelectorAll('[data-project-list-target="row"]')];

  list.addEventListener("click", (event) => {
    const row = event.target.closest('[data-project-list-target="row"]');
    if (!(row instanceof HTMLElement) || !list.contains(row)) return;
    if (event.target.closest("a, button, input, select, textarea, label")) return;
    if (row.dataset.href) window.location.assign(row.dataset.href);
  });

  list.addEventListener("keydown", (event) => {
    if (!["ArrowDown", "ArrowUp", "Home", "End", "Enter", " "].includes(event.key) || rows.length === 0) return;

    const active = document.activeElement instanceof HTMLElement
      ? document.activeElement.closest('[data-project-list-target="row"]')
      : null;
    let index = active ? rows.indexOf(active) : rows.findIndex((row) => row.classList.contains("kalkurama-row-selected"));
    if (index < 0) index = 0;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (rows[index]?.dataset.href) window.location.assign(rows[index].dataset.href);
      return;
    }

    event.preventDefault();
    if (event.key === "Home") index = 0;
    else if (event.key === "End") index = rows.length - 1;
    else if (event.key === "ArrowDown") index = Math.min(rows.length - 1, index + 1);
    else if (event.key === "ArrowUp") index = Math.max(0, index - 1);
    rows[index]?.focus();
  });
});

document.querySelectorAll('[data-controller="timer"][data-timer-started-at-value]').forEach((timer) => {
  const target = timer.querySelector('[data-timer-target="elapsed"]');
  if (!target) return;

  const startedAt = Date.parse(timer.dataset.timerStartedAtValue);
  if (!Number.isFinite(startedAt)) return;

  const render = () => {
    const elapsed = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
    const hours = String(Math.floor(elapsed / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((elapsed % 3600) / 60)).padStart(2, "0");
    const seconds = String(elapsed % 60).padStart(2, "0");
    target.textContent = hours + ":" + minutes + ":" + seconds;
  };

  render();
  window.setInterval(render, 1000);
});
