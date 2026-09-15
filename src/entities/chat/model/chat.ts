export type Chat = {
  id: number;
  name: string;
  type: string;
  faction: string;
  avatarUrl: string;
  lastMessage: string;
  lastMessageDate: string | Date | number;
  unreadCount: number;
};
