import { BaseBlock, type BaseProps } from '../../../../shared/ui';
import { type Message } from '../../model/message';
import template from './chat-message.hbs';
import './chat-message.scss';

export type ChatMessageProps = BaseProps & Message;

export class ChatMessage extends BaseBlock<ChatMessageProps> {
  static componentName = 'ChatMessage';
  protected template = template;
}
