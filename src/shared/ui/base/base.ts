import Handlebars from 'handlebars';

type EventName = keyof HTMLElementEventMap;
type EventCallback = (e: Event) => void;

export interface ComponentLike {
  element(): Element | null;
}
export interface BlockOwnProps {
  __children?: Array<{
    component: ComponentLike;
    embed(node: DocumentFragment): void;
  }>;
  __refs?: Record<string, Element>;
}

export interface ComponentConstructor<
  P extends BlockOwnProps = BlockOwnProps,
  E extends Partial<Record<keyof HTMLElementEventMap, Event>> = Partial<
    Record<keyof HTMLElementEventMap, Event>
  >,
  R extends Record<string, Element> = Record<string, Element>,
> {
  new (props: P): BaseBlock<P, E, R>;
  componentName: string;
}

export abstract class BaseBlock<
  Props extends BlockOwnProps = BlockOwnProps,
  Emap extends Partial<Record<EventName, Event>> = Partial<Record<EventName, Event>>,
  Refs extends Record<string, Element> = Record<string, Element>,
> {
  protected abstract template: string;
  protected refs: Refs = {} as Refs;
  protected props = {} as Props;
  protected events: Partial<{ [K in keyof Emap]: (e: Emap[K]) => void }> = {};
  private domElement: Element | null = null;
  protected children: ComponentLike[] = [];

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
  private unmountComponent() {
    if (this.domElement) {
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
    this.props = { ...this.props, ...props, __children: [], __refs: {} } as Props;
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
