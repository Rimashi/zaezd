/* ============================================================================
   Всплывающие уведомления в правом нижнем углу.
   Вызов: toast('Изменения сохранены') или toast('Ошибка', 'error').
   ========================================================================== */

import { el } from "../core/dom.js";

const VISIBLE_MS = 3200;

export function toast(message, type = "ok") {
  const root = document.getElementById("toast-root");
  if (!root) return;

  const node = el("div", { class: `toast toast-${type}`, role: "status" }, [
    el("span", { text: message }),
  ]);

  root.append(node);
  setTimeout(() => node.remove(), VISIBLE_MS);
}
