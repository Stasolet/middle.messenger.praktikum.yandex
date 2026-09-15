import { type HelperOptions } from 'handlebars';
import Handlebars from 'handlebars';

import { type BaseProps, type ComponentConstructor } from '../ui';

/** Уникальный инкрементальный идентификатор для заглушки */
let uniqueId = 0;

/**
 * Регистрирует компонент как Handlebars-хелпер для использования в шаблонах.
 *
 * После регистрации компонент можно использовать в Handlebars-шаблонах тремя способами:
 *
 * @example
 * // 1. Передача props через hash-атрибуты (как обычные HTML-атрибуты)
 * // Шаблон:
 * // {{{Button label="Нажми меня" className="primary" type="submit"}}}
 *
 * @example
 * // 2. Передача объекта props целиком (полезно в {{#each}})
 * // Шаблон:
 * // {{#each fields}}
 * //   {{{FormField this}}}
 * // {{/each}}
 *
 * @example
 * // 3. Комбинирование: объект props + переопределение через hash
 * // hash-атрибуты имеют приоритет над полями объекта
 * // Шаблон:
 * // {{{FormField fieldConfig label="Переопределённый лейбл"}}}
 *
 * @remarks
 * При комбинировании (вариант 3) hash-атрибуты переопределяют значения из объекта props.
 * Это позволяет использовать базовый конфиг и точечно менять отдельные поля.
 *
 * @remarks
 * Компонент автоматически регистрирует себя в `__children` корневого контекста Handlebars.
 * После компиляции шаблона заглушка `<div data-component-hbs-id="...">` заменяется
 * на реальный DOM-элемент компонента через метод `embed()`.
 *
 * @remarks
 * Если в props передан атрибут `ref`, ссылка на DOM-элемент компонента сохраняется
 * в `__refs` корневого контекста для доступа из родительского компонента.
 *
 * @typeParam P - Тип props компонента, расширяющий BlockOwnProps
 * @param Component - Конструктор компонента с статическим полем componentName
 *
 * @throws {Error} Если в скомпилированном DOM не найден placeholder с data-component-hbs-id
 *
 * @example
 * // Регистрация компонента
 * registerComponent(Button);
 *
 * // Использование в шаблоне
 * // {{{Button label="Отправить" onClick=handleSubmit}}}
 */
function registerComponent<P extends BaseProps>(Component: ComponentConstructor<P>) {
  Handlebars.registerHelper(Component.componentName, function (this: unknown, ...args: unknown[]) {
    const options = args[args.length - 1] as HelperOptions;
    const positionArgs = args.slice(0, -1);

    const propsObject = positionArgs[0] as Partial<P> | undefined;

    const hash = (options.hash ?? {}) as Partial<P>;
    const mergedProps: P = {
      ...(propsObject ?? {}),
      ...hash,
    } as P;
    const dataAttribute = `data-component-hbs-id="${++uniqueId}"`;
    const component = new Component(mergedProps);

    const root = options.data.root;
    // Если передали ref, сохраняем ссылку на DOM элемент компонента
    if ('ref' in mergedProps && mergedProps.ref) {
      const refName = mergedProps.ref as string;
      (root.__refs = root.__refs || {})[refName] = component.element()!;
      (root.__namedChildren = root.__namedChildren || {})[refName] = component;
    }

    (root.__children = root.__children || []).push({
      component,
      embed(node: DocumentFragment) {
        const placeholder = node.querySelector(`[${dataAttribute}]`);
        if (!placeholder) {
          throw new Error(`Can't find data-id for component ${Component.componentName}`);
        }

        const element = component.element();
        if (element) {
          placeholder.replaceWith(element);
        }
      },
    });

    return `<div ${dataAttribute}></div>`;
  });
}

export { registerComponent };
