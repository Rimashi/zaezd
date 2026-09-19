/* ============================================================================
   Действия над одной записью: создать, изменить, удалить.

   Вынесены отдельно, потому что нужны и в списках (js/ui/crudPage.js),
   и на странице соревнования, где форма открывается из другой разметки.

   Ошибки предметной области возвращает backend в виде DomainError:
   понятный текст показывается пользователю, а ошибки по конкретным полям
   подсвечиваются прямо в форме.
   ========================================================================== */

import { el } from "../core/dom.js";
import { icon } from "./icons.js";
import { api, DomainError } from "../core/api.js";
import { entities, describe } from "../data/schema.js";
import { buildForm } from "./form.js";
import { openModal, confirmDialog } from "./modal.js";
import { toast } from "./toast.js";

/** Показать пользователю причину отказа. */
export function reportError(error, form = null) {
  if (error instanceof DomainError) {
    toast(error.message, "error");
    if (form && error.fields) form.showErrors(error.fields);
    console.warn("[правила предметной области]", error.message);
    return;
  }
  console.error(error);
  toast(`Непредвиденная ошибка: ${error?.message ?? error}`, "error");
}

/**
 * Открыть форму создания или изменения.
 * @param {string} entityKey
 * @param {object|null} row — null для создания
 * @param {object} lookup — справочники (js/ui/lookup.js)
 * @param {object} [options] — { defaults, hiddenFields, onSaved }
 * @returns {Promise<boolean>} true, если запись сохранена
 */
export async function openEntityForm(entityKey, row, lookup, options = {}) {
  const entity = entities[entityKey];
  const isNew = !row;
  // Пароль не подставляем в форму: пустое поле означает «оставить прежний пароль»
  const initial = isNew
    ? { ...(options.defaults ?? {}) }
    : entityKey === "users"
      ? { ...row, password: "" }
      : row;

  const form = await buildForm(entityKey, initial, {
    optionsFor: (refKey) => lookup.optionsFor(refKey),
    hiddenFields: options.hiddenFields ?? [],
  });

  let modal = null;
  let settle = () => {};
  let settled = false;
  const finish = (value) => {
    if (settled) return;
    settled = true;
    settle(value);
  };

  const cancelButton = el("button", {
    class: "btn",
    type: "button",
    text: "Отмена",
    onclick: () => {
      finish(false);
      modal?.close();
    },
  });
  const saveButton = el(
    "button",
    {
      class: "btn btn-primary",
      type: "button",
      text: isNew ? "Создать" : "Сохранить",
    },
    [icon("check")],
  );

  modal = openModal({
    title: isNew
      ? entity.newTitle
      : `Изменить: ${describe(entityKey, row, lookup.db)}`,
    body: form.element,
    footer: [cancelButton, saveButton],
    onClose: () => finish(false),
  });

  form.element.addEventListener("submit", () => saveButton.click());

  return new Promise((resolve) => {
    settle = resolve;

    saveButton.addEventListener("click", async () => {
      const { valid, values, errors } = form.validate();
      if (!valid) {
        toast(
          `Проверьте заполнение формы: ${Object.values(errors)[0]}`,
          "error",
        );
        return;
      }

      // Пустой пароль при редактировании означает «не менять». Не отправляем null
      // в REST API, чтобы сервер случайно не затёр существующий хеш.
      if (
        !isNew &&
        entityKey === "users" &&
        !String(values.password ?? "").trim()
      )
        delete values.password;

      saveButton.disabled = true;
      try {
        const result = isNew
          ? await api.create(entityKey, values)
          : await api.update(entityKey, row.id, values);
        finish(true);
        modal.close();
        toast(isNew ? "Запись создана" : "Изменения сохранены");
        for (const message of result.messages ?? []) toast(message);
        await options.onSaved?.(result);
      } catch (error) {
        reportError(error, form);
        saveButton.disabled = false;
      }
    });
  });
}

/**
 * Удалить запись: сначала показываем, что именно будет затронуто, потом удаляем.
 * @returns {Promise<boolean>} true, если запись удалена
 */
export async function deleteEntity(entityKey, row, lookup, options = {}) {
  const preview = await api.previewDelete(entityKey, row.id);
  if (!preview.allowed) {
    toast(preview.error, "error");
    return false;
  }

  const confirmed = await confirmDialog({
    title: "Удалить запись?",
    message:
      `«${describe(entityKey, row, lookup.db)}» будет удалена.` +
      (preview.messages?.length ? ` ${preview.messages.join(". ")}` : "") +
      " Действие нельзя отменить.",
    confirmText: "Удалить",
    danger: true,
  });
  if (!confirmed) return false;

  try {
    const result = await api.remove(entityKey, row.id);
    toast("Запись удалена");
    for (const message of result.messages ?? []) toast(message);
    await options.onDeleted?.(result);
    return true;
  } catch (error) {
    reportError(error);
    return false;
  }
}
