/* ============================================================================
   Каркас страницы: закрепляемый/автоскрываемый сайдбар, мобильное burger-меню,
   верхняя панель и область раздела.
   ========================================================================== */

import { el } from "../core/dom.js";
import { icon } from "./icons.js";
import { api } from "../core/api.js";
import { routes } from "../views/index.js";
import { canViewSection } from "../core/session.js";
import { canUse } from "../data/permissions.js";
import { currentUser, logout } from "../core/session.js";
import { toneFor } from "../data/schema.js";
import { roleLabel } from "./roles.js";

const SIDEBAR_PIN_KEY = "hippodrome.sidebar.pinned.v1";
const MOBILE_MEDIA = "(max-width: 900px)";

export function renderShell(root) {
  const user = currentUser();
  let sidebarPinned = readSidebarPinned();
  let mobileMenuOpen = false;

  /* --------------------------------------------------------------- меню */
  const nav = el("nav", { class: "nav", "aria-label": "Основная навигация" });
  let currentGroup = null;

  for (const route of routes.filter(
    (item) => item.menu !== false && allowed(item, user),
  )) {
    if (route.group && route.group !== currentGroup) {
      currentGroup = route.group;
      nav.append(el("div", { class: "nav-group-label", text: route.group }));
    }

    nav.append(
      el(
        "a",
        {
          class: "nav-link",
          href: `#${route.path}`,
          title: route.title,
          dataset: { route: route.key },
        },
        [
          icon(route.icon),
          el("span", { class: "nav-text", text: route.title }),
          route.entity
            ? el("span", {
                class: "nav-count",
                dataset: { countFor: route.entity },
                text: "0",
              })
            : null,
        ],
      ),
    );
  }

  let shell;
  let sidebar;

  const pinText = el("span", { class: "sidebar-pin-text" });
  const pinButton = el(
    "button",
    {
      class: "sidebar-pin",
      type: "button",
      onclick: (event) => {
        sidebarPinned = !sidebarPinned;
        try {
          localStorage.setItem(SIDEBAR_PIN_KEY, sidebarPinned ? "1" : "0");
        } catch {
          /* ignore */
        }
        applySidebarState();

        // После «Открепить» меню должно сразу свернуться, даже если курсор
        // всё ещё находится над сайдбаром и кнопка сохраняла focus.
        event.currentTarget.blur();
        if (!sidebarPinned) requestAnimationFrame(forceAutohideCollapse);
        else clearForcedCollapse();
      },
    },
    [icon("pin"), pinText],
  );

  const mobileCloseButton = el(
    "button",
    {
      class: "mobile-sidebar-close btn-icon",
      type: "button",
      title: "Закрыть меню",
      "aria-label": "Закрыть меню",
      onclick: closeMobileMenu,
    },
    [icon("close")],
  );

  sidebar = el(
    "aside",
    { class: "sidebar", "aria-label": "Боковая навигация" },
    [
      el("div", { class: "brand" }, [
        el("div", { class: "brand-mark" }, [icon("horses")]),
        el("div", { class: "brand-copy" }, [
          el("div", { class: "brand-title", text: "Ипподром" }),
          el("div", { class: "brand-sub", text: "управление соревнованиями" }),
        ]),
        mobileCloseButton,
      ]),
      el("div", { class: "sidebar-controls" }, [pinButton]),
      nav,
      el("div", { class: "sidebar-foot" }, [
        el(
          "button",
          {
            class: "ghost-link",
            type: "button",
            title: "Выйти из системы",
            onclick: handleLogout,
          },
          [
            icon("logout"),
            el("span", { class: "nav-text", text: "Выйти из системы" }),
          ],
        ),
      ]),
    ],
  );

  /* ------------------------------------------ верхняя панель и содержимое */
  const titleNode = el("h1");
  const subtitleNode = el("div", { class: "page-subtitle" });
  const viewRoot = el("main", { class: "view" });

  const mobileMenuButton = el(
    "button",
    {
      class: "mobile-menu-toggle btn-icon",
      type: "button",
      title: "Открыть меню",
      "aria-label": "Открыть меню",
      "aria-expanded": "false",
      onclick: openMobileMenu,
    },
    [icon("menu")],
  );

  const userBox = el("div", { class: "user-box" }, [
    el("div", { class: "user-info" }, [
      el("div", {
        class: "user-name",
        text: user?.email ?? user?.login ?? "—",
      }),
      el("div", { class: "user-login", text: `логин: ${user?.login ?? "—"}` }),
    ]),
    el("span", {
      class: `badge ${toneFor(user?.role)}`,
      text: roleLabel(user?.role),
    }),
  ]);

  const backdrop = el("button", {
    class: "mobile-nav-backdrop",
    type: "button",
    tabindex: "-1",
    "aria-label": "Закрыть меню",
    onclick: closeMobileMenu,
  });

  const scrollTopButton = el(
    "button",
    {
      class: "scroll-top-btn",
      type: "button",
      title: "Наверх",
      "aria-label": "Прокрутить страницу вверх",
      onclick: () => window.scrollTo({ top: 0, behavior: "smooth" }),
    },
    [icon("arrowUp")],
  );

  shell = el("div", { class: "shell" }, [
    sidebar,
    backdrop,
    el("div", { class: "main" }, [
      el("header", { class: "topbar" }, [
        mobileMenuButton,
        el("div", { class: "page-title" }, [titleNode, subtitleNode]),
        userBox,
      ]),
      viewRoot,
    ]),
    scrollTopButton,
  ]);

  root.replaceChildren(shell);
  applySidebarState();

  /* ---------------------------------------------------- интерактив меню */
  nav.addEventListener("click", (event) => {
    const link = event.target.closest(".nav-link");
    if (!link) return;

    if (isMobile()) {
      closeMobileMenu();
      return;
    }

    // При автоскрытии выбранный пункт не должен оставлять сайдбар раскрытым
    // из-за :focus-within или из-за курсора, который ещё не успел уйти.
    if (!sidebarPinned) {
      link.blur();
      requestAnimationFrame(forceAutohideCollapse);
    }
  });

  sidebar.addEventListener("pointerleave", () => {
    // После ухода курсора снимаем «принудительное сворачивание», чтобы при
    // следующем наведении меню снова могло раскрыться.
    clearForcedCollapse();
  });

  sidebar.addEventListener("focusin", () => {
    // Клавиатурная навигация должна иметь возможность раскрыть меню.
    if (!isMobile() && document.activeElement !== pinButton)
      clearForcedCollapse();
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && mobileMenuOpen) closeMobileMenu();
  });

  window.matchMedia(MOBILE_MEDIA).addEventListener?.("change", (event) => {
    if (!event.matches) closeMobileMenu();
  });

  const updateScrollTop = () => {
    scrollTopButton.classList.toggle("is-visible", window.scrollY > 360);
  };
  window.addEventListener("scroll", updateScrollTop, { passive: true });
  updateScrollTop();

  refreshCounts();
  api.onDataChange(refreshCounts);

  return {
    root: viewRoot,

    setTitle(title, subtitle, iconName) {
      titleNode.replaceChildren(
        icon(iconName ?? "dashboard"),
        el("span", { text: title }),
      );
      subtitleNode.textContent = subtitle ?? "";
    },
  };

  function applySidebarState() {
    if (!shell) return;
    shell.classList.toggle("sidebar-pinned", sidebarPinned);
    shell.classList.toggle("sidebar-autohide", !sidebarPinned);
    pinButton.classList.toggle("is-pinned", sidebarPinned);

    const label = sidebarPinned ? "Открепить меню" : "Закрепить меню";
    pinText.textContent = label;
    pinButton.title = sidebarPinned
      ? "Открепить и автоматически сворачивать меню"
      : "Закрепить раскрытое меню";
    pinButton.setAttribute("aria-label", pinButton.title);
    pinButton.setAttribute("aria-pressed", sidebarPinned ? "true" : "false");
  }

  function forceAutohideCollapse() {
    if (!shell || sidebarPinned || isMobile()) return;
    shell.classList.add("sidebar-force-collapsed");
    if (sidebar.contains(document.activeElement))
      document.activeElement?.blur?.();
  }

  function clearForcedCollapse() {
    shell?.classList.remove("sidebar-force-collapsed");
  }

  function openMobileMenu() {
    if (!shell || !isMobile()) return;
    mobileMenuOpen = true;
    shell.classList.add("mobile-menu-open");
    document.body.classList.add("mobile-nav-open");
    mobileMenuButton.setAttribute("aria-expanded", "true");
    mobileCloseButton.focus({ preventScroll: true });
  }

  function closeMobileMenu() {
    if (!shell) return;
    mobileMenuOpen = false;
    shell.classList.remove("mobile-menu-open");
    document.body.classList.remove("mobile-nav-open");
    mobileMenuButton.setAttribute("aria-expanded", "false");
  }
}

/* ------------------------------------------------------------------ права */

function allowed(route, user) {
  if (!user) return false;
  if (route.entity) return canViewSection(route.entity);
  if (route.capability) return canUse(user.role, route.capability);
  return true;
}

/* ------------------------------------------------------------------ счётчики */

async function refreshCounts() {
  try {
    const counts = await api.counts();
    document.querySelectorAll("[data-count-for]").forEach((node) => {
      const value = counts[node.dataset.countFor];
      node.textContent = value === undefined ? "" : String(value);
    });
  } catch (error) {
    console.warn("Не удалось обновить счётчики:", error);
  }
}

/* ------------------------------------------------------------------ действия */

function isMobile() {
  return window.matchMedia(MOBILE_MEDIA).matches;
}

function readSidebarPinned() {
  try {
    const value = localStorage.getItem(SIDEBAR_PIN_KEY);
    return value === null ? true : value === "1";
  } catch {
    return true;
  }
}

async function handleLogout() {
  await logout();
  window.location.reload();
}
