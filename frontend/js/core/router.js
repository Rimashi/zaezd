/* ============================================================================
   Маршрутизация по хешу адреса.

   Поддерживает параметры в адресе: '#/competitions/3' → params = { id: '3' }.
   Роутер не знает, что находится внутри раздела: он находит маршрут,
   вызывает его render(root, params) и подсвечивает активный пункт меню.

   Разделы описываются в js/views/index.js.
   ========================================================================== */

import { el, clear } from "./dom.js";
import { canViewSection } from "./session.js";

let routes = [];
let mount = null;

/**
 * @param {Array} routeList — [{ key, path, title, subtitle, icon, menu, activeKey, render(root, params) }]
 * @param {object} mountPoint — { root, setTitle } из js/ui/layout.js
 */
export function defineRoutes(routeList, mountPoint) {
  routes = routeList;
  mount = mountPoint;
}

/** Текущий путь из адресной строки, например '/competitions/3'. */
export function currentPath() {
  return window.location.hash.replace(/^#/, "") || "/dashboard";
}

/** Перейти в раздел: go('/competitions/3'). */
export function go(path) {
  window.location.hash = path;
}

export function startRouter() {
  window.addEventListener("hashchange", renderCurrentRoute);
  renderCurrentRoute();
}

/** Сопоставить путь с маршрутом и вытащить параметры. */
export function matchRoute(path) {
  const segments = path.split("/").filter(Boolean);

  for (const route of routes) {
    const pattern = route.path.split("/").filter(Boolean);
    if (pattern.length !== segments.length) continue;

    const params = {};
    let matched = true;

    for (let index = 0; index < pattern.length; index += 1) {
      const patternSegment = pattern[index];
      const actual = segments[index];
      if (patternSegment.startsWith(":")) {
        params[patternSegment.slice(1)] = decodeURIComponent(actual);
      } else if (patternSegment !== actual) {
        matched = false;
        break;
      }
    }

    if (matched) return { route, params };
  }
  return null;
}

async function renderCurrentRoute() {
  if (!mount) return;

  const path = currentPath();
  const match = matchRoute(path) ?? matchRoute("/dashboard");

  if (!match) {
    clear(mount.root);
    mount.root.append(
      el("div", { class: "error-panel", text: "Маршруты не описаны." }),
    );
    return;
  }

  const { route, params } = match;

  // Например, зритель не должен открыть /users даже вручную через hash.
  if (route.entity && !canViewSection(route.entity)) {
    if (path !== "/dashboard") {
      window.location.hash = "/dashboard";
      return;
    }
  }

  clear(mount.root);
  markActiveLink(route.activeKey ?? route.key);
  mount.setTitle(route.title, route.subtitle, route.icon);
  document.title = `${route.title} — Ипподром`;

  try {
    await route.render(mount.root, params);
  } catch (error) {
    console.error(error);
    mount.root.append(
      el("div", { class: "error-panel" }, [
        el("strong", { text: "Не удалось открыть раздел" }),
        el("div", { text: String(error?.message ?? error) }),
        el("pre", { text: error?.stack ?? "" }),
      ]),
    );
  }
}

function markActiveLink(key) {
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.toggle("is-active", link.dataset.route === key);
  });
}
