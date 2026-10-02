import chatsMock from '../../../mocks/chats.json';

export const chatsApi = {
  list: () => chatsMock,
  byId: (id: number) => chatsMock.find((chat) => chat.id === id),
};
