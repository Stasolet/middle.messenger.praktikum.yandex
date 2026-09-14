export type Chat = {
  id: number;
  name: string;
  lastMessage: string;
  lastMessageDate: string | Date | number;
  unreadCount: number;
};
