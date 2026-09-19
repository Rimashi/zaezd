import { createCrudPage } from "../ui/crudPage.js";
import { describe } from "../data/schema.js";
import { go } from "../core/router.js";

const raceOf = (row, db) => {
  const entry = db.getById("race_entries", row.race_entry_id);
  return entry ? db.getById("races", entry.race_id) : null;
};

export async function renderResults(root) {
  const page = createCrudPage("results", {
    defaults: { status: "finished" },
    initialSort: { field: "position", dir: "asc" },
    filters: [
      {
        name: "competition_id",
        label: "Соревнование",
        allLabel: "Все соревнования",
        optionsFrom: (db) =>
          db
            .getAll("competitions")
            .map((row) => ({ value: String(row.id), label: row.name })),
        value: (row, db) => raceOf(row, db)?.competition_id,
      },
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
        value: (row, db) => raceOf(row, db)?.id,
      },
    ],
    canEditRow: (row, db) => {
      const race = raceOf(row, db);
      const competition = race
        ? db.getById("competitions", race.competition_id)
        : null;
      return (
        race?.status === "finished" && competition?.status === "in_progress"
      );
    },
    canDeleteRow: (row, db) => {
      const race = raceOf(row, db);
      const competition = race
        ? db.getById("competitions", race.competition_id)
        : null;
      return (
        race?.status === "finished" && competition?.status === "in_progress"
      );
    },
    onRowClick: (row, db) => {
      const race = raceOf(row, db);
      if (race) go(`/competitions/${race.competition_id}`);
    },
  });

  root.append(page.element);
  await page.reload();
}
