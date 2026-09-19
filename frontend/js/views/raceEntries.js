import { createCrudPage } from "../ui/crudPage.js";
import { describe } from "../data/schema.js";
import { go } from "../core/router.js";

export async function renderRaceEntries(root) {
  const page = createCrudPage("race_entries", {
    defaults: { status: "registered" },
    disableDelete: true,
    filters: [
      {
        name: "race_id",
        label: "Заезд",
        allLabel: "Все заезды",
        optionsFrom: (db) =>
          db
            .getAll("races")
            .slice()
            .sort(
              (a, b) =>
                Number(a.competition_id) - Number(b.competition_id) ||
                Number(a.race_number) - Number(b.race_number),
            )
            .map((race) => ({
              value: String(race.id),
              label: describe("races", race, db),
            })),
      },
    ],
    canEditRow: (row, db) => {
      const race = db.getById("races", row.race_id);
      const competition = race
        ? db.getById("competitions", race.competition_id)
        : null;
      return (
        race?.status === "planned" &&
        !["finished", "cancelled"].includes(competition?.status)
      );
    },
    onRowClick: (row, db) => {
      const race = db.getById("races", row.race_id);
      if (race) go(`/competitions/${race.competition_id}`);
    },
    summary: (rows, db) => {
      const results = db.getAll("results");
      const withResult = rows.filter((row) =>
        results.some(
          (result) => Number(result.race_entry_id) === Number(row.id),
        ),
      ).length;
      const withdrawn = rows.filter((row) => row.status === "withdrawn").length;
      return `с результатом: ${withResult} · снято: ${withdrawn}`;
    },
  });

  root.append(page.element);
  await page.reload();
}
