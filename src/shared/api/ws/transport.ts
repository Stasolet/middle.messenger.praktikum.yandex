/**
 * Транспорт чат-сервера (WebSocket): протокол описан в openapi/ws.
 * Класс не знает ни про авторизацию, ни про DTO сообщений — URL даёт
 * внешний код (токен коротко живущий, при реконнекте его выдают заново),
 * а кадры он отдаёт как есть.
 */

export type WsStatus = 'connecting' | 'open' | 'closed';

export interface WsOptions {
  /** Собирает URL подключения перед каждой попыткой — в том числе перед переподключением. */
  url: () => Promise<string>;
  /** Любой кадр сервера: распарсинный JSON (объект сообщения или массив истории). */
  onFrame: (frame: unknown) => void;
  onStatus: (status: WsStatus) => void;
}

/** Сервер держит соединение живым только пока клиент крутит пинги. */
const PING_INTERVAL_MS = 25_000;

/** Разрыв соединения случается чаще всего на секунду-другую: reconnect с экспоненциальной задержкой */
const RECONNECT_BASE_DELAY_MS = 1_000;
const RECONNECT_MAX_ATTEMPTS = 5;

export class WsTransport {
  private readonly options: WsOptions;

  private socket: WebSocket | null = null;

  private stopped = false;

  private reconnectAttempt = 0;

  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  private pingTimer: ReturnType<typeof setInterval> | null = null;

  /** Команды, отправленные, пока соединение не установлено: уходят первыми при открытии. */
  private queue: string[] = [];

  constructor(options: WsOptions) {
    this.options = options;
  }

  get status(): WsStatus {
    if (this.socket?.readyState === WebSocket.OPEN) {
      return 'open';
    }

    return this.stopped ? 'closed' : 'connecting';
  }

  connect(): void {
    this.stopped = false;
    void this.open();
  }

  /** Отправка команды протокола; при незакрытом, но не открытии сокете — в очередь. */
  send(command: { type: string; content?: string }): void {
    const payload = JSON.stringify(command);

    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(payload);
      return;
    }

    if (!this.stopped) {
      this.queue.push(payload);
    }
  }

  close(): void {
    this.stopped = true;
    this.clearTimers();
    this.detach(this.socket);
    this.socket?.close();
    this.socket = null;
  }

  private async open(): Promise<void> {
    this.options.onStatus('connecting');

    let url: string;
    try {
      url = await this.options.url();
    } catch {
      this.scheduleReconnect();
      return;
    }

    const socket = new WebSocket(url);
    this.detach(this.socket);
    this.socket = socket;

    socket.onopen = () => {
      this.reconnectAttempt = 0;
      this.options.onStatus('open');

      const pending = this.queue.splice(0, this.queue.length);
      for (const payload of pending) {
        socket.send(payload);
      }

      this.pingTimer = setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: 'ping' }));
        }
      }, PING_INTERVAL_MS);
    };

    socket.onmessage = (event: MessageEvent) => {
      this.options.onFrame(this.parse(event.data));
    };

    socket.onerror = () => {
      // onerror всегда сопровожждается onclose — переподключением занимается он.
    };

    socket.onclose = () => {
      this.detach(socket);

      if (this.stopped) {
        return;
      }

      this.scheduleReconnect();
    };
  }

  private parse(data: string): unknown {
    try {
      return JSON.parse(data) as unknown;
    } catch {
      return { type: 'unknown', content: data };
    }
  }

  private detach(socket: WebSocket | null): void {
    if (!socket) {
      return;
    }

    socket.onopen = null;
    socket.onmessage = null;
    socket.onerror = null;
    socket.onclose = null;
  }

  private clearTimers(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private scheduleReconnect(): void {
    this.clearTimers();

    if (this.reconnectAttempt >= RECONNECT_MAX_ATTEMPTS) {
      this.options.onStatus('closed');
      return;
    }

    const delay = RECONNECT_BASE_DELAY_MS * 2 ** this.reconnectAttempt;
    this.reconnectAttempt += 1;

    this.reconnectTimer = setTimeout(() => {
      void this.open();
    }, delay);
  }
}
