import { createCrudPage } from "../ui/crudPage.js";
import { roleOptions } from "../data/schema.js";

export async function renderUsers(root) {
  const page = createCrudPage("users", {
    filters: [
      {
        name: "role",
        label: "Роль",
        allLabel: "Все роли",
        optionsFrom: () => roleOptions,
      },
    ],
    summary: (rows) =>
      `администраторов: ${rows.filter((user) => user.role === "admin").length}`,
  });
  root.append(page.element);
  await page.reload();
}
