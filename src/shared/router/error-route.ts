import { UnauthorizedError } from '../api';

/**
 * Маршрут-ответ на сбой запроса: 401 — сессия истекла, на вход;
 * остальные ошибки (5xx, нет связи) — на страницу ошибки.
 */
export function errorRouteFor(error: unknown): string {
  return error instanceof UnauthorizedError ? '/' : '/500';
}
