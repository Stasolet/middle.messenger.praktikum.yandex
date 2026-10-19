import { BaseBlock } from '../../shared/ui';
import { registerComponent } from '../../shared/lib';
import { ErrorWidget } from '../../widgets/error';
import type { PageProps } from '../../shared/router';
import template from './error_500.hbs';

registerComponent(ErrorWidget);

export class Error500Page extends BaseBlock<PageProps> {
  protected template = template;
}
