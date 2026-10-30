import { BaseBlock, type BaseProps } from '../../../shared/ui';
import { type Chat } from '../model/chat';
import template from './chat-item.hbs';
import './chat-item.scss';

export interface ChatItemProps extends BaseProps, Chat {
  /** Открытый чат выделяется в списке */
  active?: boolean;
}

export class ChatItem extends BaseBlock<ChatItemProps> {
  static componentName = 'ChatItem';
  protected template = template;
}
