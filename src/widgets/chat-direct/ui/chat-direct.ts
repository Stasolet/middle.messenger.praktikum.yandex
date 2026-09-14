import { BaseBlock } from '../../../shared/ui';
import template from './chat-direct.hbs';
import './chat-direct.scss';

export class ChatDirect extends BaseBlock {
  static componentName = 'ChatDirect';
  protected template = template;
}
