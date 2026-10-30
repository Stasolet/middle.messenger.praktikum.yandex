import { beforeAll, describe, expect, it } from 'vitest';

import { initHbs } from '../../../../shared/lib/hbs';
import { type Message } from '../../model/message';
import { ChatMessage } from '../index';

const message = (props: Partial<Message> & Pick<Message, 'isUser'>): Element | null => {
  const base: Message = {
    id: 1,
    time: '2026-10-30T13:26:26+00:00',
    metadata: { delivery_status: 'delivered' },
    ...props,
  };

  return new ChatMessage(base).element();
};

describe('ChatMessage', () => {
  beforeAll(() => {
    initHbs();
  });

  it('текст сообщения с HTML остаётся текстом: ни script, ни img в DOM не появляется', () => {
    const element = message({
      isUser: false,
      text: '<script id="evil">steal()</script><img src=x onerror="steal()">',
    });

    expect(element?.querySelector('script')).toBeNull();
    expect(element?.querySelector('img')).toBeNull();
    expect(element?.querySelector('.chat-message__text')?.textContent?.trim()).toBe(
      '<script id="evil">steal()</script><img src=x onerror="steal()">'
    );
  });

  it('своё сообщение помечено классом user, чужое — interlocutor', () => {
    expect(message({ isUser: true })?.querySelector('.chat-message--user')).not.toBeNull();
    expect(message({ isUser: false })?.querySelector('.chat-message--interlocutor')).not.toBeNull();
  });

  it('статус доставки виден только на своих сообщениях', () => {
    const read = message({ isUser: true, metadata: { delivery_status: 'read' } });
    const delivered = message({ isUser: true });
    const foreign = message({ isUser: false, metadata: { delivery_status: 'read' } });

    expect(read?.querySelector('.chat-message__metadata')?.textContent).toContain('done_all');
    expect(delivered?.querySelector('.chat-message__metadata')?.textContent).toContain('check');
    expect(foreign?.querySelector('.material-symbols-outlined')).toBeNull();
  });

  it('ISO-время сервера превращается в HH:MM', () => {
    const element = message({ isUser: false, text: 'раз' });

    expect(element?.querySelector('.chat-message__time')?.textContent?.trim()).toMatch(
      /\d{2}:\d{2}/
    );
  });
});
