/* ============================================================================
   Клиентская схема MVP.

   Поля максимально близки к текущей модели PostgreSQL/API. Исключение —
   users.password: фронт отправляет обычный пароль при создании/смене, а сервер
   обязан захешировать его и сохранить в users.password_hash.
   ========================================================================== */

export const roleOptions = [
  { value: "admin", label: "Администратор" },
  { value: "organizer", label: "Организатор" },
];

export const horseSexOptions = [
  { value: "stallion", label: "Жеребец" },
  { value: "mare", label: "Кобыла" },
  { value: "gelding", label: "Мерин" },
];

export const horseStatusOptions = [
  { value: "active", label: "Активна" },
  { value: "injured", label: "Травмирована" },
  { value: "retired", label: "Завершила карьеру" },
  { value: "deceased", label: "Умерла" },
];

export const jockeyStatusOptions = [
  { value: "active", label: "Активен" },
  { value: "injured", label: "Травмирован" },
  { value: "suspended", label: "Отстранён" },
  { value: "retired", label: "Завершил карьеру" },
];

export const competitionStatusOptions = [
  { value: "planned", label: "Запланировано" },
  { value: "in_progress", label: "Идёт" },
  { value: "finished", label: "Завершено" },
  { value: "cancelled", label: "Отменено" },
];

export const raceStatusOptions = [
  { value: "planned", label: "Запланирован" },
  { value: "in_progress", label: "Идёт" },
  { value: "finished", label: "Завершён" },
  { value: "cancelled", label: "Отменён" },
];

export const raceEntryStatusOptions = [
  { value: "registered", label: "Заявлен" },
  { value: "withdrawn", label: "Снят" },
];

export const resultStatusOptions = [
  { value: "finished", label: "Финишировал" },
  { value: "did_not_finish", label: "Не финишировал" },
  { value: "did_not_start", label: "Не стартовал" },
  { value: "disqualified", label: "Дисквалифицирован" },
];

export const raceTypes = [
  "Гладкие скачки",
  "Барьерные скачки",
  "Стипль-чез",
  "Рысистые заезды",
  "Кросс",
];

export const surfaceTypes = [
  "Песчаное",
  "Грунтовое",
  "Травяное",
  "Синтетическое",
];

export const qualifications = [
  "Мастер-жокей",
  "Жокей I категории",
  "Жокей II категории",
  "Жокей III категории",
  "Без категории",
];

const TONES = {
  admin: "badge-brand",
  organizer: "badge-info",
  public: "badge",

  active: "badge-ok",
  injured: "badge-warn",
  suspended: "badge-danger",
  retired: "badge",
  deceased: "badge-danger",

  planned: "badge-info",
  in_progress: "badge-warn",
  finished: "badge-ok",
  cancelled: "badge-danger",

  registered: "badge-info",
  withdrawn: "badge-danger",
  did_not_finish: "badge-warn",
  did_not_start: "badge",
  disqualified: "badge-danger",
};

export function toneFor(value) {
  return TONES[value] ?? "badge";
}

export function labelForOptions(options, value) {
  if (value === null || value === undefined || value === "") return "—";
  const option = (options ?? []).find((item) => {
    const optionValue = typeof item === "object" ? item.value : item;
    return String(optionValue) === String(value);
  });
  if (!option) return String(value);
  return typeof option === "object" ? option.label : String(option);
}

export function jockeyFullName(jockey) {
  if (!jockey) return "—";
  return [jockey.last_name, jockey.first_name, jockey.patronymic]
    .filter(Boolean)
    .join(" ");
}

export const entities = {
  users: {
    key: "users",
    title: "Пользователи",
    singular: "пользователь",
    addLabel: "Добавить пользователя",
    newTitle: "Новый пользователь",
    subtitle: "Учётные записи администраторов и организаторов",
    icon: "users",
    nameField: "login",
    searchFields: ["email", "login"],
    fields: [
      {
        name: "email",
        label: "E-mail",
        type: "email",
        required: true,
        primary: true,
        inTable: true,
        width: "230px",
      },
      {
        name: "login",
        label: "Логин",
        type: "text",
        required: true,
        unique: true,
        inTable: true,
        width: "170px",
      },
      {
        name: "password",
        label: "Пароль",
        type: "password",
        hint: "Сервер сохраняет только хеш. При редактировании оставьте поле пустым, чтобы не менять пароль.",
      },
      {
        name: "role",
        label: "Роль",
        type: "status",
        required: true,
        options: roleOptions,
        inTable: true,
        width: "170px",
      },
    ],
  },

  horses: {
    key: "horses",
    title: "Лошади",
    singular: "лошадь",
    addLabel: "Добавить лошадь",
    newTitle: "Новая лошадь",
    subtitle: "Карточки зарегистрированных лошадей",
    icon: "horses",
    nameField: "name",
    searchFields: ["name", "breed", "owner"],
    fields: [
      {
        name: "name",
        label: "Кличка",
        type: "text",
        required: true,
        primary: true,
        inTable: true,
        width: "170px",
      },
      {
        name: "breed",
        label: "Порода",
        type: "text",
        required: true,
        inTable: true,
        width: "190px",
      },
      {
        name: "owner",
        label: "Владелец",
        type: "text",
        required: true,
        inTable: true,
        width: "220px",
      },
      {
        name: "birth_date",
        label: "Дата рождения",
        type: "date",
        required: true,
        inTable: true,
        width: "140px",
      },
      {
        name: "sex",
        label: "Пол",
        type: "select",
        required: true,
        options: horseSexOptions,
        inTable: true,
        width: "120px",
      },
      {
        name: "weight_kg",
        label: "Вес, кг",
        type: "number",
        min: 1,
        max: 1000,
        format: "weight",
        inTable: true,
        width: "110px",
      },
      {
        name: "status",
        label: "Статус",
        type: "status",
        required: true,
        options: horseStatusOptions,
        inTable: true,
        width: "170px",
      },
    ],
  },

  jockeys: {
    key: "jockeys",
    title: "Жокеи",
    singular: "жокей",
    addLabel: "Добавить жокея",
    newTitle: "Новый жокей",
    subtitle: "Карточки зарегистрированных жокеев",
    icon: "jockeys",
    nameField: "last_name",
    searchFields: ["last_name", "first_name", "patronymic", "qualification"],
    fields: [
      {
        name: "last_name",
        label: "Фамилия",
        type: "text",
        required: true,
        primary: true,
        inTable: true,
        width: "150px",
      },
      {
        name: "first_name",
        label: "Имя",
        type: "text",
        required: true,
        inTable: true,
        width: "140px",
      },
      {
        name: "patronymic",
        label: "Отчество",
        type: "text",
        inTable: true,
        width: "160px",
      },
      {
        name: "birth_date",
        label: "Дата рождения",
        type: "date",
        required: true,
        inTable: true,
        width: "140px",
      },
      {
        name: "qualification",
        label: "Квалификация",
        type: "select",
        options: qualifications,
        inTable: true,
        width: "190px",
      },
      {
        name: "weight_kg",
        label: "Вес, кг",
        type: "number",
        min: 1,
        max: 150,
        format: "weight",
        inTable: true,
        width: "110px",
      },
      {
        name: "status",
        label: "Статус",
        type: "status",
        required: true,
        options: jockeyStatusOptions,
        inTable: true,
        width: "160px",
      },
    ],
  },

  teams: {
    key: "teams",
    title: "Команды",
    singular: "команда",
    addLabel: "Создать команду",
    newTitle: "Новая команда",
    subtitle: "Переиспользуемые пары «лошадь + жокей»",
    icon: "teams",
    nameField: "id",
    searchFields: [],
    fields: [
      {
        name: "horse_id",
        label: "Лошадь",
        type: "select",
        ref: "horses",
        required: true,
        inTable: true,
      },
      {
        name: "jockey_id",
        label: "Жокей",
        type: "select",
        ref: "jockeys",
        required: true,
        inTable: true,
      },
    ],
  },

  competitions: {
    key: "competitions",
    title: "Соревнования",
    singular: "соревнование",
    addLabel: "Добавить соревнование",
    newTitle: "Новое соревнование",
    subtitle: "Соревнования верхнего уровня",
    icon: "races",
    nameField: "name",
    searchFields: ["name", "hippodrome_name", "race_type"],
    fields: [
      {
        name: "name",
        label: "Название",
        type: "text",
        required: true,
        primary: true,
        inTable: true,
        width: "220px",
      },
      {
        name: "organizer_id",
        label: "Организатор",
        type: "number",
        required: true,
      },
      {
        name: "competition_date",
        label: "Дата проведения",
        type: "date",
        required: true,
        inTable: true,
        width: "145px",
      },
      {
        name: "hippodrome_name",
        label: "Ипподром",
        type: "text",
        required: true,
        inTable: true,
        width: "210px",
      },
      {
        name: "race_type",
        label: "Вид скачек",
        type: "select",
        options: raceTypes,
        inTable: true,
        width: "175px",
      },
      {
        name: "surface_type",
        label: "Тип покрытия",
        type: "select",
        options: surfaceTypes,
        inTable: true,
        width: "160px",
      },
      {
        name: "prize_fund",
        label: "Призовой фонд",
        type: "number",
        min: 0,
        max: 1000000000,
        format: "money",
        inTable: true,
        width: "155px",
      },
      {
        name: "status",
        label: "Статус",
        type: "status",
        required: true,
        options: competitionStatusOptions,
        inTable: true,
        width: "155px",
      },
    ],
  },

  races: {
    key: "races",
    title: "Заезды",
    singular: "заезд",
    addLabel: "Добавить заезд",
    newTitle: "Новый заезд",
    subtitle: "Заезды внутри соревнований",
    icon: "results",
    nameField: "race_number",
    searchFields: [],
    fields: [
      {
        name: "competition_id",
        label: "Соревнование",
        type: "select",
        ref: "competitions",
        required: true,
        inTable: true,
      },
      {
        name: "race_number",
        label: "Номер",
        type: "number",
        required: true,
        min: 1,
        max: 100,
        inTable: true,
        width: "100px",
      },
      {
        name: "start_time",
        label: "Время старта",
        type: "time",
        inTable: true,
        width: "125px",
      },
      {
        name: "distance_m",
        label: "Дистанция",
        type: "number",
        required: true,
        min: 1,
        max: 20000,
        format: "distance",
        inTable: true,
        width: "130px",
      },
      {
        name: "status",
        label: "Статус",
        type: "status",
        required: true,
        options: raceStatusOptions,
        inTable: true,
        width: "155px",
      },
    ],
  },

  race_entries: {
    key: "race_entries",
    title: "Состав заездов",
    singular: "участие",
    addLabel: "Заявить команду",
    newTitle: "Новое участие в заезде",
    subtitle: "Команды, заявленные в конкретные заезды",
    icon: "participation",
    nameField: "id",
    searchFields: [],
    fields: [
      {
        name: "race_id",
        label: "Заезд",
        type: "select",
        ref: "races",
        required: true,
        inTable: true,
      },
      {
        name: "team_id",
        label: "Команда",
        type: "select",
        ref: "teams",
        required: true,
        inTable: true,
      },
      {
        name: "start_number",
        label: "Стартовый №",
        type: "number",
        required: true,
        min: 1,
        max: 999,
        inTable: true,
        width: "120px",
      },
      {
        name: "status",
        label: "Статус",
        type: "status",
        required: true,
        options: raceEntryStatusOptions,
        inTable: true,
        width: "125px",
      },
      {
        name: "withdrawal_reason",
        label: "Причина снятия",
        type: "textarea",
        span: 2,
      },
    ],
  },

  results: {
    key: "results",
    title: "Результаты",
    singular: "результат",
    addLabel: "Добавить результат",
    newTitle: "Новый результат",
    subtitle: "Итоги участия команды в заезде",
    icon: "trophy",
    nameField: "id",
    searchFields: [],
    fields: [
      {
        name: "race_entry_id",
        label: "Участие в заезде",
        type: "select",
        ref: "race_entries",
        required: true,
        inTable: true,
      },
      {
        name: "position",
        label: "Место",
        type: "number",
        min: 1,
        max: 999,
        format: "place",
        inTable: true,
        width: "95px",
      },
      {
        name: "finish_time_ms",
        label: "Время",
        type: "number",
        min: 1,
        format: "duration_ms",
        inTable: true,
        width: "140px",
        hint: "Длительность в миллисекундах, например 97342 = 01:37.342",
      },
      {
        name: "status",
        label: "Статус",
        type: "status",
        required: true,
        options: resultStatusOptions,
        inTable: true,
        width: "180px",
      },
    ],
  },
};

export function getEntity(key) {
  return entities[key] ?? null;
}

export function describe(entityKey, row, db = null) {
  if (!row) return "—";
  const horse = (id) => db?.getById("horses", id)?.name ?? "лошадь не найдена";
  const jockey = (id) =>
    jockeyFullName(db?.getById("jockeys", id)) || "жокей не найден";
  const competition = (id) =>
    db?.getById("competitions", id)?.name ?? "соревнование не найдено";

  switch (entityKey) {
    case "users":
      return `${row.login} (${labelForOptions(roleOptions, row.role)})`;
    case "jockeys":
      return jockeyFullName(row);
    case "races":
      return `${competition(row.competition_id)} · заезд №${row.race_number}`;
    case "teams":
      return `${horse(row.horse_id)} / ${jockey(row.jockey_id)}`;
    case "race_entries": {
      const race = db?.getById("races", row.race_id);
      const team = db?.getById("teams", row.team_id);
      const raceText = race
        ? `${competition(race.competition_id)}, заезд №${race.race_number}`
        : "заезд не найден";
      const teamText = team
        ? `${horse(team.horse_id)} / ${jockey(team.jockey_id)}`
        : "команда не найдена";
      return `${raceText} · №${row.start_number} · ${teamText}`;
    }
    case "results":
      return db
        ? describe(
            "race_entries",
            db.getById("race_entries", row.race_entry_id),
            db,
          )
        : `#${row.id}`;
    default: {
      const entity = entities[entityKey];
      return entity ? (row[entity.nameField] ?? `#${row.id}`) : `#${row.id}`;
    }
  }
}

export function referenceKeys(entityKey) {
  const entity = entities[entityKey];
  if (!entity) return [];
  return [
    ...new Set(
      entity.fields.filter((field) => field.ref).map((field) => field.ref),
    ),
  ];
}

export function tableFields(entityKey) {
  const entity = entities[entityKey];
  return entity
    ? entity.fields.filter(
        (field) => field.inTable && field.type !== "password",
      )
    : [];
}
