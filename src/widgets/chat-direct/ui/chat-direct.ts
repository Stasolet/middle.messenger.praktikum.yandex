import { collectFormValues, validations } from '../../../shared/lib';
import { errorMessage, type WsStatus } from '../../../shared/api';
import {
  ChatMessage,
  messagesService,
  type ChatConnection,
  type Message,
} from '../../../entities/message';
import { BaseBlock, type BaseProps, type BaseRefs } from '../../../shared/ui';
import template from './chat-direct.hbs';
import './chat-direct.scss';

interface ChatDirectProps extends BaseProps {
  name: string;
  avatarUrl: string | null;
  /** Сокат чата живёт вместе с виджетом: id нужны для токена и «моих» сообщений. */
  chatId: number;
  userId: number;
  /** Состав чата и его существование меняет страница — виджет только просит */
  onAddUser?: (login: string) => Promise<void>;
  onRemoveUser?: (login: string) => Promise<void>;
  onDeleteChat?: () => Promise<void>;
}

interface ChatDirectRefs extends BaseRefs {
  userForm: HTMLElement;
  userLogin: HTMLInputElement;
  userError: HTMLElement;
  messageInput: HTMLInputElement;
  messagesList: HTMLElement;
  typingError: HTMLElement;
}

/** Третье состояние меню пользователя: список или форма с логином */
type UserAction = 'add' | 'remove';

export class ChatDirect extends BaseBlock<ChatDirectProps, ChatDirectRefs> {
  static componentName = 'ChatDirect';
  protected template = template;

  private action: UserAction = 'add';

  private pending = false;

  private connection: ChatConnection | null = null;

  private connectionStatus: WsStatus = 'connecting';

  /** История ещё не развёрнута: живые сообщения копим в буфере, чтобы replaceChildren их не затёр. */
  private historyReady = false;

  /** История не пришла (таймаут): её объяснение не должен затирать поздний статус «open». */
  private historyFailed = false;

  private missedLive: Message[] = [];

  private scrollBottom(): void {
    const list = this.refs.messagesList;
    list.scrollTop = list.scrollHeight;
  }

  /** Пользователь у нижнего края: новые сообщения должны оставаться на виду. */
  private nearBottom(): boolean {
    const list = this.refs.messagesList;
    return list.scrollHeight - list.scrollTop - list.clientHeight < 80;
  }

  /** Лента меняется императивно: setProps() пересобрал бы DOM и украл фокус у поля ввода. */
  private appendMessage(message: Message): void {
    const stick = this.nearBottom();
    const element = new ChatMessage(message).element();

    if (element) {
      this.refs.messagesList.appendChild(element);

      // читающего историю не срываем в конец
      if (stick) {
        this.scrollBottom();
      }
    }
  }

  private renderMessages(messages: Message[]): void {
    const nodes = messages
      .map((message) => new ChatMessage(message).element())
      .filter((node): node is Element => node !== null);

    this.refs.messagesList.replaceChildren(...nodes);
    this.scrollBottom();
  }

  private handleStatus(status: WsStatus): void {
    this.connectionStatus = status;

    if (status === 'open') {
      if (!this.historyFailed) {
        this.clearTypingError();
      }
      return;
    }

    this.showTypingError(status === 'closed' ? 'Связь с чатом потеряна' : 'Подключение к чату…');
  }

  private openChat(): void {
    this.historyReady = false;
    this.historyFailed = false;
    this.missedLive = [];

    this.connection = messagesService.open(this.props.chatId, this.props.userId, {
      onMessage: (message) => this.onLiveMessage(message),
      onStatus: (status) => this.handleStatus(status),
    });

    void this.connection
      .getHistory()
      .then((messages) => {
        this.renderMessages(messages);
        this.flushMissed(messages);
      })
      .catch((error: unknown) => {
        this.historyFailed = true;
        // история так и не пришла, но лента дальше живая: буфер дорисовываем на пустое
        this.flushMissed([]);
        this.showTypingError(errorMessage(error));
      });
  }

  private onLiveMessage(message: Message): void {
    if (this.historyReady) {
      this.appendMessage(message);
      return;
    }

    // ответ истории пересоберёт ленту через replaceChildren: до него только копим
    this.missedLive.push(message);
  }

  /** После разворота истории дорисовываем пришедшее во время ожидания, без дублей по id. */
  private flushMissed(history: Message[]): void {
    this.historyReady = true;

    const seen = new Set(history.map((message) => message.id));
    for (const message of this.missedLive.splice(0)) {
      if (!seen.has(message.id)) {
        this.appendMessage(message);
      }
    }
  }

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

  private showTypingError(text: string): void {
    this.refs.typingError.textContent = text;
    this.refs.typingError.hidden = false;
  }

  private clearTypingError(): void {
    this.refs.typingError.textContent = '';
    this.refs.typingError.hidden = true;
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
    this.openChat();
  }

  protected componentWillUnmount(): void {
    document.removeEventListener('click', this.onDocumentClick);
    this.connection?.close();
    this.connection = null;
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

    input: (event: Event) => {
      if (event.target === this.refs.messageInput) {
        this.clearTypingError();
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
        this.showTypingError(error);
        return;
      }

      this.clearTypingError();

      if (!this.connection || this.connectionStatus === 'closed') {
        this.showTypingError('Нет соединения — сообщение не отправлено');
        return;
      }

      this.connection.send(values.message);
      form.reset();
    },
  };
}
