import { type HelperOptions } from 'handlebars';
import Handlebars from 'handlebars';

import { type BaseProps, type ComponentConstructor } from '../../ui';

/** Уникальный инкрементальный идентификатор для заглушки */
let uniqueId = 0;

/**
 * Регистрирует компонент как Handlebars-хелпер для использования в шаблонах.
 *
 * Props передаются hash-атрибутами (`{{{Button text="Ок" type="submit"}}}`), позиционным
 * объектом целиком (`{{{FormField fieldConfig}}}` — удобно в {{#each}}) или и тем и другим
 * сразу, при этом hash переопределяет поля объекта.
 *
 * Механика children/refs/placeholder — в AGENTS.md («Дочерние компоненты»).
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
