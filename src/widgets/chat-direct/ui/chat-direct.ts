import { registerComponent } from '../../../shared/lib';
import { ChatMessage } from '../../../entities/message/chat-message';
import { BaseBlock, type BaseProps } from '../../../shared/ui';
import template from './chat-direct.hbs';
import './chat-direct.scss';

registerComponent(ChatMessage);

type Message = {
  id: Number;
  isUser: boolean;
  text?: string;
  image?: string;
  time: string | Date;
  metadata: {
    delivery_status: string;
  };
};

interface ChatDirectProps extends BaseProps {
  name: string;
  avatarUrl: string;
  messages: Message[];
}

export class ChatDirect extends BaseBlock<ChatDirectProps> {
  static componentName = 'ChatDirect';
  protected template = template;
}
