import { toAvatarUrl, type ChatDTO } from '../../../shared/api';
import { type Chat } from './chat';

export const toChat = (dto: ChatDTO): Chat => ({
  id: dto.id,
  name: dto.title,
  avatarUrl: toAvatarUrl(dto.avatar),
  lastMessage: dto.last_message?.content ?? '',
  lastMessageDate: dto.last_message?.time ?? null,
  unreadCount: dto.unread_count,
  createdBy: dto.created_by,
});
