import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BaseBlock, type BaseProps, type BaseRefs, type ComponentLike } from './base';

interface TestProps extends BaseProps {
  title?: string;
}

class TestBlock extends BaseBlock<TestProps, BaseRefs> {
  protected template =
    '<div class="root"><p ref="title">{{title}}</p><button ref="btn" type="button">жми</button></div>';

  onClick = vi.fn();

  mounted = vi.fn();
  unmounted = vi.fn();

  events = { click: this.onClick };

  protected componentDidMount(): void {
    this.mounted();
  }

  protected componentWillUnmount(): void {
    this.unmounted();
  }
}

/** element() формально nullable — в тесте узел всегда есть. */
function mount(block: TestBlock, container: HTMLElement): void {
  const element = block.element();
  if (element) {
    container.replaceChildren(element);
  }
}

describe('BaseBlock', () => {
  let container: HTMLElement;
  let block: TestBlock;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.replaceChildren(container);
    block = new TestBlock({ title: 'заголовок' });
    mount(block, container);
  });

  afterEach(() => {
    document.body.replaceChildren();
  });

  const root = () => container.querySelector('.root') as HTMLElement;

  it('element() рендерит шаблон один раз и тот же узел при повторном вызове', () => {
    const first = block.element();

    expect(container.querySelector('.root')).toBe(first);
    expect(block.element()).toBe(first);
    expect(block.mounted).toHaveBeenCalledTimes(1);
  });

  it('собирает refs по атрибуту и снимает атрибут с DOM', () => {
    const refs = (block as unknown as { refs: BaseRefs }).refs;

    expect(refs.title?.textContent).toBe('заголовок');
    expect(refs.btn?.tagName).toBe('BUTTON');
    expect(container.querySelector('[ref]')).toBeNull();
  });

  it('экранирует HTML в props — подставленный контент не становится разметкой', () => {
    block.setProps({ title: '<script id="evil">x</script><b>жирный</b>' });

    expect(container.querySelector('#evil')).toBeNull();
    expect(container.querySelector('b')).toBeNull();
    expect(root().querySelector('.x') === null).toBe(true);
    expect((block as unknown as { refs: BaseRefs }).refs.title?.textContent).toBe(
      '<script id="evil">x</script><b>жирный</b>'
    );
  });

  it('events вешаются на корень и всплывают от детей', () => {
    const refs = (block as unknown as { refs: BaseRefs }).refs;
    refs.btn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(block.onClick).toHaveBeenCalledTimes(1);
  });

  it('setProps делает partial-merge props и пересоздаёт DOM', () => {
    const before = block.element();

    block.setProps({ title: 'новый' });

    expect(container.querySelector('.root')).not.toBe(before);
    expect((block as unknown as { refs: BaseRefs }).refs.title?.textContent).toBe('новый');
    expect(block.mounted).toHaveBeenCalledTimes(2);
  });

  it('unmountComponent снимает слушатели, зовёт хук и больше не реагирует', () => {
    const refs = (block as unknown as { refs: BaseRefs }).refs;
    const btn = refs.btn as Element;

    block.unmountComponent();
    btn.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(block.onClick).not.toHaveBeenCalled();
    expect(block.unmounted).toHaveBeenCalledTimes(1);
  });

  it('размонтирует детей из __children', () => {
    const child: ComponentLike = { element: vi.fn(() => null), unmountComponent: vi.fn() };
    const withChildren = new TestBlock({
      title: 'с ребёнком',
      __children: [{ component: child, embed: () => undefined }],
    });
    mount(withChildren, container);

    withChildren.unmountComponent();

    expect(child.unmountComponent).toHaveBeenCalledTimes(1);
  });
});
