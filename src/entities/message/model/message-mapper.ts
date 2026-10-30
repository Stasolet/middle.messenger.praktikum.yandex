import { type WsMessageDTO } from '../../../shared/api';
import { type Message } from './message';

/** Кадр чат-сервера → сообщение ленты: «моё» определяется по id текущего пользователя. */
export const toMessage = (dto: WsMessageDTO, myUserId: number): Message => ({
  id: dto.id,
  isUser: dto.user_id === myUserId,
  text: dto.content,
  time: dto.time,
  metadata: {
    delivery_status: dto.is_read ? 'read' : 'delivered',
  },
});
