import { createCrudPage } from "../ui/crudPage.js";
import { go } from "../core/router.js";

export async function renderRaces(root) {
  const page = createCrudPage("races", {
    initialSort: { field: "race_number", dir: "asc" },
    defaults: { status: "planned" },
    filters: [
      {
        name: "competition_id",
        label: "Соревнование",
        allLabel: "Все соревнования",
        ref: "competitions",
      },
    ],
    onRowClick: (row) => go(`/competitions/${row.competition_id}`),
    canEditRow: (row, db) => {
      const competition = db.getById("competitions", row.competition_id);
      return (
        !["finished", "cancelled"].includes(row.status) &&
        !["finished", "cancelled"].includes(competition?.status)
      );
    },
    canDeleteRow: (row, db) => {
      const competition = db.getById("competitions", row.competition_id);
      return (
        row.status === "planned" &&
        !["finished", "cancelled"].includes(competition?.status)
      );
    },
    summary: (rows, db) => {
      const entries = db.getAll("race_entries");
      const withEntries = rows.filter((race) =>
        entries.some((entry) => Number(entry.race_id) === Number(race.id)),
      ).length;
      return `с участниками: ${withEntries} из ${rows.length}`;
    },
  });

  root.append(page.element);
  await page.reload();
}
