/*
  Для первой версии роли специально сделаны простыми.
  Администратор может делать всё.
  Организатор может работать со спортивной частью, но не управляет users.
*/

export const PERMISSIONS = {
  admin: {
    users: "crud",
    horses: "crud",
    jockeys: "crud",
    teams: "crud",
    competitions: "crud",
    races: "crud",
    race_entries: "crud",
    results: "crud",
  },
  organizer: {
    users: "none",
    horses: "crud",
    jockeys: "crud",
    teams: "crud",
    competitions: "crud",
    races: "crud",
    race_entries: "crud",
    results: "crud",
  },
};

export function accessFor(role, entityKey) {
  if (!PERMISSIONS[role]) {
    return "none";
  }
  return PERMISSIONS[role][entityKey] || "none";
}

export function canView(role, entityKey) {
  return accessFor(role, entityKey) !== "none";
}

export function canWrite(role, entityKey) {
  return accessFor(role, entityKey) === "crud";
}

export function canUse(role, capability) {
  if (capability === "users") {
    return role === "admin";
  }
  return role === "admin" || role === "organizer";
}
