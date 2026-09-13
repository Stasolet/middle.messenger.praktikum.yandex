import { BaseBlock } from '../../../shared/ui/base/base';
import template from './sidebar.hbs';
import './sidebar.scss';

export default class Sidebar extends BaseBlock {
  readonly componentName = 'Sidebar';
  protected template = template;
}
