import { authLogin, authLogout, authMe } from "./api.js";
import { canWrite, canView, accessFor } from "../data/permissions.js";

const GUEST_SESSION_KEY = "hippodrome.guest.v1";

let current = null;

function guestUser() {
  return {
    id: null,
    email: null,
    login: null,
    role: "public",
    is_guest: true,
  };
}

function rememberGuest(enabled) {
  try {
    if (enabled) {
      sessionStorage.setItem(GUEST_SESSION_KEY, "1");
    } else {
      sessionStorage.removeItem(GUEST_SESSION_KEY);
    }
  } catch {
    // Если sessionStorage недоступен, гостевой режим всё равно работает
    // до перезагрузки страницы.
  }
}

function guestWasSelected() {
  try {
    return sessionStorage.getItem(GUEST_SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

export async function restoreSession() {
  try {
    current = await authMe();
    rememberGuest(false);
    return current;
  } catch {
    // Отсутствие серверной сессии — нормальная ситуация для зрителя.
  }

  if (guestWasSelected()) {
    current = guestUser();
    return current;
  }

  current = null;
  return null;
}

export async function login(loginValue, password) {
  current = await authLogin(loginValue, password);
  rememberGuest(false);
  return current;
}

export function enterGuestMode() {
  current = guestUser();
  rememberGuest(true);
  return current;
}

export async function logout() {
  if (current && !current.is_guest) {
    try {
      await authLogout();
    } catch {
      // Даже если сервер недоступен, локальное состояние всё равно очищаем.
    }
  }

  current = null;
  rememberGuest(false);
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

export function isGuest() {
  return Boolean(current?.is_guest);
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
