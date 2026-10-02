import { Sidebar } from '../../widgets/sidebar';
import { ChatDirect } from '../../widgets/chat-direct';
import { chatsService } from '../../entities/chat';
import { messagesService } from '../../entities/message';

import './chat.scss';
import '@fontsource-variable/material-symbols-outlined';

import { initHbs } from '../../shared/lib';
initHbs();

const chats = chatsService.getChats();

const sidebar = new Sidebar({ chats });
const sidebarElement = sidebar.element();
if (sidebarElement) {
  document.getElementById('chats-list')!.appendChild(sidebarElement);
}

const currentChatInfo = chatsService.getChatById(chats[0].id);
if (currentChatInfo) {
  const currentChat = new ChatDirect({
    name: currentChatInfo.name,
    avatarUrl: currentChatInfo.avatarUrl,
    messages: messagesService.getMessages(currentChatInfo.id),
  });
  const currentChatElement = currentChat.element();
  if (currentChatElement) {
    document.getElementById('chat-direct')!.appendChild(currentChatElement);
  }
}
