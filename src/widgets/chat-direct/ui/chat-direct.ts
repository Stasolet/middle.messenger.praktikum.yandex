import { registerComponent, validations } from '../../../shared/lib';
import {
  ChatMessage,
  type ChatMessageProps,
} from '../../../entities/message/chat-message';
import { BaseBlock, type BaseProps } from '../../../shared/ui';
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

      const input = this.refs.messageInput;
      if (!(input instanceof HTMLInputElement)) {
        return;
      }

      const error = validations.required(input.value);
      if (error) {
        console.log(error);
        return;
      }

      console.log({ message: input.value });
      input.value = '';
    },
  };
}
