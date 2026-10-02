import chatMessagesMock from '../../../mocks/chat-messages.json';

/** В моке история сообщений есть только у этого диалога */
const CHAT_ID_WITH_MOCK = 1;

export const messagesApi = {
  byChat: (chatId: number) => (chatId === CHAT_ID_WITH_MOCK ? chatMessagesMock : []),
};
