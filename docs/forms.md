# Формы

- Валидация полей — на `blur` (вызывает `FormField.validate()`); перепроверка всех полей — на `submit`.
- Виджет `Form` (`src/widgets/form`): свои поля получает как `children.filter(isFormField)` (не через `namedChildren`).
- Submit-поток `Form`: `validate()` всех полей → сбор `collectFormValues(form)` → кросс-проверки `onValidate(values)` (карта `имя поля -> ошибка`, наносится через `field.setError`) → при ошибках стоп → `onSubmit` (дефолт — отладочный `logFormValues`); Form никуда не ведёт — навигация внутри `onSubmit` страниц (login, sign-up).
- `onSubmit` может вернуть промис (запрос на сервер): до его ответа кнопка `[type=submit]` заблокирована, повторный submit игнорируется, отклонение показывается в `.form__error` текстом `error.message`.
- Простые правила — в `validators` конкретного поля; кросс-полевые (напр. совпадение паролей на sign-up) — только в `onValidate` формы, показываются после submit.
- `collectFormValues` / `logFormValues` / `FormValues` — `src/shared/lib/form.ts`.
- `novalidate` на `<form>` (`form.hbs`, `profile.hbs`): иначе нативная проверка браузера (`type=email`) блокирует submit раньше наших валидаторов — пользователь видит системную подсказку вместо ошибки поля.
- Страница profile — не на виджете `Form` (свой `<form>`): режимы `view` / `profile` / `password` переключаются кнопками футера императивно, без ре-рендера; submit проверяет только видимую группу полей, ждёт промис обработчика страницы (отклонение — в `.form__error`), «Отмена» возвращает значения из props. Значения после успешной записи страница берёт с сервера (`GET /auth/user`), а не из полей формы.
- «Выйти» на profile — `button` с `data-action="sign-out"` и обработчик страницы (`auth.signOut()` → переход на вход); ссылкой на `/` быть не может: guard возвращает авторизованного на `/messenger`.
