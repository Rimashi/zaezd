import { authLogin, authLogout, authMe } from "./api.js";
import { canWrite, canView, accessFor } from "../data/permissions.js";

let current = null;

export async function restoreSession() {
  try {
    current = await authMe();
  } catch {
    current = null;
  }

  return current;
}

export async function login(loginValue, password) {
  current = await authLogin(loginValue, password);
  return current;
}

export async function logout() {
  try {
    await authLogout();
  } finally {
    current = null;
  }
}

export function currentUser() {
  return current;
}

export function currentRole() {
  if (!current) {
    return null;
  }
  return current.role;
}

export function accessTo(entityKey) {
  if (!current) {
    return "none";
  }
  return accessFor(current.role, entityKey);
}

export function canViewSection(entityKey) {
  if (!current) {
    return false;
  }
  return canView(current.role, entityKey);
}

export function canWriteSection(entityKey) {
  if (!current) {
    return false;
  }
  return canWrite(current.role, entityKey);
}
