import type { BaseProps } from '../ui';

export type RouteParams = Record<string, string>;
export type RouteQuery = Record<string, string | string[]>;

/** Узкий интерфейс навигации, который Router внедряет в пропсы каждой страницы. */
export interface Navigation {
  navigate(path: string, query?: Record<string, string | number>): void;
}

/**
 * Пропсы страницы. `params`, `query` и `navigation` заполняет роутер,
 * остальное — конфиг маршрута (`RouteConfig.props`).
 */
export interface PageProps extends BaseProps {
  params: RouteParams;
  query: RouteQuery;
  navigation: Navigation;
}

export interface PageInstance {
  element(): Element | null;
}

export type PageConstructor = new (props: PageProps) => PageInstance;

export interface RouteConfig {
  /** Путь с параметрами: '/messenger/:chatId' */
  path: string;
  Page: PageConstructor;
  /**
   * Дополнительные пропсы страницы, не приходящие из URL.
   * `navigation` добавляет Router при регистрации маршрута.
   */
  props?: Partial<Omit<PageProps, 'params' | 'query'>>;
}

function normalizePath(path: string): string {
  const withLeadingSlash = path.startsWith('/') ? path : `/${path}`;
  const withoutTrailingSlash = withLeadingSlash.replace(/\/+$/, '');

  return withoutTrailingSlash === '' ? '/' : withoutTrailingSlash;
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function decodeParam(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export class Route {
  readonly path: string;

  private readonly Page: PageConstructor;
  private readonly baseProps: Omit<PageProps, 'params' | 'query'>;
  private readonly pattern: RegExp;
  private readonly paramNames: string[];

  /** `navigation` внедряет Router — страницы навигируют без перезагрузки. */
  constructor(config: RouteConfig, navigation: Navigation) {
    this.path = normalizePath(config.path);
    this.Page = config.Page;
    this.baseProps = { ...config.props, navigation };

    const segments = this.path.split('/').filter((segment) => segment !== '');

    this.paramNames = [];
    const source = segments
      .map((segment) => {
        if (!segment.startsWith(':')) {
          return escapeRegExp(segment);
        }

        this.paramNames.push(segment.slice(1));
        return '([^/]+)';
      })
      .join('/');

    this.pattern = new RegExp(`^/${source}$`);
  }

  /** Возвращает параметры, если pathname подходит маршруту, иначе null. */
  match(pathname: string): RouteParams | null {
    const found = this.pattern.exec(normalizePath(pathname));

    if (!found) {
      return null;
    }

    const params: RouteParams = {};
    this.paramNames.forEach((name, index) => {
      params[name] = decodeParam(found[index + 1]);
    });

    return params;
  }

  render(params: RouteParams, query: RouteQuery): Element | null {
    const page = new this.Page({
      ...this.baseProps,
      params,
      query,
    });

    return page.element();
  }
}
