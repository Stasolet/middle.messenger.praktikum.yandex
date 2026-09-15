import { BaseBlock } from '../../../shared/ui';
import template from './chat-item.hbs';
import './chat-item.scss';

export class ChatItem extends BaseBlock {
  static componentName = 'ChatItem';
  protected template = template;
}
