export type Chat = {
  id: number;
  name: string;
  avatarUrl: string | null;
  lastMessage: string;
  /** Время последнего сообщения: ISO-строка или epoch (секунды/миллисекунды); `null` у пустого чата. */
  lastMessageDate: string | number | null;
  unreadCount: number;
  createdBy: number;
};
