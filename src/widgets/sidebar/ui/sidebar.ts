import { BaseBlock } from '../../../shared/ui';
import template from './sidebar.hbs';
import './sidebar.scss';

export class Sidebar extends BaseBlock {
  static componentName = 'Sidebar';
  protected template = template;
}
