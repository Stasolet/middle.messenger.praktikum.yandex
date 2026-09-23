import { messagesApi } from '../../../shared/api';
import { type Message } from './message';

export const messagesService = {
  getMessages: (chatId: number): Message[] => messagesApi.byChat(chatId),

  /** Демо бизнес-действия: отправки на сервер пока нет */
  send: (text: string): void => {
    console.log('[message:send]', text);
  },
};
