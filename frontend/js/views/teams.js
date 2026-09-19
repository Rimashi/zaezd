import { createCrudPage } from "../ui/crudPage.js";

export async function renderTeams(root) {
  const page = createCrudPage("teams", {
    summary: (rows, db) => {
      const entries = db.getAll("race_entries");
      const used = rows.filter((team) =>
        entries.some((entry) => Number(entry.team_id) === Number(team.id)),
      ).length;
      return `использовались в заездах: ${used} из ${rows.length}`;
    },
  });
  root.append(page.element);
  await page.reload();
}
