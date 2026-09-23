# Мессенджер

Многопользовательский веб-чат — учебный проект (Яндекс практика, middle). Приложение на TypeScript (strict) без фреймворков: шаблонизатор Handlebars, препроцессор Sass, сборка на Vite.

## Возможности

- Авторизация и регистрация с валидацией полей (по blur и при submit)
- Список чатов и переписка (заглушка)
- Настройки профиля
- Служебные страницы 404 / 500

## Архитектура

- **Feature-Sliced Design:** `src/shared` → `src/entities` → `src/features` → `src/widgets` → `src/pages`, импорты только снизу вверх.
- **Компонентный подход:** UI-компонеты наследуют `BaseBlock` — рендер Handlebars-шаблона (`.hbs`), сбор refs и обработка событий.
- **MVC-слои:** модель — типы данных в `model/` срезов, представление — Handlebars-шаблоны, контроллер — обработчики событий компонентов.

## Стек

- **Язык:** TypeScript (strict)
- **Сборка:** Vite (MPA — свой `.html` на страницу)
- **Стили:** Sass (SCSS)
- **Шаблонизатор:** Handlebars
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

# Форматирование кода
npm run format
```

## Развёртывание

Проект развёрнут на Netlify: https://sprint-2--praktikum-stasolet.netlify.app

## Pull request

https://github.com/Stasolet/middle.messenger.praktikum.yandex/pull/5
