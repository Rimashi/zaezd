import { renderDashboard } from "./dashboard.js";
import { renderCompetitions } from "./competitions.js";
import { renderCompetitionDetail } from "./competitionDetail.js";
import { renderRaces } from "./races.js";
import { renderRaceEntries } from "./raceEntries.js";
import { renderResults } from "./results.js";
import { renderTeams } from "./teams.js";
import { renderHorses } from "./horses.js";
import { renderJockeys } from "./jockeys.js";
import { renderUsers } from "./users.js";

export const routes = [
  {
    key: "dashboard",
    path: "/dashboard",
    title: "Обзор",
    subtitle: "Сводка по соревнованиям, заездам и результатам",
    icon: "dashboard",
    group: "Основное",
    render: renderDashboard,
  },

  {
    key: "competitions",
    path: "/competitions",
    title: "Соревнования",
    subtitle: "Создание и проведение соревнований",
    icon: "races",
    entity: "competitions",
    group: "Соревнования",
    render: renderCompetitions,
  },
  {
    key: "competitionDetail",
    path: "/competitions/:id",
    title: "Соревнование",
    subtitle: "Заезды, состав и результаты",
    icon: "races",
    menu: false,
    activeKey: "competitions",
    render: renderCompetitionDetail,
  },
  {
    key: "races",
    path: "/races",
    title: "Заезды",
    subtitle: "Заезды внутри соревнований",
    icon: "results",
    entity: "races",
    group: "Соревнования",
    render: renderRaces,
  },
  {
    key: "raceEntries",
    path: "/race-entries",
    title: "Состав заездов",
    subtitle: "Заявленные команды и стартовые номера",
    icon: "participation",
    entity: "race_entries",
    group: "Соревнования",
    render: renderRaceEntries,
  },
  {
    key: "results",
    path: "/results",
    title: "Результаты",
    subtitle: "Места, время и статус результата",
    icon: "trophy",
    entity: "results",
    group: "Соревнования",
    render: renderResults,
  },

  {
    key: "teams",
    path: "/teams",
    title: "Команды",
    subtitle: "Переиспользуемые пары «лошадь + жокей»",
    icon: "teams",
    entity: "teams",
    group: "Участники",
    render: renderTeams,
  },
  {
    key: "horses",
    path: "/horses",
    title: "Лошади",
    subtitle: "Зарегистрированные лошади",
    icon: "horses",
    entity: "horses",
    group: "Участники",
    render: renderHorses,
  },
  {
    key: "jockeys",
    path: "/jockeys",
    title: "Жокеи",
    subtitle: "Зарегистрированные жокеи",
    icon: "jockeys",
    entity: "jockeys",
    group: "Участники",
    render: renderJockeys,
  },

  {
    key: "users",
    path: "/users",
    title: "Пользователи",
    subtitle: "Учётные записи администраторов и организаторов",
    icon: "users",
    entity: "users",
    group: "Администрирование",
    render: renderUsers,
  },
];
