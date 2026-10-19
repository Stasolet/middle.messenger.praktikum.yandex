import { BaseBlock } from '../../shared/ui';
import { registerComponent } from '../../shared/lib';
import { ErrorWidget } from '../../widgets/error';
import type { PageProps } from '../../shared/router';
import template from './error_404.hbs';

registerComponent(ErrorWidget);

export class Error404Page extends BaseBlock<PageProps> {
  protected template = template;
}
