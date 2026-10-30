import {
  API_BASE_URL,
  TransportError,
  WsTransport,
  chatsApi,
  type WsFrameDTO,
  type WsMessageDTO,
  type WsStatus,
} from '../../../shared/api';
import { toMessage } from './message-mapper';
import { type Message } from './message';

/**
 * История `get old` приходит одной пачкой (не больше 20 сообщений) в порядке
 * от новых к старым — лента разворачивается. Остальные страницы подгружаются
 * тем же `get old` с content = id последнего полученного сообщения, но для
 * экранной истории первой пачки достаточно.
 */
const HISTORY_PAGE_LIMIT = 20;

/** История ждёт ответа столько же, сколько HTTP-запрос: дольше — считаем сбой. */
const HISTORY_TIMEOUT_MS = 10_000;

/**
 * Socket чата живёт на том же хосте, что и HTTP API, но над другими путями
 * и по своему протоколу: https → wss, путь /ws/chats/{userId}/{chatId}/{token}.
 */
const wsOrigin = (): string => {
  const api = new URL(API_BASE_URL);
  const scheme = api.protocol === 'https:' ? 'wss:' : 'ws:';

  return `${scheme}//${api.host}`;
};

export interface ChatEvents {
  /** Новое сообщение из ленты (история в него не попадает). */
  onMessage: (message: Message) => void;
  /** Состояние соединения: виджет показывает переподключение и обрыв. */
  onStatus: (status: WsStatus) => void;
}

export interface ChatConnection {
  send(text: string): void;
  /** Первая страница истории; можно вызывать до открытия сокета — команда подождёт в очереди. */
  getHistory(): Promise<Message[]>;
  close(): void;
}

class ChatConnectionImpl implements ChatConnection {
  private readonly chatId: number;
  private readonly userId: number;
  private readonly events: ChatEvents;
  private readonly transport: WsTransport;

  private historyPromise: Promise<Message[]> | null = null;
  private historyResolve: ((messages: Message[]) => void) | null = null;
  private historyReject: ((error: unknown) => void) | null = null;
  private historyTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(chatId: number, userId: number, events: ChatEvents) {
    this.chatId = chatId;
    this.userId = userId;
    this.events = events;

    this.transport = new WsTransport({
      url: () => this.buildUrl(),
      onFrame: (frame) => this.handleFrame(frame),
      onStatus: (status) => this.events.onStatus(status),
    });
    this.transport.connect();
  }

  send(text: string): void {
    this.transport.send({ type: 'message', content: text });
  }

  getHistory(): Promise<Message[]> {
    if (this.historyPromise) {
      return this.historyPromise;
    }

    this.historyPromise = new Promise<Message[]>((resolve, reject) => {
      this.historyResolve = resolve;
      this.historyReject = reject;

      this.historyTimer = setTimeout(() => {
        this.rejectHistory(new TransportError('Чат не вернул историю сообщений'));
      }, HISTORY_TIMEOUT_MS);

      this.transport.send({ type: 'get old', content: '0' });
    });

    return this.historyPromise;
  }

  close(): void {
    if (this.historyTimer) {
      clearTimeout(this.historyTimer);
      this.historyTimer = null;
    }

    this.transport.close();
  }

  /** Токен коротко живущий: перед каждой попыткой соединения (включая реконнект) берём новый. */
  private async buildUrl(): Promise<string> {
    const { token } = await chatsApi.token(this.chatId);

    return `${wsOrigin()}/ws/chats/${this.userId}/${this.chatId}/${token}`;
  }

  private handleFrame(frame: unknown): void {
    if (Array.isArray(frame)) {
      this.resolveHistory(frame as WsMessageDTO[]);
      return;
    }

    if (!this.isMessageFrame(frame)) {
      return;
    }

    this.events.onMessage(toMessage(frame, this.userId));
  }

  /**
   * Кадр `message` несёт текст в content; файлы и стикеры — id ресурса,
   * их лента пока не умеет показывать.
   */
  private isMessageFrame(frame: unknown): frame is WsMessageDTO {
    if (typeof frame !== 'object' || frame === null) {
      return false;
    }

    const candidate = frame as WsFrameDTO;

    return (
      candidate.type === 'message' &&
      typeof candidate.content === 'string' &&
      typeof candidate.id === 'number' &&
      typeof candidate.user_id === 'number' &&
      typeof candidate.time === 'string'
    );
  }

  private resolveHistory(page: WsMessageDTO[]): void {
    if (this.historyTimer) {
      clearTimeout(this.historyTimer);
      this.historyTimer = null;
    }

    const messages = page
      .slice(0, HISTORY_PAGE_LIMIT)
      .reverse()
      .map((dto) => toMessage(dto, this.userId));

    this.historyResolve?.(messages);
    this.clearHistoryHandlers();
  }

  private rejectHistory(error: unknown): void {
    if (this.historyTimer) {
      clearTimeout(this.historyTimer);
      this.historyTimer = null;
    }

    this.historyReject?.(error);
    this.clearHistoryHandlers();
  }

  private clearHistoryHandlers(): void {
    this.historyResolve = null;
    this.historyReject = null;
  }
}

export const messagesService = {
  /**
   * Открывает соединение с чатом. Сбой сети не отказывает: транспорт сам
   * переподключается, а UI о состоянии спрашивает через events.onStatus.
   */
  open: (chatId: number, userId: number, events: ChatEvents): ChatConnection =>
    new ChatConnectionImpl(chatId, userId, events),
};
