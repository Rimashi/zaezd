/* ============================================================================
   Модальные окна: форма в окне, подтверждение удаления.

   Вся работа идёт через два метода:
     openModal({ title, body, footer, size, onClose }) → { element, close }
     confirmDialog({ title, message, confirmText, danger }) → Promise<boolean>
   ========================================================================== */

import { el, clear } from "../core/dom.js";
import { icon } from "./icons.js";

let closeCurrent = null;

export function openModal({
  title,
  body,
  footer = [],
  size = "",
  onClose = null,
}) {
  const root = document.getElementById("modal-root");
  if (!root) return { element: null, close: () => {} };

  const close = () => {
    if (root.hidden) return;
    root.hidden = true;
    clear(root);
    closeCurrent = null;
    if (typeof onClose === "function") onClose();
  };

  const dialog = el(
    "div",
    {
      class: ["modal", size].filter(Boolean).join(" "),
      role: "dialog",
      "aria-modal": "true",
    },
    [
      el("div", { class: "modal-head" }, [
        el("h2", { text: title }),
        el(
          "button",
          {
            class: "btn btn-icon",
            type: "button",
            title: "Закрыть",
            onclick: close,
          },
          [icon("close")],
        ),
      ]),
      el("div", { class: "modal-body" }, body),
      footer.length ? el("div", { class: "modal-foot" }, footer) : null,
    ],
  );

  root.replaceChildren(dialog);
  root.hidden = false;
  closeCurrent = close;

  const firstField = dialog.querySelector("input, select, textarea");
  if (firstField) firstField.focus();

  return { element: dialog, close };
}

export function closeModal() {
  if (closeCurrent) closeCurrent();
}

/** Диалог подтверждения. Возвращает промис: true — подтвердили, false — отказались. */
export function confirmDialog({
  title,
  message,
  confirmText = "Подтвердить",
  danger = false,
}) {
  return new Promise((resolve) => {
    let answered = false;

    const cancelButton = el("button", {
      class: "btn",
      type: "button",
      text: "Отмена",
      onclick: () => finish(false),
    });

    const confirmButton = el("button", {
      class: `btn ${danger ? "btn-danger" : "btn-primary"}`,
      type: "button",
      text: confirmText,
      onclick: () => finish(true),
    });

    const modal = openModal({
      title,
      body: el("p", { text: message }),
      footer: [cancelButton, confirmButton],
      size: "modal-sm",
      onClose: () => {
        if (!answered) resolve(false);
      }, // закрыли крестиком или Esc — считаем отказом
    });

    confirmButton.focus();

    function finish(value) {
      answered = true;
      modal.close();
      resolve(value);
    }
  });
}

/* Глобальные обработчики: Esc и клик по затемнению */
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeModal();
});

document.getElementById("modal-root")?.addEventListener("click", (event) => {
  if (event.target.id === "modal-root") closeModal();
});
