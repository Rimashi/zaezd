/* ============================================================================
   SVG-иконки интерфейса.

   Одна функция icon(name) отдаёт узел <svg>, наследующий цвет текста (currentColor).
   Чтобы добавить иконку, допишите её содержимое в PATHS.
   ========================================================================== */

const PATHS = {
  // Разделы
  dashboard:
    '<rect x="3" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5"/>',
  users:
    '<circle cx="9" cy="8" r="3.4"/><path d="M2.8 19.5c.9-3.2 3.3-4.9 6.2-4.9s5.3 1.7 6.2 4.9"/><path d="M16.5 5.2a2.8 2.8 0 0 1 0 5.4M18 14.8c2 .5 3.3 1.9 3.9 4.1"/>',
  owners: '<path d="M3.5 20V9.2L12 3.5l8.5 5.7V20"/><path d="M9.5 20v-6h5v6"/>',
  horses:
    '<path d="M7.1 4.7A9.2 9.2 0 0 0 4 11.6C4 17 7.5 20.5 12 20.5s8-3.5 8-8.9a9.2 9.2 0 0 0-3.1-6.9l-2.5 2.5a5.8 5.8 0 0 1 1.8 4.4c0 3.2-1.8 5.3-4.2 5.3s-4.2-2.1-4.2-5.3a5.8 5.8 0 0 1 1.8-4.4z"/><path d="M5.2 8.1 8 9.4M18.8 8.1 16 9.4M4.2 12.8l3.4-.2M19.8 12.8l-3.4-.2"/>',
  jockeys:
    '<circle cx="12" cy="6.4" r="2.6"/><path d="M4.5 20c.9-3.4 3.6-5.2 7.5-5.2s6.6 1.8 7.5 5.2"/><path d="M8.2 9.8h7.6"/>',
  races: '<path d="M6 3.5V21"/><path d="M6 4.5h11.5l-1.6 4.2 1.6 4.2H6"/>',
  results:
    '<path d="M4 20.5V12M12 20.5V4.5M20 20.5v-5.5"/><path d="M2.5 20.5h19"/>',
  teams:
    '<circle cx="8" cy="8.5" r="3.2"/><circle cx="17" cy="9.5" r="2.4"/><path d="M2.5 19.5c.8-3 3-4.6 5.5-4.6s4.7 1.6 5.5 4.6"/><path d="M14.5 19.5c.5-2 1.9-3.3 3.7-3.3 1.4 0 2.6.7 3.3 2"/>',
  participation:
    '<path d="M9.5 14.5l5-5"/><path d="M11.5 5.5l1.2-1.2a4 4 0 0 1 5.7 5.7l-1.2 1.2"/><path d="M12.5 18.5l-1.2 1.2a4 4 0 0 1-5.7-5.7l1.2-1.2"/>',
  trophy:
    '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 5H5.5v2A3 3 0 0 0 8 10M16 5h2.5v2a3 3 0 0 1-2.5 3"/><path d="M12 13v3M9 20h6l-.8-4h-4.4z"/>',

  // Действия
  search: '<circle cx="11" cy="11" r="6"/><path d="M15.5 15.5 20 20"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  edit: '<path d="M4 20h4l10-10-4-4L4 16z"/><path d="M14 6l4 4"/>',
  trash:
    '<path d="M5 7h14"/><path d="M10 11v6M14 11v6"/><path d="M6.5 7l.9 13h9.2l.9-13"/><path d="M9.5 7V4h5v3"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  reset: '<path d="M4.5 12a7.5 7.5 0 1 0 2.3-5.4"/><path d="M4 4.5V9h4.5"/>',
  empty:
    '<path d="M4 7.5l8-4 8 4v9l-8 4-8-4z"/><path d="M4 7.5l8 4 8-4M12 11.5V20"/>',
  check: '<path d="M5 12.5 9.5 17 19 7.5"/>',
  open: '<path d="M5 12h13"/><path d="M13 6l6 6-6 6"/>',
  logout:
    '<path d="M9.5 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3.5"/><path d="M15 8l4 4-4 4"/><path d="M19 12H9.5"/>',
  lock: '<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8.5 10V7.5a3.5 3.5 0 0 1 7 0V10"/>',
  eye: '<path d="M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.6"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5"/><path d="M12 7.9v.2"/>',
  pin: '<path d="M8.5 4.5h7l-1 5 3 3v1H6.5v-1l3-3z"/><path d="M12 13.5V21"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  arrowUp: '<path d="M12 19V5"/><path d="m6.5 10.5 5.5-5.5 5.5 5.5"/>',
  arrowDown: '<path d="M12 5v14"/><path d="m6.5 13.5 5.5 5.5 5.5-5.5"/>',
};

/**
 * @param {string} name — ключ из PATHS
 * @param {string} className — необязательный css-класс
 * @returns {SVGElement}
 */
export function icon(name, className = "") {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "1.7");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.setAttribute("aria-hidden", "true");
  if (className) svg.setAttribute("class", className);
  svg.innerHTML = PATHS[name] ?? PATHS.empty;
  return svg;
}
