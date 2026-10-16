import { chatsApi } from '../../../shared/api';
import { toChat } from './chat-mapper';
import { type Chat } from './chat';

export const chatsService = {
  getChats: async (): Promise<Chat[]> => (await chatsApi.list()).map(toChat),

  /** Создание отвечает только id — остальное придёт со списком чатов. */
  createChat: async (title: string): Promise<number> => (await chatsApi.create(title)).id,

  removeChat: (chatId: number): Promise<void> => chatsApi.deleteChat(chatId),

  addUsers: (chatId: number, userIds: number[]): Promise<void> =>
    chatsApi.addUsers(chatId, userIds),

  removeUsers: (chatId: number, userIds: number[]): Promise<void> =>
    chatsApi.removeUsers(chatId, userIds),

  uploadAvatar: async (chatId: number, file: File): Promise<Chat> =>
    toChat(await chatsApi.uploadAvatar(chatId, file)),
};
