import { chatsApi } from '../../../shared/api';
import { type Chat } from './chat';

export const chatsService = {
  getChats: (): Chat[] => chatsApi.list(),

  getChatById: (id: number): Chat | undefined => chatsApi.byId(id),
};
