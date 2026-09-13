import { BaseBlock } from '../../../shared/ui/base/base';
import template from './form-field.hbs';
import './form-field.scss';

export default class FormField extends BaseBlock {
  static componentName = 'FormField';
  protected template = template;
}
