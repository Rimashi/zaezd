/* ============================================================================
   Универсальная таблица списка.

   Колонки берутся из описания сущности. Таблица поддерживает сортировку,
   кликабельную строку для перехода к подробностям и отдельные кнопки CRUD.
   ========================================================================== */

import { el } from "../core/dom.js";
import { icon } from "./icons.js";
import {
  entities,
  describe,
  toneFor,
  labelForOptions,
} from "../data/schema.js";
import {
  formatDate,
  formatMoney,
  formatNumber,
  formatWeight,
  formatDistance,
  formatDurationMs,
} from "../core/format.js";

/**
 * @param {object} config
 * @param {string} config.entityKey
 * @param {Array}  config.rows
 * @param {{field:string,dir:'asc'|'desc'}} config.sort
 * @param {Function} config.onSort
 * @param {Function} [config.onRowClick] — переход/открытие по клику на строку
 * @param {Function} [config.onEdit]
 * @param {Function} [config.onDelete]
 * @param {Array}    [config.rowActions] — дополнительные действия (если нужны)
 * @param {object}   [config.db]
 * @param {string}   [config.emptyMessage]
 */
export function renderTable(config) {
  const {
    entityKey,
    rows,
    sort,
    onSort,
    onRowClick,
    onEdit,
    onDelete,
    canEditRow = null,
    canDeleteRow = null,
    rowActions = [],
    db,
    emptyMessage,
  } = config;
  const entity = entities[entityKey];
  const columns = entity.fields.filter(
    (field) => field.inTable && field.type !== "password",
  );

  if (!rows.length) return renderEmpty(entity, emptyMessage);

  const hasActions = Boolean(
    rowActions.length ||
    rows.some(
      (row) =>
        (onEdit && (!canEditRow || canEditRow(row))) ||
        (onDelete && (!canDeleteRow || canDeleteRow(row))),
    ),
  );

  const head = el("tr", {}, [
    ...columns.map((column) => headerCell(column, sort, onSort)),
    hasActions
      ? el("th", { class: "no-sort", "aria-label": "Действия" })
      : null,
  ]);

  const body = el(
    "tbody",
    {},
    rows.map((row) =>
      rowNode({
        columns,
        row,
        onRowClick,
        onEdit,
        onDelete,
        canEditRow,
        canDeleteRow,
        rowActions,
        db,
        hasActions,
      }),
    ),
  );

  const mobileSort = el("div", { class: "mobile-table-sort" }, [
    el("label", { class: "mobile-sort-field" }, [
      el("span", { text: "Сортировка" }),
      el(
        "select",
        {
          "aria-label": "Поле сортировки",
          onchange: (event) => onSort(event.target.value),
        },
        columns.map((column) =>
          el("option", {
            value: column.name,
            text: column.label,
            selected: sort.field === column.name,
          }),
        ),
      ),
    ]),
    el(
      "button",
      {
        class: "btn btn-icon mobile-sort-direction",
        type: "button",
        title: sort.dir === "asc" ? "По возрастанию" : "По убыванию",
        "aria-label":
          sort.dir === "asc"
            ? "Сортировка по возрастанию"
            : "Сортировка по убыванию",
        onclick: () => onSort(sort.field),
      },
      [icon(sort.dir === "asc" ? "arrowUp" : "arrowDown")],
    ),
  ]);

  return el("div", { class: "table-wrap" }, [
    mobileSort,
    el("div", { class: "table-scroll" }, [
      el("table", {}, [el("thead", {}, [head]), body]),
    ]),
  ]);
}

export function renderEmpty(entity, message) {
  return el("div", { class: "table-wrap" }, [
    el("div", { class: "empty" }, [
      icon("empty"),
      el("strong", {
        text: message ?? `В разделе «${entity.title}» пока ничего нет`,
      }),
      el("span", {
        class: "small",
        text: "Данные появятся, когда их добавят пользователи с соответствующими правами",
      }),
    ]),
  ]);
}

/* ------------------------------------------------------------------ строки */

function headerCell(column, sort, onSort) {
  const isSorted = sort.field === column.name;
  return el(
    "th",
    {
      class: isSorted ? "is-sorted" : "",
      title: "Сортировать",
      onclick: () => onSort(column.name),
    },
    [
      el("span", { text: column.label }),
      el("span", {
        class: "sort-mark",
        text: isSorted ? (sort.dir === "asc" ? "↑" : "↓") : "↕",
      }),
    ],
  );
}

function rowNode({
  columns,
  row,
  onRowClick,
  onEdit,
  onDelete,
  canEditRow,
  canDeleteRow,
  rowActions,
  db,
  hasActions,
}) {
  const cells = columns.map((column) => cellNode(column, row, db));
  const attrs = {};

  if (onRowClick) {
    attrs.class = "is-clickable";
    attrs.tabindex = "0";
    attrs.title = "Открыть";
    attrs.onclick = (event) => {
      if (isInteractiveTarget(event.target)) return;
      onRowClick(row);
    };
    attrs.onkeydown = (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      if (
        isInteractiveTarget(event.target) &&
        event.target !== event.currentTarget
      )
        return;
      event.preventDefault();
      onRowClick(row);
    };
  }

  if (!hasActions) return el("tr", attrs, cells);

  const buttons = [];
  for (const action of rowActions) {
    buttons.push(
      el(
        "button",
        {
          class: "btn btn-icon",
          type: "button",
          title: action.title,
          onclick: (event) => {
            event.stopPropagation();
            action.onClick(row);
          },
        },
        [icon(action.icon ?? "open")],
      ),
    );
  }
  if (onEdit && (!canEditRow || canEditRow(row))) {
    buttons.push(
      el(
        "button",
        {
          class: "btn btn-icon",
          type: "button",
          title: "Изменить",
          onclick: (event) => {
            event.stopPropagation();
            onEdit(row);
          },
        },
        [icon("edit")],
      ),
    );
  }
  if (onDelete && (!canDeleteRow || canDeleteRow(row))) {
    buttons.push(
      el(
        "button",
        {
          class: "btn btn-icon",
          type: "button",
          title: "Удалить",
          onclick: (event) => {
            event.stopPropagation();
            onDelete(row);
          },
        },
        [icon("trash")],
      ),
    );
  }

  return el("tr", attrs, [
    ...cells,
    el("td", { class: "actions", dataset: { label: "Действия" } }, [
      el("div", { class: "row-actions" }, buttons),
    ]),
  ]);
}

function isInteractiveTarget(target) {
  return (
    target instanceof Element &&
    Boolean(target.closest("button, a, input, select, textarea, label"))
  );
}

function cellNode(column, row, db) {
  const value = row[column.name];
  const td = el("td", {
    class: column.primary ? "cell-primary" : "",
    dataset: { label: column.label },
  });

  if (column.ref) {
    const target = db?.getById(column.ref, value);
    td.textContent = target ? describe(column.ref, target, db) : "—";
    return td;
  }

  if (column.type === "status") {
    td.append(
      el("span", {
        class: `badge ${toneFor(value)}`,
        text: labelForOptions(column.options, value),
      }),
    );
    return td;
  }

  if (column.format === "place") {
    if (value === null || value === undefined || value === "") {
      td.textContent = "—";
      return td;
    }
    const medal = Number(value) <= 3 ? ` place-${value}` : "";
    td.append(el("span", { class: `place${medal}`, text: String(value) }));
    return td;
  }

  td.textContent = formatValue(column, value);
  return td;
}

function formatValue(column, value) {
  if (value === null || value === undefined || value === "") return "—";

  switch (column.format) {
    case "money":
      return formatMoney(value);
    case "distance":
      return formatDistance(value);
    case "weight":
      return formatWeight(value);
    case "duration_ms":
      return formatDurationMs(value);
    default:
      break;
  }

  if ((column.type === "select" || column.type === "status") && column.options)
    return labelForOptions(column.options, value);
  if (column.type === "date") return formatDate(value);
  if (column.type === "password") return "••••••";
  return String(value);
}

export { formatNumber };
