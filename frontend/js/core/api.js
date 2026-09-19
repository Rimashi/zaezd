/*
  Небольшой клиент для HTTP API.
  Никакого демо-режима и localStorage-базы здесь больше нет.
*/

export const REST_BASE_URL = "/api";

export class DomainError extends Error {
  constructor(message, fields = null) {
    super(message);
    this.name = "DomainError";
    this.fields = fields;
  }
}

const API_PATHS = {
  race_entries: "race-entries",
};

function apiPath(entity) {
  if (API_PATHS[entity]) {
    return API_PATHS[entity];
  }
  return entity;
}

async function request(method, path, body) {
  let response;

  try {
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "same-origin",
    };

    if (body !== undefined) {
      options.body = JSON.stringify(body);
    }

    response = await fetch(REST_BASE_URL + path, options);
  } catch (error) {
    throw new DomainError(`Сервер недоступен: ${error.message}`);
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    let message = `Ошибка ${response.status}`;
    let fields = null;

    if (payload && payload.error) {
      message = payload.error;
    }
    if (payload && payload.fields) {
      fields = payload.fields;
    }

    throw new DomainError(message, fields);
  }

  return payload;
}

export const api = {
  async list(entity) {
    return request("GET", `/${apiPath(entity)}`);
  },

  async get(entity, id) {
    return request("GET", `/${apiPath(entity)}/${id}`);
  },

  async create(entity, values) {
    const row = await request("POST", `/${apiPath(entity)}`, values);
    return { row, messages: [] };
  },

  async update(entity, id, values) {
    const row = await request("PATCH", `/${apiPath(entity)}/${id}`, values);
    return { row, messages: [] };
  },

  async remove(entity, id) {
    const result = await request("DELETE", `/${apiPath(entity)}/${id}`);
    return {
      messages: result && result.messages ? result.messages : [],
    };
  },

  async previewDelete() {
    return { allowed: true, messages: [] };
  },

  async counts() {
    const entityNames = [
      "users",
      "horses",
      "jockeys",
      "teams",
      "competitions",
      "races",
      "race_entries",
      "results",
    ];

    const result = {};

    for (const entity of entityNames) {
      try {
        const rows = await request("GET", `/${apiPath(entity)}`);
        result[entity] = rows.length;
      } catch {
        result[entity] = undefined;
      }
    }

    return result;
  },

  onDataChange() {
    return function unsubscribe() {};
  },
};

export async function authLogin(login, password) {
  return request("POST", "/auth/login", { login, password });
}

export async function authLogout() {
  return request("POST", "/auth/logout");
}

export async function authMe() {
  return request("GET", "/auth/me");
}
