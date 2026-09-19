import { createCrudPage } from "../ui/crudPage.js";

export async function renderHorses(root) {
  const page = createCrudPage("horses", {
    defaults: { status: "active" },
  });
  root.append(page.element);
  await page.reload();
}
