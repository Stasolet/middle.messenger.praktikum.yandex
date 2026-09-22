import { BaseBlock, type BaseProps } from '../../../../shared/ui';
import template from './chat-message.hbs';
import './chat-message.scss';

export interface ChatMessageProps extends BaseProps {
  id: number;
  isUser: boolean;
  text?: string;
  image?: string;
  time: string | Date;
  metadata: {
    delivery_status: string;
  };
}

export class ChatMessage extends BaseBlock<ChatMessageProps> {
  static componentName = 'ChatMessage';
  protected template = template;
}
