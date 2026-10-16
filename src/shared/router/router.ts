import { utils } from '../lib';
import { Route, type RouteConfig, type RouteQuery } from './route';

export interface RouterOptions {
  /**
   * Middleware перехода: возвращает путь для переадресации либо null,
   * если переход разрешён.
   */
  guard?: (pathname: string) => string | null;
}

export class Router {
  private readonly routes: Route[] = [];
  private notFoundRoute: Route | null = null;
  private guard: ((pathname: string) => string | null) | null = null;

  private readonly container: HTMLElement;

  constructor(container: HTMLElement, options: RouterOptions = {}) {
    this.container = container;
    this.guard = options.guard ?? null;
  }

  add(config: RouteConfig): this {
    this.routes.push(new Route(config, this));
    return this;
  }

  /** Маршрут, отображаемый, когда pathname не совпал ни с одним из add(). */
  notFound(config: RouteConfig): this {
    this.notFoundRoute = new Route(config, this);
    return this;
  }

  /** Отрисовать текущий URL и подключить историю/клики по ссылкам. */
  start(): void {
    window.addEventListener('popstate', this.onPopState);
    document.addEventListener('click', this.onDocumentClick);

    this.renderAt(location.pathname, location.search, { replace: true });
  }

  /** Программный переход: /messenger/:chatId и т.п. */
  navigate(path: string, query?: Record<string, string | number>): void {
    const url = this.buildUrl(path, query);
    this.renderAt(new URL(url, location.origin).pathname, new URL(url, location.origin).search, {
      replace: false,
    });
  }

  private onPopState = (): void => {
    this.renderAt(location.pathname, location.search, { replace: true });
  };

  /**
   * Перехват кликов по ссылкам на тот же источник: переход без перезагрузки.
   * Служебные случаи (target, download, модификаторы клавиш) остаются браузеру.
   */
  private onDocumentClick = (event: MouseEvent): void => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey) {
      return;
    }

    const target = event.target;
    const anchor = target instanceof Element ? target.closest('a') : null;
    if (!anchor) {
      return;
    }

    const href = anchor.getAttribute('href');
    if (!href || anchor.target || anchor.hasAttribute('download') || anchor.dataset.noRouter) {
      return;
    }

    const url = new URL(href, location.origin);
    if (url.origin !== location.origin) {
      return;
    }

    event.preventDefault();
    this.renderAt(url.pathname, url.search, { replace: false });
  };

  private buildUrl(path: string, query?: Record<string, string | number>): string {
    if (!query || Object.keys(query).length === 0) {
      return path;
    }

    return `${path}?${utils.queryString.stringify(query)}`;
  }

  private renderAt(pathname: string, search: string, { replace }: { replace: boolean }): void {
    const redirect = this.guard?.(pathname);
    if (redirect !== null && redirect !== undefined) {
      const target = new URL(redirect, location.origin);

      if (replace) {
        history.replaceState({}, '', target.href);
      } else {
        history.pushState({}, '', target.href);
      }

      this.renderRoute(target.pathname, target.search);
      return;
    }

    if (replace) {
      history.replaceState({}, '', `${pathname}${search}`);
    } else {
      history.pushState({}, '', `${pathname}${search}`);
    }

    this.renderRoute(pathname, search);
  }

  private renderRoute(pathname: string, search: string): void {
    const query: RouteQuery = utils.queryString.parse(search);

    const matched = this.routes.find((route) => route.match(pathname) !== null);
    const route = matched ?? this.notFoundRoute;

    if (!route) {
      // Не задан notFound — остаётся текущая страница; конфигурация, а не авария.
      return;
    }

    const element = route.render(route.match(pathname) ?? {}, query);

    if (element) {
      this.container.replaceChildren(element);
    }
  }
}
