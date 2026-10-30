import { describe, expect, it, vi } from 'vitest';

import { Route, type Navigation, type PageProps } from './route';

class StubPage {
  props: PageProps;

  element = vi.fn(() => null);
  unmountComponent = vi.fn();

  constructor(props: PageProps) {
    this.props = props;
  }
}

const navigation: Navigation = { navigate: vi.fn() };

const makeRoute = (path: string) => new Route({ path, Page: StubPage }, navigation);

describe('Route.match', () => {
  it('сопоставляет точный путь и возвращает пустые параметры', () => {
    expect(makeRoute('/sign-up').match('/sign-up')).toEqual({});
  });

  it('нормализует отсутствующий и лишние слэши', () => {
    expect(makeRoute('sign-up/').match('/sign-up')).toEqual({});
    expect(makeRoute('/').match('/')).toEqual({});
  });

  it('достаёт один параметр из сегмента', () => {
    expect(makeRoute('/messenger/:chatId').match('/messenger/42')).toEqual({ chatId: '42' });
  });

  it('достаёт несколько именованных параметров', () => {
    const route = makeRoute('/a/:first/b/:second');

    expect(route.match('/a/1/b/2')).toEqual({ first: '1', second: '2' });
  });

  it('не пропускает лишние сегменты', () => {
    expect(makeRoute('/messenger/:chatId').match('/messenger/1/extra')).toBeNull();
  });

  it('раскодирует percent-encoding в параметрах', () => {
    expect(makeRoute('/search/:term').match('/search/%D1%87%D0%B0%D1%82')).toEqual({
      term: 'чат',
    });
  });

  it('не превращает точки пути в регулярку', () => {
    const route = makeRoute('/a.b');

    expect(route.match('/axb')).toBeNull();
    expect(route.match('/a.b')).toEqual({});
  });

  it('не совпадает префикс чужого пути', () => {
    expect(makeRoute('/messenger').match('/messenger/1')).toBeNull();
  });
});

describe('Route.render', () => {
  it('подмешивает props конфигурации, params, query и navigation в пропсы страницы', () => {
    const route = new Route(
      { path: '/messenger/:chatId', Page: StubPage, props: { ref: 'extra' } },
      navigation
    );

    const page = route.render({ chatId: '7' }, { page: ['2'] }) as StubPage;

    expect(page.props.params).toEqual({ chatId: '7' });
    expect(page.props.query).toEqual({ page: ['2'] });
    expect(page.props.navigation).toBe(navigation);
    expect(page.props.ref).toBe('extra');
  });
});
