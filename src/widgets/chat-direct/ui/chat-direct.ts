import { collectFormValues, registerComponent, validations } from '../../../shared/lib';
import { ChatMessage, messagesService, type Message } from '../../../entities/message';
import { BaseBlock, type BaseProps } from '../../../shared/ui';
import template from './chat-direct.hbs';
import './chat-direct.scss';

registerComponent(ChatMessage);

interface ChatDirectProps extends BaseProps {
  name: string;
  avatarUrl: string;
  messages: Message[];
}

export class ChatDirect extends BaseBlock<ChatDirectProps> {
  static componentName = 'ChatDirect';
  protected template = template;

  protected events = {
    submit: (e: Event) => {
      e.preventDefault();

      const form = e.target;
      if (!(form instanceof HTMLFormElement)) {
        return;
      }

      const values = collectFormValues(form);
      const error = validations.required(values.message);
      if (error) {
        console.log(error);
        return;
      }

      messagesService.send(values);
      form.reset();
    },
  };
}
