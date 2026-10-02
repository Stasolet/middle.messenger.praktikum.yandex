# Формы

- Валидация полей — на `blur` (вызывает `FormField.validate()`); перепроверка всех полей — на `submit`.
- Виджет `Form` (`src/widgets/form`): свои поля получает как `children.filter(isFormField)` (не через `namedChildren`).
- Submit-поток `Form`: `validate()` всех полей → сбор `collectFormValues(form)` → кросс-проверки `onValidate(values)` (карта `имя поля -> ошибка`, наносится через `field.setError`) → при ошибках стоп → `onSubmit` (дефолт — отладочный `logFormValues`); Form никуда не ведёт — навигация внутри `onSubmit` страниц (login, signin).
- Простые правила — в `validators` конкретного поля; кросс-полевые (напр. совпадение паролей на signin) — только в `onValidate` формы, показываются после submit.
- `collectFormValues` / `logFormValues` / `FormValues` — `src/shared/lib/form.ts`.
- Страница profile — не на виджете `Form` (свой `<form>` и свой submit: `validate()` всех полей → `logFormValues`, без кросс-проверок и навигации; временно: демо всех полей, будет переделана).
