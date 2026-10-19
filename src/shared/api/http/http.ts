import { utils } from '../../lib';
import { createRequestError, TransportError } from './request-error';

// Адрес можно подменить на локальную заглушку: VITE_API_BASE_URL=http://localhost:4111 npm run dev
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://ya-praktikum.tech/api/v2';
const REQUEST_TIMEOUT_MS = 10_000;

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export type HttpQuery = Record<string, string | number | boolean | null | undefined>;
export type HttpBody = Record<string, unknown> | FormData;

export class Http {
  readonly baseUrl: string;
  /** Транспорт ничего не знает о сессии: реакцию на 401 подключает composition root */
  onUnauthorized: (() => void) | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  get<T>(path: string, query?: HttpQuery): Promise<T> {
    return this.request<T>('GET', path, query);
  }

  post<T>(path: string, body?: HttpBody): Promise<T> {
    return this.request<T>('POST', path, undefined, body);
  }

  put<T>(path: string, body?: HttpBody): Promise<T> {
    return this.request<T>('PUT', path, undefined, body);
  }

  delete<T>(path: string, body?: HttpBody): Promise<T> {
    return this.request<T>('DELETE', path, undefined, body);
  }

  private request<T>(
    method: HttpMethod,
    path: string,
    query?: HttpQuery,
    body?: HttpBody
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(method, this.buildUrl(path, query));

      // Сессия Практикум API живёт в cookie: без флага браузер не приложит её к запросу,
      // и даже сразу после входа сервер отвечал бы 401.
      xhr.withCredentials = true;

      // У FormData браузер сам проставит Content-Type с boundary — руками не трогать.
      if (body && !(body instanceof FormData)) {
        xhr.setRequestHeader('Content-Type', 'application/json;charset=utf-8');
      }

      xhr.timeout = REQUEST_TIMEOUT_MS;

      xhr.onload = () => {
        const parsed = this.parseBody(xhr);

        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(parsed as T);
          return;
        }

        if (xhr.status === 401) {
          this.onUnauthorized?.();
        }

        reject(createRequestError(xhr.status, parsed));
      };

      xhr.onerror = () => {
        reject(new TransportError('Нет соединения с сервером'));
      };

      xhr.ontimeout = () => {
        reject(new TransportError('Превышено время ожидания ответа сервера'));
      };

      xhr.send(this.serializeBody(body));
    });
  }

  private buildUrl(path: string, query?: HttpQuery): string {
    const url = `${this.baseUrl}/${path.replace(/^\//, '')}`;

    if (!query || Object.keys(query).length === 0) {
      return url;
    }

    return `${url}?${utils.queryString.stringify(query)}`;
  }

  private serializeBody(body?: HttpBody): XMLHttpRequestBodyInit | null {
    if (body === undefined) {
      return null;
    }

    if (body instanceof FormData) {
      return body;
    }

    return JSON.stringify(body);
  }

  private parseBody(xhr: XMLHttpRequest): unknown {
    if (xhr.status === 204 || xhr.responseText === '') {
      return undefined;
    }

    try {
      return JSON.parse(xhr.responseText) as unknown;
    } catch {
      return xhr.responseText;
    }
  }
}

export const http = new Http(API_BASE_URL);
