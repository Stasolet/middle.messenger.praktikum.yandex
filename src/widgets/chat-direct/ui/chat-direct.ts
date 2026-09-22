import { registerComponent, validations } from '../../../shared/lib';
import {
  ChatMessage,
  type ChatMessageProps,
} from '../../../entities/message/chat-message';
import { BaseBlock, type BaseProps, Input } from '../../../shared/ui';
import template from './chat-direct.hbs';
import './chat-direct.scss';

registerComponent(ChatMessage);

interface ChatDirectProps extends BaseProps {
  name: string;
  avatarUrl: string;
  messages: ChatMessageProps[];
}

export class ChatDirect extends BaseBlock<ChatDirectProps> {
  static componentName = 'ChatDirect';
  protected template = template;

  protected events = {
    submit: (e: Event) => {
      e.preventDefault();

      const input = this.namedChildren['messageInput'] as unknown as Input | undefined;
      if (!input) {
        return;
      }

      const value = input.getValue();
      const error = validations.required(value);
      if (error) {
        console.log(error);
        return;
      }

      console.log({ message: value });

      const node = input.element();
      if (node instanceof HTMLInputElement) {
        node.value = '';
      }
    },
  };
}
