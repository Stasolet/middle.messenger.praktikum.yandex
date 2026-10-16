import { BaseBlock, type BaseRefs } from '../../shared/ui';
import { ErrorWidget } from '../../widgets/error';
import type { PageProps } from '../../shared/router';
import template from './error_404.hbs';

interface Error404PageRefs extends BaseRefs {
  root: HTMLElement;
}

export class Error404Page extends BaseBlock<PageProps, Error404PageRefs> {
  protected template = template;

  protected componentDidMount(): void {
    const error = new ErrorWidget({ code: 404, message: 'Не туда попали' });

    const errorElement = error.element();
    if (errorElement) {
      this.refs.root.appendChild(errorElement);
    }
  }
}
