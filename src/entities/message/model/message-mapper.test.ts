import { describe, expect, it } from 'vitest';

import { type WsMessageDTO } from '../../../shared/api';
import { toMessage } from './message-mapper';

const dto = (props: Partial<WsMessageDTO>): WsMessageDTO => ({
  id: 7,
  user_id: 2,
  chat_id: 1,
  type: 'message',
  content: 'привет',
  time: '2026-10-30T13:26:26+00:00',
  ...props,
});

describe('toMessage', () => {
  it('помечает «своим» только сообщение текущего пользователя', () => {
    expect(toMessage(dto({ user_id: 2 }), 2).isUser).toBe(true);
    expect(toMessage(dto({ user_id: 3 }), 2).isUser).toBe(false);
  });

  it('переносит текст и время, id сообщения сохраняется', () => {
    const message = toMessage(dto({ content: '<b>текст</b>' }), 2);

    expect(message.id).toBe(7);
    expect(message.text).toBe('<b>текст</b>');
    expect(message.time).toBe('2026-10-30T13:26:26+00:00');
  });

  it('is_read из истории становится статусом read, недочитанное — delivered', () => {
    expect(toMessage(dto({ is_read: true }), 2).metadata.delivery_status).toBe('read');
    expect(toMessage(dto({}), 2).metadata.delivery_status).toBe('delivered');
  });
});
