import { BaseBlock } from '../../../shared/ui/base/base';
import template from './form.hbs';
import './form.scss';

export default class Form extends BaseBlock {
  readonly componentName = 'Form';
  protected template = template;
}
