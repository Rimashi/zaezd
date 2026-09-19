/* ============================================================================
   Помощники для работы с DOM.

   Зачем: чтобы в остальных файлах не было простыней из document.createElement.
   Основной инструмент — функция el(), которая собирает узел из описания:

     el('div', { class: 'card' }, [ el('h2', { text: 'Заголовок' }) ])

   Дети могут быть узлами, строками или null (null просто пропускается) —
   удобно для условных элементов внутри списка.
   ========================================================================== */

/**
 * Создать элемент.
 * @param {string} tag — имя тега
 * @param {object} attrs — атрибуты: class, text, html, dataset, on<Event> и любые обычные
 * @param {Array|Node|string} children — содержимое
 */
export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);

  for (const [key, value] of Object.entries(attrs)) {
    if (value === null || value === undefined || value === false) continue;

    if (key === "class") node.className = value;
    else if (key === "text") node.textContent = value;
    else if (key === "html") node.innerHTML = value;
    else if (key === "dataset") Object.assign(node.dataset, value);
    else if (key.startsWith("on") && typeof value === "function") {
      node.addEventListener(key.slice(2).toLowerCase(), value);
    } else node.setAttribute(key, value === true ? "" : value);
  }

  return append(node, children);
}

/** Добавить детей в узел (приводит строки к текстовым узлам, пропускает null). */
export function append(parent, children) {
  const list = Array.isArray(children) ? children : [children];
  for (const child of list) {
    if (child === null || child === undefined || child === false) continue;
    parent.append(
      child instanceof Node ? child : document.createTextNode(String(child)),
    );
  }
  return parent;
}

/** Короткая запись для document.querySelector. */
export function qs(selector, root = document) {
  return root.querySelector(selector);
}

/** Полностью очистить узел. */
export function clear(node) {
  node.replaceChildren();
  return node;
}

/**
 * Подстановка текста вместо узла: запомнить узел и заменять только содержимое.
 * Используется, когда нужно часто перерисовывать одну и ту же область.
 */
export function replace(node, children) {
  node.replaceChildren();
  return append(node, children);
}
