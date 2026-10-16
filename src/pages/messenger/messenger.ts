import '@fontsource-variable/material-symbols-outlined';

import { BaseBlock, type BaseRefs } from '../../shared/ui';
import { chatsService } from '../../entities/chat';
import { messagesService } from '../../entities/message';
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

      const sidebar = new Sidebar({ chats });
      const sidebarElement = sidebar.element();
      if (sidebarElement) {
        chatsList.replaceChildren(sidebarElement);
      }

      const firstChat = chats[0];
      if (!firstChat) {
        return;
      }

      const currentChat = new ChatDirect({
        name: firstChat.name,
        avatarUrl: firstChat.avatarUrl,
        messages: messagesService.getMessages(firstChat.id),
      });

      const currentChatElement = currentChat.element();
      if (currentChatElement) {
        chatDirect.replaceChildren(currentChatElement);
      }
    } catch (error) {
      this.props.navigation.navigate(errorRouteFor(error));
    }
  }
}
