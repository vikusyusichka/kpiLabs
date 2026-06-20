# TutorFlow — Management Portal API

## Стек

- Node.js + Express — REST API
- JWT-автентифікація (`jsonwebtoken`)
- `bcryptjs` для хешування паролів
- In-memory store (без зовнішньої БД)
- Jest + Supertest для тестування

## Запуск

```bash
npm install
npm start
```

Сервер за замовчуванням слухає `http://localhost:3000`. Порт можна змінити через змінну `PORT`.

## Тести

```bash
npm test                  
npm run test:unit         
npm run test:integration  
```

## Структура проєкту

```text
tutorflow/
├── docs/
│   └── use-cases.md
├── src/
│   ├── server.js
│   ├── app.js
│   ├── auth/
│   │   └── auth.controller.js
│   ├── students/
│   │   └── students.controller.js
│   ├── sessions/
│   │   └── sessions.controller.js
│   ├── middleware/
│   │   └── auth.js
│   ├── repositories/
│   │   └── db.js
│   └── utils/
│       └── validators.js
└── tests/
    ├── unit/
    │   └── validators.test.js
    └── integration/
        ├── auth.test.js
        ├── students.test.js
        └── sessions.test.js
```

## API

Усі ендпоінти, крім `/api/auth/register` та `/api/auth/login`, потребують заголовок `Authorization: Bearer <token>`. Без нього сервер відповідає `401 Unauthorized`.

### Auth

| Метод  | Шлях                  | Призначення              | Успіх | Помилки             |
| ------ | --------------------- | ------------------------ | ----- | ------------------- |
| `POST` | `/api/auth/register`  | Реєстрація репетитора    | `201` | `400`, `409`        |
| `POST` | `/api/auth/login`     | Вхід, отримання JWT      | `200` | `400`, `401`        |
| `GET`  | `/api/auth/me`        | Дані поточного юзера     | `200` | `401`               |

### Students

| Метод    | Шлях                  | Призначення             | Успіх | Помилки                  |
| -------- | --------------------- | ----------------------- | ----- | ------------------------ |
| `POST`   | `/api/students`       | Додати учня             | `201` | `400`, `401`             |
| `GET`    | `/api/students`       | Список своїх учнів      | `200` | `401`                    |
| `GET`    | `/api/students/:id`   | Отримати учня           | `200` | `401`, `404`             |
| `PATCH`  | `/api/students/:id`   | Оновити поля            | `200` | `400`, `401`, `404`      |
| `DELETE` | `/api/students/:id`   | Видалити учня           | `204` | `401`, `404`, `409`      |

### Sessions

| Метод    | Шлях                          | Призначення                  | Успіх | Помилки                       |
| -------- | ----------------------------- | ---------------------------- | ----- | ----------------------------- |
| `POST`   | `/api/sessions`               | Запланувати заняття          | `201` | `400`, `401`, `404`, `409`    |
| `GET`    | `/api/sessions`               | Список, фільтр `?studentId=` | `200` | `401`                         |
| `GET`    | `/api/sessions/:id`           | Отримати заняття             | `200` | `401`, `404`                  |
| `PATCH`  | `/api/sessions/:id`           | Змінити час / тему           | `200` | `400`, `401`, `404`, `409`    |
| `PATCH`  | `/api/sessions/:id/status`    | Скасувати / завершити        | `200` | `400`, `401`, `404`, `409`    |
| `DELETE` | `/api/sessions/:id`           | Видалити                     | `204` | `401`, `404`                  |

## Інваріанти

| Сутність  | Правила, які завжди мають виконуватись                                            |
| --------- | --------------------------------------------------------------------------------- |
| `User`    | `email` — валідний формат; `password` ≥ 6 символів; email унікальний.             |
| `Student` | `fullName` ≥ 2 символів; `subject` непорожній; `email` валідний, якщо вказаний.   |
| `Session` | `startsAt` валідна ISO-дата і у майбутньому; `startsAt < endsAt`.                 |
| `Session` | немає перетину з іншим заняттям того ж репетитора; `studentId` належить юзеру.    |
| `Session` | не можна завершити заняття, яке ще не почалося; не можна скасувати завершене.     |

Детальні юзкейси та альтернативні сценарії — у [`docs/use-cases.md`](docs/use-cases.md).

## Приклад використання

```bash

curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"alex@example.com","password":"secret1","fullName":"Alex Rivera"}'

# 2. Вхід — повертає JWT
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alex@example.com","password":"secret1"}' | jq -r .token)

curl -X POST http://localhost:3000/api/students \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Egor Petrov","subject":"Math"}'

curl -X POST http://localhost:3000/api/sessions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"studentId":1,"startsAt":"2026-07-01T10:00:00Z","endsAt":"2026-07-01T11:00:00Z","topic":"Geometry"}'
```
