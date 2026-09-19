import { createCrudPage } from "../ui/crudPage.js";

export async function renderJockeys(root) {
  const page = createCrudPage("jockeys", {
    defaults: { status: "active" },
  });
  root.append(page.element);
  await page.reload();
}
