/* ============================================================================
   Страница-список для сущности: поиск, фильтры, сортировка, таблица и действия
   над строками.

   Это общий «движок» для разделов приложения: файлы разделов (js/views/*.js)
   почти пустые, потому что типовая логика живёт здесь.

   Учитывает роль пользователя: если у роли нет прав на изменение раздела,
   кнопки создания и правки не показываются, а вместо них появляется пояснение.

   Пример:
     const page = createCrudPage('teams', { filters: [...], rowActions: [...] });
     root.append(page.element);
     await page.reload();
   ========================================================================== */

import { el } from "../core/dom.js";
import { icon } from "./icons.js";
import { api } from "../core/api.js";
import { entities } from "../data/schema.js";
import { canWriteSection, currentUser } from "../core/session.js";
import { roleLabel } from "./roles.js";
import { loadLookup } from "./lookup.js";
import { renderTable } from "./table.js";
import { openEntityForm, deleteEntity } from "./entityActions.js";
import { plural } from "../core/format.js";

/**
 * @param {string} entityKey
 * @param {object} [options]
 * @param {Array}  [options.filters] — { name, label, allLabel, ref | values | optionsFrom(db), value(row, db) }
 * @param {Function} [options.onRowClick] — клик по строке: onRowClick(row, db)
 * @param {Array}  [options.rowActions] — редкие дополнительные кнопки строки
 * @param {object} [options.initialSort]
 * @param {object} [options.defaults] — значения по умолчанию для новой записи
 * @param {Function} [options.summary] — доп. текст под таблицей: summary(rows, db) → string
 * @param {boolean} [options.forceReadOnly] — раздел только для просмотра независимо от роли
 */
export function createCrudPage(entityKey, options = {}) {
  const entity = entities[entityKey];

  const element = el("div", { class: "section" });
  const tableHost = el("div");

  let lookup = null;
  let writable = false;
  let toolbarBuilt = false;

  const state = {
    rows: [],
    search: "",
    filters: {},
    sort: options.initialSort ?? {
      field: entity.fields.find((field) => field.primary)?.name ?? "id",
      dir: "asc",
    },
  };

  /* ------------------------------------------------------------- панель */

  function buildToolbar() {
    const parts = [];

    if ((entity.searchFields ?? []).length) {
      parts.push(
        el("div", { class: "search" }, [
          icon("search"),
          el("input", {
            type: "search",
            placeholder: `Поиск по разделу «${entity.title}»`,
            oninput: (event) => {
              state.search = event.target.value.trim().toLowerCase();
              renderRows();
            },
          }),
        ]),
      );
    }

    for (const filter of options.filters ?? []) {
      const select = el("select", {
        class: "filter-select",
        title: filter.label,
        "aria-label": filter.label,
        onchange: (event) => {
          state.filters[filter.name] = event.target.value;
          renderRows();
        },
      });

      select.append(el("option", { value: "", text: filter.allLabel }));
      const variants = filter.ref
        ? lookup.optionsFor(filter.ref)
        : filter.optionsFrom
          ? filter.optionsFrom(lookup.db)
          : (filter.values ?? []).map((value) => ({ value, label: value }));
      for (const variant of variants)
        select.append(
          el("option", { value: String(variant.value), text: variant.label }),
        );

      parts.push(select);
    }

    parts.push(el("span", { class: "spacer" }));

    if (writable) {
      parts.push(
        el(
          "button",
          {
            class: "btn btn-primary",
            type: "button",
            onclick: () =>
              openEntityForm(entityKey, null, lookup, {
                defaults:
                  typeof options.defaults === "function"
                    ? options.defaults()
                    : options.defaults,
                hiddenFields: options.hiddenFields ?? [],
                onSaved: reload,
              }),
          },
          [icon("plus"), entity.addLabel],
        ),
      );
    } else {
      parts.push(
        el("div", { class: "readonly-note" }, [
          icon("eye"),
          el("span", {
            text: `Только просмотр: «${roleLabel(currentUser()?.role)}» не может изменять раздел`,
          }),
        ]),
      );
    }

    element.append(el("div", { class: "toolbar" }, parts));
    element.append(tableHost);
    toolbarBuilt = true;
  }

  /* ----------------------------------------------------------- выборка */

  function visibleRows() {
    const query = state.search;

    const rows = state.rows.filter((row) => {
      const matchesSearch =
        !query ||
        (entity.searchFields ?? []).some((field) =>
          String(row[field] ?? "")
            .toLowerCase()
            .includes(query),
        );
      if (!matchesSearch) return false;

      return (options.filters ?? []).every((filter) => {
        const selected = state.filters[filter.name];
        if (!selected) return true;
        const value = filter.value
          ? filter.value(row, lookup.db)
          : row[filter.name];
        return String(value ?? "") === String(selected);
      });
    });

    const direction = state.sort.dir === "asc" ? 1 : -1;
    const field = entity.fields.find((item) => item.name === state.sort.field);

    return [...rows].sort((a, b) => {
      const left = a[state.sort.field];
      const right = b[state.sort.field];
      if (field?.type === "number" || field?.format === "money") {
        return ((Number(left) || 0) - (Number(right) || 0)) * direction;
      }
      return (
        String(left ?? "").localeCompare(String(right ?? ""), "ru") * direction
      );
    });
  }

  function renderRows() {
    const rows = visibleRows();

    const table = renderTable({
      entityKey,
      rows,
      sort: state.sort,
      db: lookup.db,
      onSort: (fieldName) => {
        state.sort =
          state.sort.field === fieldName
            ? {
                field: fieldName,
                dir: state.sort.dir === "asc" ? "desc" : "asc",
              }
            : { field: fieldName, dir: "asc" };
        renderRows();
      },
      onRowClick: options.onRowClick
        ? (row) => options.onRowClick(row, lookup.db)
        : null,
      onEdit:
        writable && !options.disableEdit
          ? (row) =>
              openEntityForm(entityKey, row, lookup, {
                hiddenFields: options.hiddenFields ?? [],
                onSaved: reload,
              })
          : null,
      onDelete:
        writable && !options.disableDelete
          ? (row) => deleteEntity(entityKey, row, lookup, { onDeleted: reload })
          : null,
      canEditRow: options.canEditRow
        ? (row) => options.canEditRow(row, lookup.db)
        : null,
      canDeleteRow: options.canDeleteRow
        ? (row) => options.canDeleteRow(row, lookup.db)
        : null,
      rowActions: (options.rowActions ?? []).map((action) => ({
        title: action.title,
        icon: action.icon,
        onClick: (row) => action.onClick(row, lookup.db),
      })),
      emptyMessage: state.rows.length
        ? "Ничего не найдено по заданным условиям"
        : undefined,
    });

    const total = state.rows.length;
    const footParts = [
      `Показано ${rows.length} из ${total} ${plural(total, ["записи", "записей", "записей"])}`,
    ];
    if (typeof options.summary === "function") {
      const extra = options.summary(rows, lookup.db);
      if (extra) footParts.push(extra);
    }
    table.append(
      el("div", { class: "table-foot" }, [
        el("span", { text: footParts.join(" · ") }),
      ]),
    );

    tableHost.replaceChildren(table);
  }

  /* ------------------------------------------------------------ загрузка */

  async function reload() {
    lookup = await loadLookup();
    writable = !options.forceReadOnly && canWriteSection(entityKey);
    if (!toolbarBuilt) buildToolbar();

    try {
      state.rows = await api.list(entityKey);
    } catch (error) {
      tableHost.replaceChildren(
        el("div", {
          class: "error-panel",
          text: String(error?.message ?? error),
        }),
      );
      return;
    }
    renderRows();
  }

  return { element, reload };
}
