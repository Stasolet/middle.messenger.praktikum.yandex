[![Netlify Status](https://api.netlify.com/api/v1/badges/3640e24e-50f8-4a5b-8fce-a29ae04ddc25/deploy-status?branch=sprint_4)](https://app.netlify.com/projects/praktikum-stasolet/deploys)

# Мессенджер

Одностраничное приложение чата — учебный проект (Яндекс практика, middle). TypeScript (strict) без фреймворков: шаблонизатор Handlebars, препроцессор Sass, сборка на Vite, данные — HTTP API курса.

## Возможности

- Вход, регистрация и выход — сессия на cookie Практикум API
- Настройки профиля: изменение данных, смена пароля, загрузка аватара
- Список чатов из API: выбор чата, создание, удаление, добавление и удаление участника
- Поиск по загруженному списку чатов
- Служебные страницы 404 / 500
- Переписка в реальном времени: сообщения и история чата по WebSocket, статус
  соединения показывается над полем ввода

## Маршруты

| Путь                 | Страница                 | Доступ         |
| -------------------- | ------------------------ | -------------- |
| `/`                  | вход                     | гость          |
| `/sign-up`           | регистрация              | гость          |
| `/settings`          | настройки профиля        | авторизованный |
| `/messenger`         | чаты, открывается первый | авторизованный |
| `/messenger/:chatId` | чат `chatId`             | авторизованный |
| `/404`, `/500`       | ошибки                   | все            |

Неизвестный путь отдаёт 404 средствами роутера, а не сервера: `netlify.toml`
настраивает fallback на `index.html`, а Vite — `appType: 'spa'`.

## Архитектура

- **Feature-Sliced Design:** `src/shared` → `src/entities` → `src/features` → `src/widgets` → `src/pages`, импорты только снизу вверх.
- **SPA и роутер:** таблица маршрутов и guard в `src/app.ts`; `Router` (`src/shared/router`) перехватывает клики по ссылкам и `popstate`, в DOM всегда одна страница.
- **Данные:** `src/shared/api` (транспорт на `XMLHttpRequest`, WS-транспорт чата,
  DTO и пути Практикум API) → `entities/*/model` (маппинг DTO в сущность и
  async-сервисы) → страницы.
- **Сессия:** cookie (`withCredentials`), собственного токена нет. Авторизованность известна только после `GET /auth/user`, поэтому первый рендер выполняется после `auth.restore()`.
- **Компоненты:** наследники `BaseBlock` — рендер Handlebars-шаблона (`.hbs`), сбор `ref` и обработка событий; ошибки валидации и сообщения сервера показывают сами компоненты.

## API

Запросы: `POST /auth/signup`, `POST /auth/signin`, `POST /auth/logout`, `GET /auth/user`, `PUT /user/profile`, `PUT /user/password`, `PUT /user/profile/avatar`, `POST /user/search`, `GET /chats`, `POST /chats`, `DELETE /chats`, `PUT /chats/users`, `DELETE /chats/users`.

Сообщения чата ходят по WebSocket, как описано в документации курса
(`/api/v2/openapi/ws`): перед подключением берётся одноразовый токен
`POST /chats/token/{chatId}`, сокет — `wss://…/ws/chats/{userId}/{chatId}/{token}`.
По сокету отправляются `{ type: "message", content }` и `{ type: "get old", content }`
(история), соединение держится пингами `{ type: "ping" }`, при обрыве транспорт
переподключается с экспоненциальной задержкой.

Транспорт — `XMLHttpRequest` с таймаутом 10 с. Ответы ошибок приходят в формах
`{ error }` или `{ code, description }` — текст берётся оттуда и показывается в
форме или в меню. Адрес API задаётся переменной `VITE_API_BASE_URL`, по
умолчанию — `https://ya-praktikum.tech/api/v2`.

## Стек

- **Язык:** TypeScript (strict)
- **Сборка:** Vite (SPA — один вход `src/index.html`)
- **Стили:** Sass (SCSS)
- **Шаблонизатор:** Handlebars (свой vite-плагин `vite-plugin-hbs-raw` отдаёт `.hbs` как строку)
- **Тесты:** Vitest (happy-dom для DOM-тестов)
- **Проверки:** ESLint, Stylelint, Prettier, Husky (pre-commit: формат, линтеры, тесты)
- **Развёртывание:** Netlify

## Запуск

Требуется Node.js 22+.

```bash
# Установка зависимостей
npm install

# Режим разработки (порт 3000)
npm run dev

# Сборка и запуск (порт 3000)
npm run start

# Сборка в dist
npm run build

# Проверки: типы, ESLint, Stylelint
npm run lint

# Тесты (Vitest): роутер, HTTP- и WS-транспорт, компоненты
npm test

# Тесты в watch-режиме
npm run test:watch

# Форматирование кода
npm run format
```

При `git commit` pre-commit-хук прогоняет `check-format`, `lint` и `test`.
Файлы тестов лежат рядом с тестируемыми модулями (`*.test.ts`).

### Работа без Практикум API

Если `ya-praktikum.tech` недоступен, можно поднять заглушку из `mocks/` — она
отвечает данными в формате API, держит сессию в cookie и поднимает чат-WS на том
же порту по тому же протоколу, что и живой сервер:

```bash
npm run mock:api
# http://localhost:4111

VITE_API_BASE_URL=http://localhost:4111 npm run dev
```

Учётные записи и ответы — в `mocks/api/*.json`. Для входа подойдёт пара
`stasolet` / `Sup3rSecret`. Маршруты, которых заглушка не знает, отвечают 501.

## Развёртывание

- Продакшен (ветка `main`): https://praktikum-stasolet.netlify.app
- Ветка `sprint_4`: https://sprint-4--praktikum-stasolet.netlify.app — доступ к
  деплоям веток закрыт Netlify Edge Access, нужен вход в аккаунт проекта

## Pull request

https://github.com/Stasolet/middle.messenger.praktikum.yandex/pull/5
