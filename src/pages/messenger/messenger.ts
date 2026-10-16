import '@fontsource-variable/material-symbols-outlined';

import { BaseBlock, type BaseRefs } from '../../shared/ui';
import { chatsService, type Chat } from '../../entities/chat';
import { messagesService } from '../../entities/message';
import { userService } from '../../entities/user';
import { ChatDirect } from '../../widgets/chat-direct';
import { Sidebar } from '../../widgets/sidebar';
import { errorRouteFor, type PageProps } from '../../shared/router';
import template from './messenger.hbs';
import './messenger.scss';

interface MessengerRefs extends BaseRefs {
  chatsList: HTMLElement;
  chatDirect: HTMLElement;
}

export class MessengerPage extends BaseBlock<PageProps, MessengerRefs> {
  protected template = template;

  protected componentDidMount(): void {
    void this.renderChats();
  }

  private async renderChats(): Promise<void> {
    const { chatsList, chatDirect } = this.refs;
    chatsList.textContent = 'Загрузка чатов…';

    try {
      const chats = await chatsService.getChats();
      const current = this.currentChat(chats);

      const sidebar = new Sidebar({
        chats,
        activeChatId: current?.id ?? null,
        onCreateChat: (title) => this.createChat(title),
      });

      const sidebarElement = sidebar.element();
      if (sidebarElement) {
        chatsList.replaceChildren(sidebarElement);
      }

      this.renderChat(chatDirect, current);
    } catch (error) {
      this.props.navigation.navigate(errorRouteFor(error));
    }
  }

  /** Без id в URL открывается первый чат — список сам по себе ничего не выбирает */
  private currentChat(chats: Chat[]): Chat | null {
    const chatId = Number(this.props.params.chatId);

    return chats.find((chat) => chat.id === chatId) ?? chats[0] ?? null;
  }

  private renderChat(container: HTMLElement, chat: Chat | null): void {
    if (!chat) {
      const empty = document.createElement('p');
      empty.className = 'chat-window__empty';
      empty.textContent = 'Чатов нет — создайте первый.';
      container.replaceChildren(empty);

      return;
    }

    const direct = new ChatDirect({
      name: chat.name,
      avatarUrl: chat.avatarUrl,
      messages: messagesService.getMessages(chat.id),
      onAddUser: (login) => this.changeUser(chat.id, login, 'add'),
      onRemoveUser: (login) => this.changeUser(chat.id, login, 'remove'),
      onDeleteChat: () => this.deleteChat(chat.id),
    });

    const directElement = direct.element();
    if (directElement) {
      container.replaceChildren(directElement);
    }
  }

  /** Новый чат открывается сразу: ответ создания даёт id, остальное придёт со списком */
  private async createChat(title: string): Promise<void> {
    const chatId = await chatsService.createChat(title);
    this.props.navigation.navigate(`/messenger/${chatId}`);
  }

  private async deleteChat(chatId: number): Promise<void> {
    await chatsService.removeChat(chatId);
    this.props.navigation.navigate('/messenger');
  }

  private async changeUser(chatId: number, login: string, action: 'add' | 'remove'): Promise<void> {
    const found = await userService.search(login);
    const user = found.find((candidate) => candidate.login === login);

    if (!user) {
      throw new Error(`Пользователь с логином ${login} не найден`);
    }

    if (action === 'add') {
      await chatsService.addUsers(chatId, [user.id]);
      return;
    }

    await chatsService.removeUsers(chatId, [user.id]);
  }
}
