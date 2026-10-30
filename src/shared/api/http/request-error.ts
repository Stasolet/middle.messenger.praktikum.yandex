/** Ошибка HTTP-ответа: сервер обработал запрос и ответил статусом вне 2xx. */
export class RequestError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'RequestError';
    this.status = status;
  }
}

export class BadRequestError extends RequestError {
  constructor(message: string) {
    super(400, message);
    this.name = 'BadRequestError';
  }
}

export class UnauthorizedError extends RequestError {
  constructor(message: string) {
    super(401, message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends RequestError {
  constructor(message: string) {
    super(403, message);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends RequestError {
  constructor(message: string) {
    super(404, message);
    this.name = 'NotFoundError';
  }
}

export class ServerError extends RequestError {
  constructor(status: number, message: string) {
    super(status, message);
    this.name = 'ServerError';
  }
}

/** Сбой на уровне транспорта: нет сети, таймаут, сервер не ответил. */
export class TransportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TransportError';
  }
}

const FALLBACK_MESSAGE_BY_STATUS: Record<number, string> = {
  400: 'Некорректные данные запроса',
  401: 'Пользователь не авторизован',
  403: 'Доступ запрещён',
  404: 'Запрошенный ресурс не найден',
};

/**
 * Практикум API в ошибочном ответе отдаёт текст в `reason` (аутентификация,
 * 409 и др.), иногда дублируя его техническим `error: "Bad format"`; у части
 * ручек — `{ error }` или `{ code, description }`. Берём сообщение оттуда,
 * иначе подставляем общее по статусу.
 */
function resolveErrorMessage(status: number, body: unknown): string {
  if (typeof body === 'string' && body) {
    return body;
  }

  if (body && typeof body === 'object') {
    const { error, description, reason } = body as {
      error?: unknown;
      description?: unknown;
      reason?: unknown;
    };

    // reason конкретнее error: при 400 сервер кладёт в error заглушку "Bad format".
    if (typeof reason === 'string' && reason) {
      return reason;
    }

    if (typeof error === 'string' && error) {
      return error;
    }

    if (typeof description === 'string' && description) {
      return description;
    }
  }

  return FALLBACK_MESSAGE_BY_STATUS[status] ?? `Ошибка запроса (код ${status})`;
}

/** Текст ошибки для показа человеку: сообщение сервера, а если его нет — общий текст. */
export function errorMessage(error: unknown): string {
  return error instanceof Error && error.message ? error.message : 'Не удалось выполнить запрос';
}

export function createRequestError(status: number, body: unknown): RequestError {
  const message = resolveErrorMessage(status, body);

  if (status >= 500) {
    return new ServerError(status, message);
  }

  switch (status) {
    case 400:
      return new BadRequestError(message);
    case 401:
      return new UnauthorizedError(message);
    case 403:
      return new ForbiddenError(message);
    case 404:
      return new NotFoundError(message);
    default:
      return new RequestError(status, message);
  }
}
