import { collectFormValues, registerComponent, validations } from '../../../shared/lib';
import { ChatMessage, messagesService, type Message } from '../../../entities/message';
import { BaseBlock, type BaseProps } from '../../../shared/ui';
import template from './chat-direct.hbs';
import './chat-direct.scss';

registerComponent(ChatMessage);

interface ChatDirectProps extends BaseProps {
  name: string;
  avatarUrl: string | null;
  messages: Message[];
}

export class ChatDirect extends BaseBlock<ChatDirectProps> {
  static componentName = 'ChatDirect';
  protected template = template;

  private setOpen(menu: HTMLElement, open: boolean): void {
    menu.classList.toggle('drop-menu--open', open);
    menu.querySelector('[data-action="toggle-menu"]')?.setAttribute('aria-expanded', String(open));
  }

  private closeMenus(except?: HTMLElement | null): void {
    this.element()
      ?.querySelectorAll<HTMLElement>('.drop-menu')
      .forEach((menu) => {
        if (menu !== except) {
          this.setOpen(menu, false);
        }
      });
  }

  /** Страница создаёт виджет императивно, без unmount — отписываемся, когда элемент отсоединён от DOM */
  private readonly onDocumentClick = (event: Event): void => {
    const root = this.element();
    if (!root || !root.isConnected) {
      document.removeEventListener('click', this.onDocumentClick);
      return;
    }

    if (event.target instanceof Node && !root.contains(event.target)) {
      this.closeMenus();
    }
  };

  protected componentDidMount(): void {
    document.addEventListener('click', this.onDocumentClick);
  }

  protected componentWillUnmount(): void {
    document.removeEventListener('click', this.onDocumentClick);
  }

  protected events = {
    click: (event: Event) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const trigger = target.closest('[data-action="toggle-menu"]');
      const menu = trigger?.closest<HTMLElement>('.drop-menu');

      if (!menu) {
        // выбор пункта меню и клик по чату закрывают раскрытый список
        this.closeMenus();
        return;
      }

      const opened = !menu.classList.contains('drop-menu--open');
      this.closeMenus(menu);
      this.setOpen(menu, opened);
    },

    keydown: (event: Event) => {
      if (event instanceof KeyboardEvent && event.key === 'Escape') {
        this.closeMenus();
      }
    },

    submit: (e: Event) => {
      e.preventDefault();

      const form = e.target;
      if (!(form instanceof HTMLFormElement)) {
        return;
      }

      const values = collectFormValues(form);
      const error = validations.required(values.message);
      if (error) {
        console.log(error);
        return;
      }

      messagesService.send(values);
      form.reset();
    },
  };
}
