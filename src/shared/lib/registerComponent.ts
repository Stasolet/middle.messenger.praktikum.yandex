import { type HelperOptions } from 'handlebars';
import Handlebars from 'handlebars';

import { type BlockOwnProps, type ComponentConstructor } from '../ui/base/base';

/** Уникальный инкрементальный идентификатор для заглушки */
let uniqueId = 0;

function registerComponent<P extends BlockOwnProps>(Component: ComponentConstructor<P>) {
  Handlebars.registerHelper(
    Component.componentName,
    function (this: unknown, { hash, data }: HelperOptions) {
      const dataAttribute = `data-component-hbs-id="${++uniqueId}"`;
      const component = new Component(hash as P);

      // Если передали ref, сохраняем ссылку на DOM элемент компонента
      if ('ref' in hash) {
        (data.root.__refs = data.root.__refs || {})[hash.ref as string] = component.element()!;
      }

      (data.root.__children = data.root.__children || []).push({
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
    }
  );
}

export { registerComponent };
