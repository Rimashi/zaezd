/* ============================================================================
   Форма, собранная из описания сущности.

   Ни одна форма не написана руками: все строятся по полям из
   js/data/schema.js. Добавили поле в схему — оно появилось и в таблице,
   и в форме, и в проверках.

   Пример:
     const form = await buildForm('teams', row, { optionsFor });
     form.element                 // узел <form>
     form.validate()              // { valid, values, errors }
     form.showErrors(domainFields) // подсветить поля из ошибки сервера/правил
   ========================================================================== */

import { el } from "../core/dom.js";
import { entities } from "../data/schema.js";
import { validateFields, castValues } from "../core/validate.js";

/**
 * @param {string} entityKey
 * @param {object} values — начальные значения (для правки — существующая запись)
 * @param {object} config — { optionsFor(refKey) → [{value,label}], hiddenFields: ['имяПоля'] }
 */
export async function buildForm(entityKey, values = {}, config = {}) {
  const entity = entities[entityKey];
  const optionsFor = config.optionsFor ?? (() => []);
  const hiddenFields = config.hiddenFields ?? [];

  const form = el("form", {
    class: "form-grid",
    novalidate: true,
    onsubmit: (event) => event.preventDefault(),
  });
  const controls = new Map();

  for (const field of entity.fields) {
    const control = buildControl(field, values[field.name], optionsFor);
    controls.set(field.name, control);
    // Поле может быть скрыто (например, ссылка на заезд, известная заранее):
    // значение всё равно отправляется на проверку и сохранение.
    if (hiddenFields.includes(field.name)) control.wrapper.hidden = true;
    form.append(control.wrapper);
  }

  return {
    element: form,

    readValues() {
      const result = {};
      for (const [name, control] of controls) result[name] = control.get();
      return result;
    },

    /** Проверить форму на стороне клиента: те же правила, что и в js/core/validate.js. */
    validate() {
      const raw = this.readValues();
      const errors = validateFields(entity.fields, raw);
      for (const [name, control] of controls) control.setError(errors[name]);
      return {
        valid: Object.keys(errors).length === 0,
        values: castValues(entity.fields, raw),
        errors,
      };
    },

    /** Показать ошибки, которые вернули правила предметной области. */
    showErrors(fields) {
      if (!fields) return false;
      let shown = false;
      for (const [name, control] of controls) {
        if (fields[name]) {
          control.setError(fields[name]);
          shown = true;
        }
      }
      return shown;
    },
  };
}

/* ------------------------------------------------------------------ поля */

function buildControl(field, value, optionsFor) {
  const inputId = `field-${field.name}-${Math.random().toString(36).slice(2, 7)}`;

  const label = el("label", { for: inputId }, [
    field.label,
    field.required ? el("span", { class: "req", text: " *" }) : null,
  ]);

  const errorNode = el("div", { class: "error", hidden: true });
  const input = createInput(field, inputId, value);

  if (input.tagName === "SELECT") fillOptions(input, field, value, optionsFor);

  const wrapper = el(
    "div",
    {
      class: ["field", field.span === 2 ? "span-2" : ""]
        .filter(Boolean)
        .join(" "),
    },
    [
      label,
      input,
      field.hint ? el("div", { class: "hint", text: field.hint }) : null,
      errorNode,
    ],
  );

  const clear = () => setError(null);
  input.addEventListener("input", clear);
  input.addEventListener("change", clear);

  function setError(message) {
    wrapper.classList.toggle("has-error", Boolean(message));
    errorNode.textContent = message ?? "";
    errorNode.hidden = !message;
  }

  return { wrapper, input, get: () => input.value, setError };
}

function createInput(field, inputId, value) {
  if (field.type === "textarea") {
    const textarea = el("textarea", { id: inputId, rows: 3 });
    if (field.placeholder) textarea.placeholder = field.placeholder;
    textarea.value = value ?? "";
    return textarea;
  }

  if (
    field.type === "select" ||
    field.type === "status" ||
    field.type === "password"
  ) {
    if (field.type === "password") {
      const input = el("input", {
        id: inputId,
        type: "password",
        autocomplete: "new-password",
      });
      if (field.placeholder) input.placeholder = field.placeholder;
      input.value = value ?? "";
      return input;
    }
    return el("select", { id: inputId });
  }

  const types = {
    number: "number",
    date: "date",
    time: "time",
    email: "email",
  };
  const input = el("input", { id: inputId, type: types[field.type] ?? "text" });
  if (field.placeholder) input.placeholder = field.placeholder;
  if (field.min !== undefined) input.setAttribute("min", field.min);
  if (field.max !== undefined) input.setAttribute("max", field.max);
  input.value = value ?? "";
  return input;
}

/** Наполнить <select>: вариантами справочника (ref) или списком значений (options). */
function fillOptions(input, field, value, optionsFor) {
  const variants = field.ref
    ? optionsFor(field.ref)
    : (field.options ?? []).map((option) =>
        typeof option === "object" ? option : { value: option, label: option },
      );

  const placeholder = field.ref
    ? "— не выбрано —"
    : field.required
      ? "— выберите —"
      : "— не указано —";
  input.append(el("option", { value: "", text: placeholder }));

  for (const variant of variants) {
    input.append(
      el("option", { value: String(variant.value), text: variant.label }),
    );
  }

  input.value = value === null || value === undefined ? "" : String(value);
}
