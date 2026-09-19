import { createCrudPage } from "../ui/crudPage.js";
import { go } from "../core/router.js";
import { currentUser } from "../core/session.js";
import { formatMoney, formatNumber } from "../core/format.js";

export async function renderCompetitions(root) {
  const page = createCrudPage("competitions", {
    initialSort: { field: "competition_date", dir: "desc" },
    defaults: () => ({ organizer_id: currentUser()?.id, status: "planned" }),
    hiddenFields: ["organizer_id"],
    onRowClick: (row) => go(`/competitions/${row.id}`),
    canEditRow: (row) => !["finished", "cancelled"].includes(row.status),
    canDeleteRow: (row, db) =>
      row.status === "planned" &&
      !db
        .getAll("races")
        .some((race) => Number(race.competition_id) === Number(row.id)),
    summary: (rows, db) => {
      const ids = new Set(rows.map((row) => Number(row.id)));
      const races = db
        .getAll("races")
        .filter((race) => ids.has(Number(race.competition_id))).length;
      const prize = rows.reduce(
        (sum, row) => sum + (Number(row.prize_fund) || 0),
        0,
      );
      return `заездов: ${formatNumber(races)} · общий призовой фонд: ${formatMoney(prize)}`;
    },
  });

  root.append(page.element);
  await page.reload();
}
