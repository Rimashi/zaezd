import { el } from "../core/dom.js";
import { icon } from "../ui/icons.js";
import { loadLookup } from "../ui/lookup.js";
import { currentUser } from "../core/session.js";
import {
  describe,
  jockeyFullName,
  labelForOptions,
  resultStatusOptions,
} from "../data/schema.js";
import {
  formatDate,
  formatDateParts,
  formatMoney,
  formatNumber,
  formatDurationMs,
  plural,
} from "../core/format.js";
import { roleLabel } from "../ui/roles.js";

export async function renderDashboard(root) {
  const lookup = await loadLookup();
  const user = currentUser();

  const competitions = lookup.rows("competitions");
  const races = lookup.rows("races");
  const teams = lookup.rows("teams");
  const horses = lookup.rows("horses");
  const jockeys = lookup.rows("jockeys");
  const entries = lookup.rows("race_entries");
  const results = lookup.rows("results");

  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const upcoming = competitions
    .filter(
      (competition) =>
        competition.status === "planned" &&
        competition.competition_date >= today,
    )
    .sort((a, b) =>
      String(a.competition_date).localeCompare(String(b.competition_date)),
    )
    .slice(0, 5);

  const latestResults = results
    .map((result) => {
      const entry = lookup.db.getById("race_entries", result.race_entry_id);
      const race = entry ? lookup.db.getById("races", entry.race_id) : null;
      const team = entry ? lookup.db.getById("teams", entry.team_id) : null;
      return {
        result,
        entry,
        race,
        team,
        competition: race
          ? lookup.db.getById("competitions", race.competition_id)
          : null,
        horse: team ? lookup.db.getById("horses", team.horse_id) : null,
        jockey: team ? lookup.db.getById("jockeys", team.jockey_id) : null,
      };
    })
    .sort(
      (a, b) =>
        String(b.competition?.competition_date ?? "").localeCompare(
          String(a.competition?.competition_date ?? ""),
        ) ||
        Number(a.result.position ?? 999) - Number(b.result.position ?? 999),
    )
    .slice(0, 6);

  const emptyRaces = races.filter(
    (race) =>
      race.status === "planned" &&
      !entries.some((item) => Number(item.race_id) === Number(race.id)),
  );
  const pendingResults = entries.filter((item) => {
    if (
      item.status !== "registered" ||
      results.some((result) => Number(result.race_entry_id) === Number(item.id))
    )
      return false;
    const race = lookup.db.getById("races", item.race_id);
    const competition = race
      ? lookup.db.getById("competitions", race.competition_id)
      : null;
    return race?.status === "finished" && competition?.status === "in_progress";
  });
  const prizeTotal = competitions
    .filter((competition) => competition.status === "finished")
    .reduce(
      (sum, competition) => sum + (Number(competition.prize_fund) || 0),
      0,
    );

  const hero = el("section", { class: "hero" }, [
    el("div", {}, [
      el("h2", {
        text: "Информационная система управления соревнованиями по скачкам",
      }),
      el("p", {
        text:
          `Режим: ${roleLabel(user?.role)}. В системе ${competitions.length} ${plural(competitions.length, ["соревнование", "соревнования", "соревнований"])}, ` +
          `${races.length} ${plural(races.length, ["заезд", "заезда", "заездов"])}, ` +
          `${teams.length} ${plural(teams.length, ["команда", "команды", "команд"])}. ` +
          `Призовой фонд завершённых соревнований: ${formatMoney(prizeTotal)}.`,
      }),
    ]),
    el("div", { class: "hero-actions" }, [
      el("a", { class: "btn", href: "#/competitions" }, [
        icon("races"),
        el("span", { text: "Соревнования" }),
      ]),
      el("a", { class: "btn", href: "#/results" }, [
        icon("trophy"),
        el("span", { text: "Результаты" }),
      ]),
    ]),
    el("div", { class: "hero-mark" }, [icon("horses")]),
  ]);

  const stats = el("section", { class: "stat-grid stat-grid--wide" }, [
    statCard(
      "Соревнования",
      competitions.length,
      "races",
      `${upcoming.length} ближайших`,
      "#/competitions",
    ),
    statCard(
      "Заезды",
      races.length,
      "results",
      `${emptyRaces.length} без участников`,
      "#/races",
    ),
    statCard(
      "Команды",
      teams.length,
      "teams",
      "шаблоны «лошадь + жокей»",
      "#/teams",
    ),
    statCard(
      "Лошади",
      horses.length,
      "horses",
      `${horses.filter((horse) => horse.status === "active").length} активных`,
      "#/horses",
    ),
    statCard(
      "Жокеи",
      jockeys.length,
      "jockeys",
      `${jockeys.filter((jockey) => jockey.status === "active").length} активных`,
      "#/jockeys",
    ),
    statCard(
      "Результаты",
      results.length,
      "trophy",
      `ожидают результата: ${pendingResults.length}`,
      "#/results",
    ),
  ]);

  const upcomingPanel = panel(
    "Ближайшие соревнования",
    "#/competitions",
    upcoming.length
      ? el(
          "div",
          { class: "list" },
          upcoming.map((competition) => competitionRow(competition, lookup)),
        )
      : emptyLine("Предстоящих соревнований нет"),
  );

  const resultsPanel = panel(
    "Последние результаты",
    "#/results",
    latestResults.length
      ? el("div", { class: "list" }, latestResults.map(resultRow))
      : emptyLine("Результаты пока не зафиксированы"),
  );

  root.append(
    el("div", { class: "section" }, [
      hero,
      stats,
      el("div", { class: "grid-dash" }, [upcomingPanel, resultsPanel]),
      attentionCard({ emptyRaces, pendingResults, lookup }),
    ]),
  );
}

function statCard(title, value, iconName, hint, link) {
  return el(
    "a",
    { class: "stat", href: link, style: "color:inherit;text-decoration:none" },
    [
      el("div", { class: "stat-top" }, [
        el("div", { class: "stat-ico" }, [icon(iconName)]),
        el("span", { text: title }),
      ]),
      el("div", { class: "stat-value", text: formatNumber(value) }),
      el("div", { class: "stat-hint", text: hint }),
    ],
  );
}

function panel(title, link, body) {
  return el("div", { class: "card" }, [
    el("div", { class: "card-head" }, [
      el("h2", { text: title }),
      el("span", { class: "spacer" }),
      el("a", { class: "small", href: link, text: "Все →" }),
    ]),
    body,
  ]);
}

function emptyLine(text) {
  return el("div", { class: "empty" }, [icon("empty"), el("span", { text })]);
}

function competitionRow(competition, lookup) {
  const parts = formatDateParts(competition.competition_date);
  const raceCount = lookup
    .rows("races")
    .filter(
      (race) => Number(race.competition_id) === Number(competition.id),
    ).length;
  return el(
    "a",
    { class: "list-row", href: `#/competitions/${competition.id}` },
    [
      el("div", { class: "date-chip" }, [
        el("div", { class: "d", text: parts.day }),
        el("div", { class: "m", text: parts.month }),
      ]),
      el("div", { class: "list-main" }, [
        el("div", { class: "list-title", text: competition.name }),
        el("div", {
          class: "list-sub",
          text: `${competition.hippodrome_name} · ${raceCount} ${plural(raceCount, ["заезд", "заезда", "заездов"])} · ${formatMoney(competition.prize_fund)}`,
        }),
      ]),
    ],
  );
}

function resultRow(item) {
  const positionText =
    item.result.status === "finished"
      ? String(item.result.position ?? "—")
      : "—";
  return el(
    "a",
    {
      class: "list-row",
      href: item.competition
        ? `#/competitions/${item.competition.id}`
        : "#/results",
    },
    [
      el("span", {
        class: `place${Number(item.result.position) <= 3 ? ` place-${item.result.position}` : ""}`,
        text: positionText,
      }),
      el("div", { class: "list-main" }, [
        el("div", {
          class: "list-title",
          text: item.horse?.name ?? "лошадь не найдена",
        }),
        el("div", {
          class: "list-sub",
          text: `${jockeyFullName(item.jockey)} · ${item.competition?.name ?? "—"}, заезд №${item.race?.race_number ?? "—"} · ${labelForOptions(resultStatusOptions, item.result.status)} · ${formatDurationMs(item.result.finish_time_ms)}`,
        }),
      ]),
      el("span", {
        class: "badge badge-brand",
        text: item.competition
          ? formatDate(item.competition.competition_date)
          : "—",
      }),
    ],
  );
}

function attentionCard({ emptyRaces, pendingResults, lookup }) {
  const rows = [];
  if (emptyRaces.length) {
    rows.push(
      el("div", { class: "list-row" }, [
        el("span", { class: "badge badge-warn", text: `${emptyRaces.length}` }),
        el("div", { class: "list-main" }, [
          el("div", { class: "list-title", text: "Заезды без участников" }),
          el("div", {
            class: "list-sub",
            text: emptyRaces
              .slice(0, 3)
              .map((race) => describe("races", race, lookup.db))
              .join("; "),
          }),
        ]),
        el("a", { class: "btn btn-sm", href: "#/race-entries" }, [
          el("span", { text: "Состав заездов" }),
        ]),
      ]),
    );
  }
  if (pendingResults.length) {
    rows.push(
      el("div", { class: "list-row" }, [
        el("span", {
          class: "badge badge-info",
          text: `${pendingResults.length}`,
        }),
        el("div", { class: "list-main" }, [
          el("div", { class: "list-title", text: "Участия без результата" }),
          el("div", {
            class: "list-sub",
            text: "Результат можно зафиксировать после перевода заезда в статус «Завершён»",
          }),
        ]),
        el("a", { class: "btn btn-sm", href: "#/results" }, [
          el("span", { text: "Результаты" }),
        ]),
      ]),
    );
  }
  if (!rows.length)
    rows.push(
      el("div", { class: "list-row" }, [
        el("span", { class: "badge badge-ok", text: "готово" }),
        el("div", { class: "list-main" }, [
          el("div", { class: "list-title", text: "Нет незаполненных данных" }),
        ]),
      ]),
    );
  return el("div", { class: "card" }, [
    el("div", { class: "card-head" }, [el("h2", { text: "Требует внимания" })]),
    el("div", { class: "list" }, rows),
  ]);
}
