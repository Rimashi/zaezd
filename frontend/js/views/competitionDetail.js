import { api } from "../core/api.js";
import { el } from "../core/dom.js";
import { icon } from "../ui/icons.js";
import { canWriteSection } from "../core/session.js";
import { loadLookup } from "../ui/lookup.js";
import { openEntityForm, deleteEntity } from "../ui/entityActions.js";
import {
  labelForOptions,
  competitionStatusOptions,
  raceStatusOptions,
  raceEntryStatusOptions,
  resultStatusOptions,
  jockeyFullName,
} from "../data/schema.js";
import {
  formatDate,
  formatMoney,
  formatDistance,
  formatDurationMs,
  plural,
} from "../core/format.js";
import { go } from "../core/router.js";

export async function renderCompetitionDetail(root, params) {
  const lookup = await loadLookup();
  let competition;
  try {
    competition = await api.get("competitions", String(params.id));
  } catch (error) {
    root.append(
      el("div", { class: "section" }, [
        el("div", {
          class: "error-panel",
          text: String(error.message ?? error),
        }),
        backLink(),
      ]),
    );
    return;
  }

  const rerender = () => {
    root.replaceChildren();
    return renderCompetitionDetail(root, params);
  };
  const canEditCompetition = canWriteSection("competitions");
  const canManageRaces = canWriteSection("races");
  const canManageEntries = canWriteSection("race_entries");
  const canManageResults = canWriteSection("results");

  const races = lookup
    .rows("races")
    .filter((race) => Number(race.competition_id) === Number(competition.id))
    .sort((a, b) => Number(a.race_number) - Number(b.race_number));
  const entries = lookup.rows("race_entries");
  const results = lookup.rows("results");

  root.append(
    el("div", { class: "section" }, [
      backLink(),
      parametersCard(competition, races, {
        canEditCompetition,
        lookup,
        rerender,
      }),
      el("div", { class: "section-head" }, [
        el("h2", { text: "Заезды соревнования" }),
        el("span", {
          class: "badge",
          text: `${races.length} ${plural(races.length, ["заезд", "заезда", "заездов"])}`,
        }),
        el("span", { class: "spacer" }),
        canManageRaces && competition.status === "planned"
          ? el(
              "button",
              {
                class: "btn btn-primary",
                type: "button",
                onclick: () =>
                  openEntityForm("races", null, lookup, {
                    defaults: {
                      competition_id: competition.id,
                      status: "planned",
                    },
                    hiddenFields: ["competition_id"],
                    onSaved: rerender,
                  }),
              },
              [icon("plus"), el("span", { text: "Добавить заезд" })],
            )
          : null,
      ]),
      ...races.map((race) =>
        raceCard(race, {
          competition,
          lookup,
          entries,
          results,
          canManageRaces,
          canManageEntries,
          canManageResults,
          rerender,
        }),
      ),
      races.length
        ? null
        : el("div", { class: "empty" }, [
            icon("empty"),
            el("strong", { text: "В соревновании пока нет заездов" }),
          ]),
    ]),
  );
}

function parametersCard(
  competition,
  races,
  { canEditCompetition, lookup, rerender },
) {
  const actions =
    canEditCompetition &&
    !["finished", "cancelled"].includes(competition.status)
      ? el("div", { class: "card-actions" }, [
          el(
            "button",
            {
              class: "btn",
              type: "button",
              onclick: () =>
                openEntityForm("competitions", competition, lookup, {
                  hiddenFields: ["organizer_id"],
                  onSaved: rerender,
                }),
            },
            [icon("edit"), el("span", { text: "Изменить" })],
          ),
          el(
            "button",
            {
              class: "btn btn-danger",
              type: "button",
              onclick: () =>
                deleteEntity("competitions", competition, lookup, {
                  onDeleted: () => go("/competitions"),
                }),
            },
            [icon("trash"), el("span", { text: "Удалить" })],
          ),
        ])
      : null;

  return el("div", { class: "card" }, [
    el("div", { class: "card-head" }, [
      el("h2", { text: competition.name }),
      el("span", {
        class: "badge badge-brand",
        text: labelForOptions(competitionStatusOptions, competition.status),
      }),
      el("span", { class: "spacer" }),
      actions,
    ]),
    el("dl", { class: "kv" }, [
      el("dt", { text: "Дата проведения" }),
      el("dd", { text: formatDate(competition.competition_date) }),
      el("dt", { text: "Ипподром" }),
      el("dd", { text: competition.hippodrome_name ?? "—" }),
      el("dt", { text: "Вид скачек" }),
      el("dd", { text: competition.race_type ?? "—" }),
      el("dt", { text: "Тип покрытия" }),
      el("dd", { text: competition.surface_type ?? "—" }),
      el("dt", { text: "Заездов" }),
      el("dd", { text: String(races.length) }),
      el("dt", { text: "Призовой фонд" }),
      el("dd", { text: formatMoney(competition.prize_fund) }),
    ]),
  ]);
}

function raceCard(race, context) {
  const {
    competition,
    lookup,
    entries,
    results,
    canManageRaces,
    canManageEntries,
    rerender,
  } = context;
  const raceEntries = entries.filter(
    (entry) => Number(entry.race_id) === Number(race.id),
  );

  return el("div", { class: "card race-card" }, [
    el("div", { class: "card-head" }, [
      el("h3", { text: `Заезд №${race.race_number}` }),
      el("span", {
        class: "badge badge-info",
        text: formatDistance(race.distance_m),
      }),
      el("span", {
        class: "badge",
        text: race.start_time || "время не задано",
      }),
      el("span", {
        class: "badge badge-brand",
        text: labelForOptions(raceStatusOptions, race.status),
      }),
      el("span", { class: "spacer" }),
      canManageRaces &&
      !["finished", "cancelled"].includes(race.status) &&
      !["finished", "cancelled"].includes(competition.status)
        ? el(
            "button",
            {
              class: "btn btn-icon",
              type: "button",
              title: "Изменить заезд",
              onclick: () =>
                openEntityForm("races", race, lookup, {
                  hiddenFields: ["competition_id"],
                  onSaved: rerender,
                }),
            },
            [icon("edit")],
          )
        : null,
      canManageRaces &&
      race.status === "planned" &&
      !["finished", "cancelled"].includes(competition.status)
        ? el(
            "button",
            {
              class: "btn btn-icon",
              type: "button",
              title: "Удалить заезд",
              onclick: () =>
                deleteEntity("races", race, lookup, { onDeleted: rerender }),
            },
            [icon("trash")],
          )
        : null,
      canManageEntries && race.status === "planned"
        ? el(
            "button",
            {
              class: "btn btn-sm",
              type: "button",
              onclick: () =>
                openEntityForm("race_entries", null, lookup, {
                  defaults: { race_id: race.id, status: "registered" },
                  hiddenFields: ["race_id"],
                  onSaved: rerender,
                }),
            },
            [icon("plus"), el("span", { text: "Заявить команду" })],
          )
        : null,
    ]),
    raceEntries.length
      ? participantsTable(raceEntries, { ...context, race })
      : el("div", { class: "empty" }, [
          icon("empty"),
          el("strong", { text: "В заезде пока нет участников" }),
        ]),
  ]);
}

function participantsTable(
  raceEntries,
  {
    competition,
    lookup,
    results,
    canManageEntries,
    canManageResults,
    rerender,
    race,
  },
) {
  const resultByEntry = new Map(
    results.map((result) => [String(result.race_entry_id), result]),
  );
  const rows = raceEntries
    .map((entry) => {
      const team = lookup.db.getById("teams", entry.team_id);
      return {
        entry,
        team,
        horse: team ? lookup.db.getById("horses", team.horse_id) : null,
        jockey: team ? lookup.db.getById("jockeys", team.jockey_id) : null,
        result: resultByEntry.get(String(entry.id)),
      };
    })
    .sort(
      (a, b) => Number(a.entry.start_number) - Number(b.entry.start_number),
    );

  return el("div", { class: "table-scroll" }, [
    el("table", { class: "report-table" }, [
      el("thead", {}, [
        el("tr", {}, [
          el("th", { text: "№" }),
          el("th", { text: "Лошадь" }),
          el("th", { text: "Жокей" }),
          el("th", { text: "Заявка" }),
          el("th", { text: "Результат" }),
          el("th", { text: "Место" }),
          el("th", { text: "Время" }),
          canManageEntries || canManageResults ? el("th") : null,
        ]),
      ]),
      el(
        "tbody",
        {},
        rows.map((row) =>
          el("tr", {}, [
            el("td", {
              text: String(row.entry.start_number),
              dataset: { label: "№" },
            }),
            el("td", {
              text: row.horse?.name ?? "—",
              dataset: { label: "Лошадь" },
            }),
            el("td", {
              text: jockeyFullName(row.jockey),
              dataset: { label: "Жокей" },
            }),
            el("td", { dataset: { label: "Заявка" } }, [
              el("span", {
                class: "badge",
                text: labelForOptions(raceEntryStatusOptions, row.entry.status),
              }),
              row.entry.withdrawal_reason
                ? el("div", {
                    class: "small muted",
                    text: row.entry.withdrawal_reason,
                  })
                : null,
            ]),
            el("td", { dataset: { label: "Результат" } }, [
              row.result
                ? el("span", {
                    class: "badge",
                    text: labelForOptions(
                      resultStatusOptions,
                      row.result.status,
                    ),
                  })
                : el("span", { class: "muted", text: "—" }),
            ]),
            el("td", { dataset: { label: "Место" } }, [
              row.result?.position
                ? el("span", {
                    class: `place${Number(row.result.position) <= 3 ? ` place-${row.result.position}` : ""}`,
                    text: String(row.result.position),
                  })
                : el("span", { class: "muted", text: "—" }),
            ]),
            el("td", {
              class: "mono",
              text: formatDurationMs(row.result?.finish_time_ms),
              dataset: { label: "Время" },
            }),
            canManageEntries || canManageResults
              ? el(
                  "td",
                  { class: "num actions", dataset: { label: "Действия" } },
                  [
                    el("div", { class: "row-actions" }, [
                      canManageEntries && race.status === "planned"
                        ? el(
                            "button",
                            {
                              class: "btn btn-icon",
                              type: "button",
                              title: "Изменить заявку / снять участника",
                              onclick: () =>
                                openEntityForm(
                                  "race_entries",
                                  row.entry,
                                  lookup,
                                  {
                                    hiddenFields: ["race_id"],
                                    onSaved: rerender,
                                  },
                                ),
                            },
                            [icon("edit")],
                          )
                        : null,
                      canManageResults &&
                      competition.status === "in_progress" &&
                      race.status === "finished" &&
                      row.entry.status === "registered" &&
                      !row.result
                        ? el(
                            "button",
                            {
                              class: "btn btn-sm",
                              type: "button",
                              title: "Зафиксировать результат",
                              onclick: () =>
                                openEntityForm("results", null, lookup, {
                                  defaults: {
                                    race_entry_id: row.entry.id,
                                    status: "finished",
                                  },
                                  hiddenFields: ["race_entry_id"],
                                  onSaved: rerender,
                                }),
                            },
                            [icon("trophy"), el("span", { text: "Результат" })],
                          )
                        : null,
                      canManageResults &&
                      row.result &&
                      competition.status === "in_progress"
                        ? el(
                            "button",
                            {
                              class: "btn btn-icon",
                              type: "button",
                              title: "Изменить результат",
                              onclick: () =>
                                openEntityForm("results", row.result, lookup, {
                                  hiddenFields: ["race_entry_id"],
                                  onSaved: rerender,
                                }),
                            },
                            [icon("edit")],
                          )
                        : null,
                    ]),
                  ],
                )
              : null,
          ]),
        ),
      ),
    ]),
  ]);
}

function backLink() {
  return el("a", { class: "back-link", href: "#/competitions" }, [
    icon("open", "back-link-icon"),
    el("span", { text: "Все соревнования" }),
  ]);
}
