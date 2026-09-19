/* ============================================================================
   Справочник загруженных данных для интерфейса.

   Нужен, чтобы в таблицах и выпадающих списках показывать не идентификаторы,
   а понятные названия: «Кубок Москвы · заезд №2», «№3 · Аргумент / Лунёв».
   Набор методов совпадает с тем, что правила получают от хранилища (db),
   поэтому подписи формируются одной и той же функцией describe().
   ========================================================================== */

import { api } from "../core/api.js";
import { describe, entities } from "../data/schema.js";

const ALL_ENTITIES = Object.keys(entities);

/**
 * Загрузить справочники и вернуть объект с готовыми подписями.
 * Недоступные текущей роли сущности (например, пользователи для зрителя)
 * просто остаются пустыми — интерфейс из-за этого не падает.
 */
export async function loadLookup(entityKeys = ALL_ENTITIES) {
  const data = new Map();

  for (const key of entityKeys) {
    try {
      data.set(key, await api.list(key));
    } catch {
      data.set(key, []);
    }
  }

  const db = {
    getAll: (entity) => data.get(entity) ?? [],
    getById: (entity, id) =>
      (data.get(entity) ?? []).find((row) => String(row.id) === String(id)) ??
      null,
    label: (entity, id) => describe(entity, db.getById(entity, id), db),
  };

  return {
    /** Доступ к данным — передаётся в правила и в describe(). */
    db,

    /** Подпись записи: describe(entity, row, db). */
    label: (entityKey, row) => describe(entityKey, row, db),

    /** Варианты для выпадающего списка: [{ value, label }]. */
    optionsFor(entityKey) {
      return (data.get(entityKey) ?? []).map((row) => ({
        value: String(row.id),
        label: describe(entityKey, row, db),
      }));
    },

    /** Прямой доступ к массиву записей (для сводок и фильтров). */
    rows(entityKey) {
      return data.get(entityKey) ?? [];
    },
  };
}
