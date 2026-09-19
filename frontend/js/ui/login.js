import { el } from "../core/dom.js";
import { icon } from "./icons.js";
import { login } from "../core/session.js";

export function renderLogin(root, { onSuccess }) {
  const errorNode = el("div", { class: "login-error", hidden: true });
  const loginInput = el("input", {
    type: "text",
    id: "login-input",
    placeholder: "admin",
    autocomplete: "username",
  });
  const passwordInput = el("input", {
    type: "password",
    id: "password-input",
    placeholder: "••••••",
    autocomplete: "current-password",
  });
  const submitButton = el(
    "button",
    {
      class: "btn btn-primary login-submit",
      type: "submit",
    },
    [icon("lock"), el("span", { text: "Войти" })],
  );

  const form = el("form", { class: "login-form", onsubmit: handleSubmit }, [
    el("div", { class: "field" }, [
      el("label", { for: "login-input", text: "Логин" }),
      loginInput,
    ]),
    el("div", { class: "field" }, [
      el("label", { for: "password-input", text: "Пароль" }),
      passwordInput,
    ]),
    errorNode,
    submitButton,
  ]);

  async function handleSubmit(event) {
    event.preventDefault();
    errorNode.hidden = true;
    submitButton.disabled = true;

    try {
      await login(loginInput.value, passwordInput.value);
      onSuccess();
    } catch (error) {
      errorNode.textContent = String(
        error && error.message ? error.message : error,
      );
      errorNode.hidden = false;
    } finally {
      submitButton.disabled = false;
    }
  }

  root.replaceChildren(
    el("div", { class: "login-screen" }, [
      el("div", { class: "login-card" }, [
        el("div", { class: "login-brand" }, [
          el("div", { class: "brand-mark" }, [icon("horses")]),
          el("div", {}, [
            el("h1", { text: "Ипподром" }),
            el("div", {
              class: "muted small",
              text: "информационная система управления соревнованиями по скачкам",
            }),
          ]),
        ]),
        form,
        el("div", { class: "login-hint" }, [
          el("div", {
            class: "small muted",
            text: "Учётная запись администратора создаётся автоматически при первом запуске. Логин и пароль задаются в .env.",
          }),
        ]),
      ]),
    ]),
  );

  loginInput.focus();
}
