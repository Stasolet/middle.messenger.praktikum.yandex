import '@fontsource-variable/material-symbols-outlined';

import { BaseBlock, type BaseRefs } from '../../shared/ui';
import { chatsService } from '../../entities/chat';
import { messagesService } from '../../entities/message';
import { ChatDirect } from '../../widgets/chat-direct';
import { Sidebar } from '../../widgets/sidebar';
import type { PageProps } from '../../shared/router';
import template from './messenger.hbs';
import './messenger.scss';

interface MessengerRefs extends BaseRefs {
  chatsList: HTMLElement;
  chatDirect: HTMLElement;
}

export class MessengerPage extends BaseBlock<PageProps, MessengerRefs> {
  protected template = template;

  protected componentDidMount(): void {
    const chats = chatsService.getChats();

    const sidebar = new Sidebar({ chats });
    const sidebarElement = sidebar.element();
    if (sidebarElement) {
      this.refs.chatsList.appendChild(sidebarElement);
    }

    const firstChat = chats[0];
    if (!firstChat) {
      return;
    }

    const currentChatInfo = chatsService.getChatById(firstChat.id);
    if (currentChatInfo) {
      const currentChat = new ChatDirect({
        name: currentChatInfo.name,
        avatarUrl: currentChatInfo.avatarUrl,
        messages: messagesService.getMessages(currentChatInfo.id),
      });

      const currentChatElement = currentChat.element();
      if (currentChatElement) {
        this.refs.chatDirect.appendChild(currentChatElement);
      }
    }
  }
}
