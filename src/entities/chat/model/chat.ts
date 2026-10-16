export type Chat = {
  id: number;
  name: string;
  avatarUrl: string | null;
  lastMessage: string;
  /** ISO-время последнего сообщения; `null` у пустого чата. */
  lastMessageDate: string | null;
  unreadCount: number;
  createdBy: number;
};
