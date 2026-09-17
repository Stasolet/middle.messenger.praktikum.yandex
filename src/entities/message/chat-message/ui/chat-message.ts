import { BaseBlock } from '../../../../shared/ui';
import template from './chat-message.hbs';
import './chat-message.scss';

export class ChatMessage extends BaseBlock {
  static componentName = 'ChatMessage';
  protected template = template;
}
