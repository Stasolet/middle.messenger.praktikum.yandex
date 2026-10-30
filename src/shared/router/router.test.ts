import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Router, type RouterOptions } from './router';
import { type PageInstance, type PageProps, type RouteConfig } from './route';

/** Страницы-заглушки: помнят props, отмечают монтирование и размонтирование. */
class StubPage implements PageInstance {
  static created: StubPage[] = [];

  props: PageProps;

  unmounted = false;

  private readonly tag: string;

  constructor(tag: string, props: PageProps) {
    this.tag = tag;
    this.props = props;
    StubPage.created.push(this);
  }

  element(): Element | null {
    const div = document.createElement('div');
    div.className = `page page--${this.tag}`;
    div.dataset.params = JSON.stringify(this.props.params);
    div.dataset.query = JSON.stringify(this.props.query);

    return div;
  }

  unmountComponent(): void {
    this.unmounted = true;
  }
}

function page(tag: string): RouteConfig['Page'] {
  return class implements PageInstance {
    constructor(props: PageProps) {
      this.__page = new StubPage(tag, props);
    }

    private __page: StubPage;

    element = () => this.__page.element();

    unmountComponent = () => this.__page.unmountComponent();
  };
}

function currentStub(): StubPage {
  return StubPage.created[StubPage.created.length - 1];
}

function renderedClass(container: HTMLElement): string {
  return container.firstElementChild?.className ?? '(пусто)';
}

describe('Router', () => {
  let container: HTMLElement;
  let activeRouter: Router | null = null;

  const routes = () => ({
    root: { path: '/', Page: page('root') },
    login: { path: '/login', Page: page('login') },
    chat: { path: '/messenger/:chatId', Page: page('chat') },
    notFound: { path: '/404', Page: page('404') },
  });

  function makeRouter(options?: RouterOptions) {
    const router = new Router(container, options);
    const r = routes();
    router.add(r.root).add(r.login).add(r.chat).notFound(r.notFound);
    router.start();
    activeRouter = router;

    return { router, r };
  }

  beforeEach(() => {
    StubPage.created = [];
    container = document.createElement('div');
    document.body.replaceChildren(container);
    history.replaceState({}, '', '/');
  });

  afterEach(() => {
    // слушатели живут на window/document: без destroy прежние роутеры перехватывали события новых тестов
    activeRouter?.destroy();
    activeRouter = null;
  });

  it('start() рисует страницу текущего URL с параметрами пути', () => {
    history.replaceState({}, '', '/messenger/12');
    makeRouter();

    expect(renderedClass(container)).toContain('page--chat');
    expect(JSON.parse(container.firstElementChild?.getAttribute('data-params') ?? '{}')).toEqual({
      chatId: '12',
    });
  });

  it('navigate меняет страницу, размонтирует прежнюю и добавляет запись истории', () => {
    const { router } = makeRouter();
    const before = history.length;

    router.navigate('/messenger/7');

    expect(renderedClass(container)).toContain('page--chat');
    expect(location.pathname).toBe('/messenger/7');
    expect(history.length).toBe(before + 1);
    expect(StubPage.created[0].unmounted).toBe(true);
  });

  it('navigate на тот же URL не дублирует запись истории', () => {
    const { router } = makeRouter();
    router.navigate('/login');
    const length = history.length;

    router.navigate('/login');

    expect(history.length).toBe(length);
    expect(location.pathname).toBe('/login');
  });

  it('navigate передаёт query в пропсы страницы', () => {
    const { router } = makeRouter();

    router.navigate('/login', { redirect: '/messenger' });

    expect(location.search).toBe('?redirect=%2Fmessenger');
    expect(JSON.parse(container.firstElementChild?.getAttribute('data-query') ?? '{}')).toEqual({
      redirect: '/messenger',
    });
  });

  it('неизвестный путь рисует notFound-маршрут', () => {
    history.replaceState({}, '', '/no-such-page');
    makeRouter();

    expect(renderedClass(container)).toContain('page--404');
  });

  it('guard переадресует protected-путь гостя без выхода наружу', () => {
    history.replaceState({}, '', '/messenger/3');
    const guard = vi.fn(() => '/login');
    makeRouter({ guard });

    expect(guard).toHaveBeenCalledWith('/messenger/3');
    expect(renderedClass(container)).toContain('page--login');
    expect(location.pathname).toBe('/login');
  });

  it('клик по внутренней ссылке перехватывается роутером', () => {
    const { router } = makeRouter();
    const before = history.length;
    const link = document.createElement('a');
    link.href = '/login';
    document.body.appendChild(link);

    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }));

    expect(renderedClass(container)).toContain('page--login');
    expect(history.length).toBe(before + 1);
    void router;
  });

  it('ссылка с data-no-router остаётся браузеру', () => {
    const { router } = makeRouter();
    const link = document.createElement('a');
    link.href = '/login';
    link.dataset.noRouter = 'true';
    document.body.appendChild(link);
    const event = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 });

    const prevented = link.dispatchEvent(event);

    expect(prevented).toBe(true);
    expect(router).toBeDefined();
  });

  it('popstate перерисовывает страницу на актуальный URL', () => {
    const { router } = makeRouter();
    router.navigate('/messenger/5');

    history.pushState({}, '', '/login');
    window.dispatchEvent(new PopStateEvent('popstate', { state: {} }));

    expect(renderedClass(container)).toContain('page--login');
  });

  it('программный navigate из пропсов страницы ведёт через тот же роутер', () => {
    makeRouter();
    currentStub().props.navigation.navigate('/messenger/9');

    expect(renderedClass(container)).toContain('page--chat');
    expect(location.pathname).toBe('/messenger/9');
  });
});
