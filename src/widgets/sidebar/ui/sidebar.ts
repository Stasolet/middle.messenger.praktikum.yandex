import { BaseBlock, type BaseProps, type BaseRefs } from '../../../shared/ui';
import { errorMessage } from '../../../shared/api';
import { registerComponent } from '../../../shared/lib';
import { ChatItem, type Chat } from '../../../entities/chat';
import { ChatSearch } from '../../../features/chat-search';
import template from './sidebar.hbs';
import './sidebar.scss';

registerComponent(ChatSearch);
registerComponent(ChatItem);

export interface SidebarProps extends BaseProps {
  chats: Chat[];
  /** Открытый чат выделяется в списке */
  activeChatId: number | null;
  /** Создание чата делает страница: список после ответа перечитывается отсюда же */
  onCreateChat: (title: string) => Promise<void>;
}

interface SidebarRefs extends BaseRefs {
  search: HTMLElement;
  chatItems: HTMLElement;
  empty: HTMLElement;
  error: HTMLElement;
  newChatForm: HTMLElement;
  newChatInput: HTMLInputElement;
}

export class Sidebar extends BaseBlock<SidebarProps, SidebarRefs> {
  static componentName = 'Sidebar';
  protected template = template;

  private creating = false;

  private pending = false;

  private filter(term: string): void {
    const needle = term.trim().toLowerCase();
    let visible = 0;

    for (const item of Array.from(this.refs.chatItems.querySelectorAll<HTMLElement>('li'))) {
      const match = !needle || (item.dataset.name ?? '').toLowerCase().includes(needle);
      item.hidden = !match;

      if (match) {
        visible += 1;
      }
    }

    this.refs.empty.hidden = visible > 0;
  }

  private setCreating(creating: boolean): void {
    this.creating = creating;
    this.refs.newChatForm.hidden = !creating;
    this.refs.newChatInput.value = '';
    this.clearError();

    if (creating) {
      this.refs.newChatInput.focus();
    }
  }

  private setPending(pending: boolean): void {
    this.pending = pending;

    const button = this.refs.newChatForm.querySelector<HTMLButtonElement>('button[type="submit"]');
    if (button) {
      button.disabled = pending;
    }
  }

  private showError(error: unknown): void {
    this.refs.error.textContent = errorMessage(error);
    this.refs.error.hidden = false;
  }

  private clearError(): void {
    this.refs.error.textContent = '';
    this.refs.error.hidden = true;
  }

  protected events = {
    input: (e: Event) => {
      const target = e.target;

      if (target instanceof HTMLInputElement && this.refs.search.contains(target)) {
        this.filter(target.value);
      }
    },

    click: (e: Event) => {
      const target = e.target;
      if (!(target instanceof Element)) {
        return;
      }

      if (target.closest('[data-action="new-chat"]')) {
        this.setCreating(!this.creating);
      }

      if (target.closest('[data-action="cancel-new-chat"]')) {
        this.setCreating(false);
      }
    },

    submit: (e: Event) => {
      // Enter в поле поиска не должен перезагружать страницу
      e.preventDefault();

      const form = e.target;
      if (form !== this.refs.newChatForm || this.pending) {
        return;
      }

      const title = this.refs.newChatInput.value.trim();
      if (!title) {
        return;
      }

      this.clearError();
      this.setPending(true);
      Promise.resolve(this.props.onCreateChat(title))
        .then(() => this.setCreating(false))
        .catch((error: unknown) => this.showError(error))
        .finally(() => this.setPending(false));
    },
  };
}
