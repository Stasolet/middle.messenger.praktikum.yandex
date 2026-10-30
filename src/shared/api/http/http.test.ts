import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Http } from './http';
import { NotFoundError, ServerError, TransportError, UnauthorizedError } from './request-error';

/** Подменяет нативный XHR: ответ тест вызывает руками через respond/fail*. */
class FakeXHR {
  static last: FakeXHR | null = null;

  method = '';
  url = '';
  requestBody: unknown = undefined;
  headers: Record<string, string> = {};
  withCredentials = false;
  timeout = 0;

  status = 200;
  responseText = '';

  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  ontimeout: (() => void) | null = null;

  open(method: string, url: string): void {
    this.method = method;
    this.url = url;
    FakeXHR.last = this;
  }

  setRequestHeader(name: string, value: string): void {
    this.headers[name] = value;
  }

  send(body?: unknown): void {
    this.requestBody = body;
  }

  respond(status: number, responseText = ''): void {
    this.status = status;
    this.responseText = responseText;
    this.onload?.();
  }

  failNetwork(): void {
    this.onerror?.();
  }

  failTimeout(): void {
    this.ontimeout?.();
  }

  static expectLast(): FakeXHR {
    if (!FakeXHR.last) {
      throw new Error('запрос не был отправлен');
    }

    return FakeXHR.last;
  }
}

describe('Http', () => {
  const http = new Http('https://api.test/v2');

  beforeEach(() => {
    FakeXHR.last = null;
    vi.stubGlobal('XMLHttpRequest', FakeXHR);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('GET собирает URL с базой и query, режет слэши пути', async () => {
    const promise = http.get<{ ok: boolean }>('/chats', { limit: 20, title: 'раз' });
    FakeXHR.expectLast().respond(200, '{"ok":true}');

    await expect(promise).resolves.toEqual({ ok: true });

    const xhr = FakeXHR.expectLast();
    expect(xhr.method).toBe('GET');
    expect(xhr.url).toContain('/chats?limit=20');
    expect(xhr.url).toContain(`title=${encodeURIComponent('раз')}`);
    expect(xhr.withCredentials).toBe(true);
  });

  it('POST шлёт JSON-тело и content-type', async () => {
    const promise = http.post('/chats', { title: 'чат' });
    FakeXHR.expectLast().respond(200, '{"id":1}');
    await promise;

    const xhr = FakeXHR.expectLast();
    expect(xhr.method).toBe('POST');
    expect(xhr.headers['Content-Type']).toBe('application/json;charset=utf-8');
    expect(xhr.requestBody).toBe(JSON.stringify({ title: 'чат' }));
  });

  it('FormData уходит телом без ручного content-type', async () => {
    const form = new FormData();
    form.append('file', new Blob(['x']), 'f.txt');

    const promise = http.put('/avatar', form);
    FakeXHR.expectLast().respond(200, '{}');
    await promise;

    const xhr = FakeXHR.expectLast();
    expect(xhr.headers['Content-Type']).toBeUndefined();
    expect(xhr.requestBody).toBe(form);
  });

  it('пустое тело 204 резолвится undefined', async () => {
    const promise = http.delete<void>('/chats', { chatId: 1 });
    FakeXHR.expectLast().respond(204);

    await expect(promise).resolves.toBeUndefined();
  });

  it('401 отклоняет UnauthorizedError и зовёт onUnauthorized', async () => {
    const onUnauthorized = vi.fn();
    http.onUnauthorized = onUnauthorized;

    const promise = http.get('/auth/user');
    FakeXHR.expectLast().respond(401, '{"error":"Сессия истекла"}');

    await expect(promise).rejects.toBeInstanceOf(UnauthorizedError);
    expect(onUnauthorized).toHaveBeenCalledTimes(1);

    http.onUnauthorized = null;
  });

  it('сообщение ошибки берётся из server-тела', async () => {
    const promise = http.get('/chats');
    FakeXHR.expectLast().respond(404, '{"error":"Чат не найден"}');

    await expect(promise).rejects.toMatchObject({
      name: 'NotFoundError',
      status: 404,
      message: 'Чат не найден',
    });
  });

  it('5xx — ServerError со статусом', async () => {
    const promise = http.post('/chats', { title: 'x' });
    FakeXHR.expectLast().respond(500, '{"description":"Внутренняя ошибка"}');

    await expect(promise).rejects.toBeInstanceOf(ServerError);
    await expect(promise).rejects.toMatchObject({ status: 500, message: 'Внутренняя ошибка' });
  });

  it('нет сети — TransportError', async () => {
    const promise = http.get('/chats');
    FakeXHR.expectLast().failNetwork();

    await expect(promise).rejects.toBeInstanceOf(TransportError);
  });

  it('таймаут — TransportError', async () => {
    const promise = http.get('/chats');
    const xhr = FakeXHR.expectLast();
    expect(xhr.timeout).toBe(10_000);
    xhr.failTimeout();

    await expect(promise).rejects.toBeInstanceOf(TransportError);
  });

  it('не-JSON ответ ошибки остаётся текстом сообщения', async () => {
    const promise = http.get('/chats');
    FakeXHR.expectLast().respond(403, 'Forbidden');

    await expect(promise).rejects.toMatchObject({ name: 'ForbiddenError', message: 'Forbidden' });
  });

  it('404 без сообщения в теле получает общий текст', async () => {
    const promise = http.get('/chats');
    FakeXHR.expectLast().respond(404, '{}');

    await expect(promise).rejects.toBeInstanceOf(NotFoundError);
    await expect(promise).rejects.toMatchObject({ message: 'Запрошенный ресурс не найден' });
  });
});
