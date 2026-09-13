import { BaseBlock } from '../../../shared/ui/base/base';
import template from './error.hbs';
import './error.scss';

export default class Error extends BaseBlock {
  readonly componentName = 'Error';
  protected template = template;
}
