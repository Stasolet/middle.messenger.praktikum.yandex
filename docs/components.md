# Компоненты (src/shared/ui)

- `Button` — корень = сам `<button>`; `text`/`type` (дефолт `button`)/`name`/`disabled`/`ariaLabel`; корневой класс `btn`, стилизуются виджеты через вложенные селекторы (напр. `.form .btn`). `click` всплывает родителю, отдельной проводки нет.
- `Input` — корень = сам `<input>`, корневой класс `input` (стилизация — вложенными селекторами родителя); value живёт в DOM (uncontrolled), доступ через `getValue()`. События `blur`/`input` пробрасывает родителю через публичные `onBlur`/`onInput`.
- `FormField` — label + `Input` + узел ошибки; валидация через `validators` prop (`composeValidators` из `src/shared/lib/validations.ts`); ошибка рендерится императивно (`setError`), **без** ре-рендера. `name`/`setError`/`getValue` публичные.
- Компонент, перечисляющий детей конкретного вида, делает это через `this.children.filter(<type guard>)`, а не через `namedChildren` (см. `isFormField`).
