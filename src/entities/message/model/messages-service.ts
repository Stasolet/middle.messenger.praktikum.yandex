import { messagesApi } from '../../../shared/api';
import { type FormValues } from '../../../shared/lib';
import { type Message } from './message';

export const messagesService = {
  getMessages: (chatId: number): Message[] => messagesApi.byChat(chatId),

  /** Демо бизнес-действия: отправки на сервер пока нет */
  send: (values: FormValues): void => {
    console.log(values);
  },
};
