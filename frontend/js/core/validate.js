/* ============================================================================
   Проверка значений формы.

   Правила описаны прямо в схеме сущности (см. js/data/schema.js),
   поэтому отдельного кода под каждую форму писать не нужно.
   ========================================================================== */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Проверить набор значений по описанию полей.
 * @returns {object} объект вида { имяПоля: 'текст ошибки' }; пустой объект — всё хорошо
 */
export function validateFields(fields, values) {
  const errors = {};

  for (const field of fields) {
    const raw = values[field.name];
    const value = typeof raw === "string" ? raw.trim() : raw;
    const empty = value === "" || value === null || value === undefined;

    if (empty) {
      if (field.required) errors[field.name] = "Обязательное поле";
      continue;
    }

    if (field.type === "number") {
      const number = Number(value);
      if (Number.isNaN(number)) {
        errors[field.name] = "Должно быть числом";
        continue;
      }
      if (field.min !== undefined && number < field.min)
        errors[field.name] = `Минимум ${field.min}`;
      if (field.max !== undefined && number > field.max)
        errors[field.name] = `Максимум ${field.max}`;
    }

    if (field.type === "email" && !EMAIL_RE.test(String(value))) {
      errors[field.name] = "Некорректный e-mail";
    }

    if (field.type === "date" && Number.isNaN(Date.parse(value))) {
      errors[field.name] = "Некорректная дата";
    }
  }

  return errors;
}

/**
 * Привести значения формы к нужным типам перед сохранением:
 * числа — к Number, пустые строки — к null, чтобы в данных не было «мусора».
 */
export function castValues(fields, values) {
  const result = {};

  for (const field of fields) {
    let value = values[field.name];
    if (typeof value === "string") value = value.trim();
    if (value === undefined) continue;

    if (value === "") {
      result[field.name] = null;
    } else if (field.type === "number") {
      result[field.name] = Number(value);
    } else {
      result[field.name] = value;
    }
  }

  return result;
}
