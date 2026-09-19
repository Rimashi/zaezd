import { restoreSession } from "./core/session.js";
import { renderShell } from "./ui/layout.js";
import { renderLogin } from "./ui/login.js";
import { defineRoutes, startRouter } from "./core/router.js";
import { routes } from "./views/index.js";
import { el } from "./core/dom.js";

const appRoot = document.getElementById("app");

async function bootstrap() {
  const user = await restoreSession();

  if (!user) {
    renderLogin(appRoot, { onSuccess: bootApplication });
    return;
  }

  bootApplication();
}

function bootApplication() {
  const shell = renderShell(appRoot);
  defineRoutes(routes, shell);
  startRouter();
}

bootstrap().catch((error) => {
  console.error(error);

  appRoot.replaceChildren(
    el("div", { class: "error-panel", style: "margin:24px" }, [
      el("strong", { text: "Приложение не запустилось" }),
      el("div", {
        text: String(error && error.message ? error.message : error),
      }),
    ]),
  );
});
