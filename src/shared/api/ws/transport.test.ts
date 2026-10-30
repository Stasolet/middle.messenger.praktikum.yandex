import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { WsTransport } from './transport';

/** Заменяет нативный WebSocket: серверные события дергают тест руками. */
class FakeWebSocket {
  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSING = 2;
  static readonly CLOSED = 3;

  static instances: FakeWebSocket[] = [];

  readyState = FakeWebSocket.CONNECTING;
  sent: string[] = [];

  url: string;

  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: (() => void) | null = null;
  onclose: (() => void) | null = null;

  constructor(url: string) {
    this.url = url;
    FakeWebSocket.instances.push(this);
  }

  static get last(): FakeWebSocket {
    return FakeWebSocket.instances[FakeWebSocket.instances.length - 1];
  }

  send(data: string): void {
    this.sent.push(data);
  }

  close(): void {
    this.readyState = FakeWebSocket.CLOSED;
    this.onclose?.();
  }

  /** Сервер принял handshake. */
  accept(): void {
    this.readyState = FakeWebSocket.OPEN;
    this.onopen?.();
  }

  /** Сервер прислал кадр. */
  emit(data: unknown): void {
    this.onmessage?.({ data: JSON.stringify(data) });
  }

  /** Сервер оборвал соединение. */
  drop(): void {
    this.readyState = FakeWebSocket.CLOSED;
    this.onclose?.();
  }
}

const connect = vi.hoisted(() => async () => 'wss://test/ws/chats/1/2/3');

describe('WsTransport', () => {
  let frames: unknown[];
  let statuses: string[];

  beforeEach(() => {
    vi.useFakeTimers();
    FakeWebSocket.instances = [];
    frames = [];
    statuses = [];
    vi.stubGlobal('WebSocket', FakeWebSocket);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  function makeTransport(urlFactory: () => Promise<string> = connect) {
    const transport = new WsTransport({
      url: urlFactory,
      onFrame: (frame) => frames.push(frame),
      onStatus: (status) => statuses.push(status),
    });
    transport.connect();
    return transport;
  }

  it('создаёт сокет по URL из фабрики после её разрешения', async () => {
    makeTransport();
    await vi.waitFor(() => expect(FakeWebSocket.instances).toHaveLength(1));

    expect(FakeWebSocket.instances[0].url).toBe('wss://test/ws/chats/1/2/3');
    expect(statuses).toEqual(['connecting']);
  });

  it('откладывает команды до открытия и отправляет их по порядку', async () => {
    const transport = makeTransport();
    await vi.waitFor(() => expect(FakeWebSocket.instances).toHaveLength(1));

    transport.send({ type: 'message', content: 'первое' });
    transport.send({ type: 'message', content: 'второе' });
    expect(FakeWebSocket.instances[0].sent).toEqual([]);

    FakeWebSocket.instances[0].accept();
    expect(FakeWebSocket.instances[0].sent).toEqual([
      JSON.stringify({ type: 'message', content: 'первое' }),
      JSON.stringify({ type: 'message', content: 'второе' }),
    ]);
    expect(transport.status).toBe('open');
  });

  it('разбирает кадры сервера и превращает не-JSON в unknown-кадр', async () => {
    const transport = makeTransport();
    await vi.waitFor(() => expect(FakeWebSocket.instances).toHaveLength(1));

    const socket = FakeWebSocket.instances[0];
    socket.accept();
    socket.emit({ type: 'message', content: 'hi' });
    socket.onmessage?.({ data: '[1,2]' });
    socket.onmessage?.({ data: 'не json' });

    expect(frames).toEqual([
      { type: 'message', content: 'hi' },
      [1, 2],
      { type: 'unknown', content: 'не json' },
    ]);
    void transport;
  });

  it('держит соединение живым пингами каждые 25 секунд', async () => {
    makeTransport();
    await vi.waitFor(() => expect(FakeWebSocket.instances).toHaveLength(1));

    FakeWebSocket.instances[0].accept();
    await vi.advanceTimersByTimeAsync(50_000);

    const pings = FakeWebSocket.instances[0].sent.filter((data) => data.includes('"ping"'));
    expect(pings).toHaveLength(2);
  });

  it('переподключается с новой попытки и берёт URL заново', async () => {
    const urlFactory = vi.fn(connect);
    makeTransport(urlFactory);
    await vi.waitFor(() => expect(FakeWebSocket.instances).toHaveLength(1));

    FakeWebSocket.instances[0].drop();
    await vi.advanceTimersByTimeAsync(1_000);

    expect(FakeWebSocket.instances).toHaveLength(2);
    expect(urlFactory).toHaveBeenCalledTimes(2);
  });

  it('прекращает переподключения после пяти неудач и уходит в closed', async () => {
    makeTransport();
    await vi.waitFor(() => expect(FakeWebSocket.instances).toHaveLength(1));

    for (const attempt of [1_000, 2_000, 4_000, 8_000, 16_000]) {
      FakeWebSocket.last.drop();
      await vi.advanceTimersByTimeAsync(attempt);
    }

    expect(FakeWebSocket.instances).toHaveLength(6);
    FakeWebSocket.last.drop();
    await vi.advanceTimersByTimeAsync(60_000);

    expect(FakeWebSocket.instances).toHaveLength(6);
    expect(statuses.at(-1)).toBe('closed');
  });

  it('локальное close не порождает переподключение', async () => {
    const transport = makeTransport();
    await vi.waitFor(() => expect(FakeWebSocket.instances).toHaveLength(1));

    FakeWebSocket.instances[0].accept();
    transport.close();
    await vi.advanceTimersByTimeAsync(60_000);

    expect(FakeWebSocket.instances).toHaveLength(1);
    expect(transport.status).toBe('closed');
  });

  it('переподключается и когда не удалось получить URL', async () => {
    const urlFactory = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(new Error('нет токена'))
      .mockResolvedValue('wss://test/ws/chats/1/2/4');

    makeTransport(urlFactory);
    await vi.advanceTimersByTimeAsync(1_000);

    expect(FakeWebSocket.instances).toHaveLength(1);
    expect(FakeWebSocket.instances[0].url).toBe('wss://test/ws/chats/1/2/4');
  });

  it('close() во время ожидания токена обрывает попытку: сокет не создаётся', async () => {
    let releaseUrl: (url: string) => void = () => {};
    const transport = new WsTransport({
      url: () => new Promise<string>((resolve) => (releaseUrl = resolve)),
      onFrame: () => {},
      onStatus: () => {},
    });

    transport.connect();
    transport.close();
    releaseUrl('wss://test/ws/chats/1/2/3');
    await vi.advanceTimersByTimeAsync(60_000);

    expect(FakeWebSocket.instances).toHaveLength(0);
    void transport;
  });

  it('отказ переподключений терминален, а повторный connect начинает с первой попытки', async () => {
    const transport = makeTransport();
    await vi.waitFor(() => expect(FakeWebSocket.instances).toHaveLength(1));

    for (const delay of [1_000, 2_000, 4_000, 8_000, 16_000]) {
      FakeWebSocket.last.drop();
      await vi.advanceTimersByTimeAsync(delay);
    }
    FakeWebSocket.last.drop();
    await vi.advanceTimersByTimeAsync(60_000);

    // статус закрыт по-настоящему: транспорт остановлен, очередь не копится
    expect(transport.status).toBe('closed');
    transport.send({ type: 'message', content: 'после отказа' });

    const before = FakeWebSocket.instances.length;
    transport.connect();
    await vi.waitFor(() => expect(FakeWebSocket.instances).toHaveLength(before + 1));

    // счётчик попыток сброшен: первый разрыв даёт переподключение, а не мгновенный отказ
    FakeWebSocket.last.drop();
    await vi.advanceTimersByTimeAsync(1_000);
    expect(FakeWebSocket.instances).toHaveLength(before + 2);
  });
});
