# HTTP API

Все рабочие методы, кроме `/api/auth/login` и `/api/health`, требуют входа в систему.
Авторизация хранится в HttpOnly cookie, браузер отправляет её сам.

## Авторизация

- `POST /api/auth/login` — вход. Тело: `{ "login": "admin", "password": "..." }`
- `POST /api/auth/logout` — выход.
- `GET /api/auth/me` — текущий пользователь.

## Пользователи

- `GET /api/users`
- `GET /api/users/{id}`
- `POST /api/users`
- `PATCH /api/users/{id}`
- `DELETE /api/users/{id}`

Управление пользователями доступно только администратору.

## Лошади

- `GET /api/horses`
- `GET /api/horses/{id}`
- `POST /api/horses`
- `PATCH /api/horses/{id}`
- `DELETE /api/horses/{id}`

## Жокеи

- `GET /api/jockeys`
- `GET /api/jockeys/{id}`
- `POST /api/jockeys`
- `PATCH /api/jockeys/{id}`
- `DELETE /api/jockeys/{id}`

## Команды

- `GET /api/teams`
- `GET /api/teams?horse_id=1`
- `GET /api/teams?jockey_id=2`
- `GET /api/teams/{id}`
- `POST /api/teams`
- `PATCH /api/teams/{id}`
- `DELETE /api/teams/{id}`

## Соревнования

- `GET /api/competitions`
- `GET /api/competitions/{id}`
- `POST /api/competitions`
- `PATCH /api/competitions/{id}`
- `DELETE /api/competitions/{id}`

При создании `organizer_id` сервер выставляет равным ID вошедшего пользователя.

## Заезды

- `GET /api/races`
- `GET /api/races?competition_id=1`
- `GET /api/races/{id}`
- `POST /api/races`
- `PATCH /api/races/{id}`
- `DELETE /api/races/{id}`

## Состав заездов

- `GET /api/race-entries`
- `GET /api/race-entries?race_id=1`
- `GET /api/race-entries/{id}`
- `POST /api/race-entries`
- `PATCH /api/race-entries/{id}`
- `DELETE /api/race-entries/{id}`

## Результаты

- `GET /api/results`
- `GET /api/results/{id}`
- `POST /api/results`
- `PATCH /api/results/{id}`
- `DELETE /api/results/{id}`

## Служебный адрес

- `GET /api/health`

Пример ответа:

```json
{
  "status": "ok",
  "database": "ok"
}
```

## Ошибки

Сервер старается возвращать одну простую форму ошибки:

```json
{
  "error": "Этот стартовый номер уже занят",
  "fields": {
    "start_number": "Номер уже занят"
  }
}
```

`fields` нужен фронту, чтобы подсветить конкретное поле формы.
