import { utils } from '../lib';
import { Route, type PageInstance, type RouteConfig, type RouteQuery } from './route';

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
  private currentPage: PageInstance | null = null;

  /** Адрес страницы, отрисованной сейчас: на него сравниваются переходы, чтобы не пересобирать её. */
  private renderedPathname: string | null = null;

  private renderedSearch: string | null = null;

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

  /** Отвязка слушателей и размонтирование последней страницы. */
  destroy(): void {
    window.removeEventListener('popstate', this.onPopState);
    document.removeEventListener('click', this.onDocumentClick);
    this.currentPage?.unmountComponent();
    this.currentPage = null;
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
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
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

    const url = redirect
      ? new URL(redirect, location.origin)
      : new URL(`${pathname}${search}`, location.origin);

    const sameUrl = url.pathname === location.pathname && url.search === location.search;

    // переход на тот же URL не должен добавлять в историю дубликат записи
    if (replace || sameUrl) {
      history.replaceState({}, '', url.href);
    } else {
      history.pushState({}, '', url.href);
    }

    // страница на этом адресе уже отрисована: пересобирать её (с потерей фокуса и соединений) не нужно.
    // Сверяется с отрисованным адресом, а не с location: при popstate браузер уже сменил адрес.
    if (
      this.currentPage &&
      url.pathname === this.renderedPathname &&
      url.search === this.renderedSearch
    ) {
      return;
    }

    this.renderedPathname = url.pathname;
    this.renderedSearch = url.search;
    this.renderRoute(url.pathname, url.search);
  }

  private renderRoute(pathname: string, search: string): void {
    const query: RouteQuery = utils.queryString.parse(search);

    const matched = this.routes.find((route) => route.match(pathname) !== null);
    const route = matched ?? this.notFoundRoute;

    if (!route) {
      // Не задан notFound — остаётся текущая страница; конфигурация, а не авария.
      return;
    }

    // размонтирование до создания новой страницы: обработчики прежней не должны получать её события
    this.currentPage?.unmountComponent();

    const page = route.render(route.match(pathname) ?? {}, query);
    this.currentPage = page;

    const element = page.element();
    if (element) {
      this.container.replaceChildren(element);
    }
  }
}
