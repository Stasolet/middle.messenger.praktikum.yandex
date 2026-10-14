import { BaseBlock, type BaseRefs } from '../../shared/ui';
import { ErrorWidget } from '../../widgets/error';
import type { PageProps } from '../../shared/router';
import template from './error_500.hbs';

interface Error500PageRefs extends BaseRefs {
  root: HTMLElement;
}

export class Error500Page extends BaseBlock<PageProps, Error500PageRefs> {
  protected template = template;

  protected componentDidMount(): void {
    const error = new ErrorWidget({ code: 500, message: 'Мы уже фиксим' });

    const errorElement = error.element();
    if (errorElement) {
      this.refs.root.appendChild(errorElement);
    }
  }
}
