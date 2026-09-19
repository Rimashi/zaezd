export const ROLES = ["admin", "organizer"];

export const ROLE_LABEL = {
  admin: "Администратор",
  organizer: "Организатор",
};

export const ROLE_SUMMARY = {
  admin: "полный доступ к функциям первой версии",
  organizer: "работа с лошадьми, жокеями, командами и соревнованиями",
};

export function roleLabel(role) {
  if (ROLE_LABEL[role]) {
    return ROLE_LABEL[role];
  }
  return role || "—";
}
