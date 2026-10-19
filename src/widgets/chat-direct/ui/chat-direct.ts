import { collectFormValues, registerComponent, validations } from '../../../shared/lib';
import { errorMessage } from '../../../shared/api';
import { ChatMessage, messagesService, type Message } from '../../../entities/message';
import { BaseBlock, type BaseProps, type BaseRefs } from '../../../shared/ui';
import template from './chat-direct.hbs';
import './chat-direct.scss';

registerComponent(ChatMessage);

interface ChatDirectProps extends BaseProps {
  name: string;
  avatarUrl: string | null;
  messages: Message[];
  /** Состав чата и его существование меняет страница — виджет только просит */
  onAddUser?: (login: string) => Promise<void>;
  onRemoveUser?: (login: string) => Promise<void>;
  onDeleteChat?: () => Promise<void>;
}

interface ChatDirectRefs extends BaseRefs {
  userForm: HTMLElement;
  userLogin: HTMLInputElement;
  userError: HTMLElement;
}

/** Третье состояние меню пользователя: список или форма с логином */
type UserAction = 'add' | 'remove';

export class ChatDirect extends BaseBlock<ChatDirectProps, ChatDirectRefs> {
  static componentName = 'ChatDirect';
  protected template = template;

  private action: UserAction = 'add';

  private pending = false;

  private menus(): HTMLElement[] {
    return Array.from(this.element()?.querySelectorAll<HTMLElement>('.drop-menu') ?? []);
  }

  private setMenu(menu: HTMLElement, state: 'closed' | 'list' | 'user'): void {
    menu.classList.toggle('drop-menu--open', state === 'list');
    menu.classList.toggle('drop-menu--user', state === 'user');
    menu
      .querySelector('[data-action="toggle-menu"]')
      ?.setAttribute('aria-expanded', String(state !== 'closed'));
  }

  private closeMenus(except?: HTMLElement | null): void {
    for (const menu of this.menus()) {
      if (menu !== except) {
        this.setMenu(menu, 'closed');
      }
    }
  }

  private userMenu(): HTMLElement | null {
    return this.refs.userForm?.closest<HTMLElement>('.drop-menu') ?? null;
  }

  /** Форма логина: добавление и удаление отличаются только запросом, который уйдёт по ОК */
  private openUserForm(action: UserAction): void {
    const menu = this.userMenu();
    if (!menu) {
      return;
    }

    this.action = action;
    this.closeMenus(menu);
    this.setMenu(menu, 'user');
    this.refs.userLogin.value = '';
    this.clearError();
    this.refs.userLogin.focus();
  }

  private closeUserForm(): void {
    const menu = this.userMenu();
    if (menu) {
      this.setMenu(menu, 'closed');
    }
    this.clearError();
  }

  private setPending(pending: boolean): void {
    this.pending = pending;

    const button = this.refs.userForm.querySelector<HTMLButtonElement>('button[type="submit"]');
    if (button) {
      button.disabled = pending;
    }
  }

  private showError(error: unknown, state: 'list' | 'user'): void {
    const menu = this.userMenu();
    if (menu) {
      this.setMenu(menu, state);
    }

    this.refs.userError.textContent = errorMessage(error);
    this.refs.userError.hidden = false;
  }

  private clearError(): void {
    this.refs.userError.textContent = '';
    this.refs.userError.hidden = true;
  }

  private async changeUser(login: string): Promise<void> {
    if (this.pending || !login) {
      return;
    }

    this.clearError();
    this.setPending(true);

    try {
      const change = this.action === 'add' ? this.props.onAddUser : this.props.onRemoveUser;
      await change?.(login);
      this.closeUserForm();
    } catch (error) {
      this.showError(error, 'user');
    } finally {
      this.setPending(false);
    }
  }

  private async deleteChat(): Promise<void> {
    if (this.pending) {
      return;
    }

    this.clearError();
    this.setPending(true);

    try {
      await this.props.onDeleteChat?.();
    } catch (error) {
      this.showError(error, 'list');
    } finally {
      this.setPending(false);
    }
  }

  private readonly onDocumentClick = (event: Event): void => {
    const root = this.element();

    if (root && event.target instanceof Node && !root.contains(event.target)) {
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

      if (menu) {
        const opened = !menu.classList.contains('drop-menu--open');
        this.closeMenus(menu);
        this.setMenu(menu, opened ? 'list' : 'closed');
        return;
      }

      switch (target.closest<HTMLElement>('[data-action]')?.dataset.action) {
        case 'add-user':
          this.openUserForm('add');
          return;
        case 'remove-user':
          this.openUserForm('remove');
          return;
        case 'cancel-user':
          this.closeUserForm();
          return;
        case 'delete-chat':
          this.closeMenus();
          void this.deleteChat();
          return;
        default:
          // выбор пункта меню и клик по чату закрывают раскрытый список
          this.closeMenus();
      }
    },

    keydown: (event: Event) => {
      if (event instanceof KeyboardEvent && event.key === 'Escape') {
        this.closeMenus();
      }
    },

    submit: (e: Event) => {
      e.preventDefault();

      if (e.target === this.refs.userForm) {
        void this.changeUser(this.refs.userLogin.value.trim());
        return;
      }

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
