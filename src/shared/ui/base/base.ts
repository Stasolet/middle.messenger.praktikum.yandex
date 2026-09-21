import Handlebars from 'handlebars';

type EventName = keyof HTMLElementEventMap;
export type EventCallback<E extends Event = Event> = (e: E) => void;

export interface ComponentLike {
  element(): Element | null;
  unmountComponent(): void;
}

export type BaseRefs = Record<string, Element>;
export type ChildComponentsMap = Record<string, ComponentLike>;
export interface BaseProps<
  Refs extends BaseRefs = BaseRefs,
  Child extends ChildComponentsMap = ChildComponentsMap,
> {
  __children?: Array<{
    component: ComponentLike;
    embed(node: DocumentFragment): void;
  }>;
  __refs?: Refs;
  __namedChildren?: Child;
  ref?: string;
}

export interface ComponentConstructor<
  P extends BaseProps = BaseProps,
  R extends BaseRefs = BaseRefs,
> {
  new (props: P): BaseBlock<P, R>;
  componentName: string;
}

export abstract class BaseBlock<
  Props extends BaseProps = BaseProps,
  Refs extends BaseRefs = BaseRefs,
> {
  protected abstract template: string;
  protected refs: Refs = {} as Refs;
  protected props = {} as Props;
  protected events: Partial<{ [K in EventName]: EventCallback }> = {};
  private domElement: Element | null = null;
  protected children: ComponentLike[] = [];
  protected namedChildren: ChildComponentsMap = {};
  constructor(props: Props = {} as Props) {
    this.props = props;
  }

  private compile(): Element | null {
    const html = Handlebars.compile(this.template)(this.props);
    const templateElement = document.createElement('template');
    templateElement.innerHTML = html;
    const fragment = templateElement.content;

    if (this.props.__children) {
      this.children = this.props.__children.map((child) => child.component);
      this.props.__children.forEach((child) => child.embed(fragment));
    }
    if (this.props.__namedChildren) {
      this.namedChildren = { ...this.props.__namedChildren };
    }
    const defaultRefs = (this.props.__refs ?? {}) as Partial<Refs>;
    this.refs = { ...defaultRefs } as Refs;
    for (const element of fragment.querySelectorAll('[ref]')) {
      const key = element.getAttribute('ref') as keyof Refs;

      if (key) {
        // Записываем элемент, приводя его к правильному типу значения из Refs
        this.refs[key] = element as Refs[keyof Refs];
        element.removeAttribute('ref');
      }
    }
    return templateElement.content.firstElementChild;
  }
  protected componentDidMount() {}
  private mountComponent() {
    this.attachListeners();
    this.componentDidMount();
  }
  protected componentWillUnmount() {}
  protected unmountComponent() {
    if (this.domElement) {
      this.children.forEach((child) => child.unmountComponent());

      this.removeListeners();
      this.componentWillUnmount();
    }
  }
  protected render() {
    const fragment = this.compile();
    if (this.domElement && fragment) {
      this.unmountComponent();
      this.domElement.replaceWith(fragment);
    }

    this.domElement = fragment;
    this.mountComponent();
  }
  public element(): Element | null {
    if (!this.domElement) {
      this.render();
    }

    return this.domElement;
  }
  public setProps(props: Partial<Props>) {
    this.props = {
      ...this.props,
      ...props,
      __children: [],
      __refs: {},
      __namedChildren: {},
    } as Props;
    this.render();
  }

  private attachListeners() {
    const entries = Object.entries(this.events) as [EventName, EventCallback][];
    for (const [eventName, callback] of entries) {
      if (callback) {
        this.domElement!.addEventListener(eventName, callback);
      }
    }
  }
  private removeListeners() {
    const entries = Object.entries(this.events) as [EventName, EventCallback][];
    for (const [eventName, callback] of entries) {
      if (typeof callback === 'function' && this.domElement) {
        this.domElement.removeEventListener(eventName, callback);
      }
    }
  }
}
