import { http } from './http';
import { type ChatDTO, type ChatUserDTO, type CreatedIdDTO } from './dto';

export const chatsApi = {
  list: (): Promise<ChatDTO[]> => http.get<ChatDTO[]>('/chats'),

  create: (title: string): Promise<CreatedIdDTO> => http.post<CreatedIdDTO>('/chats', { title }),

  /** Удаляемый чат передаётся телом запроса, а не путём. */
  deleteChat: (chatId: number): Promise<void> => http.delete<void>('/chats', { chatId }),

  users: (chatId: number): Promise<ChatUserDTO[]> =>
    http.get<ChatUserDTO[]>(`/chats/${chatId}/users`),

  addUsers: (chatId: number, userIds: number[]): Promise<void> =>
    http.put<void>('/chats/users', { chatId, users: userIds }),

  removeUsers: (chatId: number, userIds: number[]): Promise<void> =>
    http.delete<void>('/chats/users', { chatId, users: userIds }),

  uploadAvatar: (chatId: number, file: File): Promise<ChatDTO> => {
    const form = new FormData();
    form.append('chatId', String(chatId));
    form.append('avatar', file);

    return http.put<ChatDTO>('/chats/avatar', form);
  },
};
