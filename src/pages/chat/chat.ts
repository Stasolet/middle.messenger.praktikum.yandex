import { Sidebar } from '../../widgets/sidebar';
import { ChatDirect } from '../../widgets/chat-direct';

import chatsMock from '../../../mocks/chats.json';
import chatMessagesMock from '../../../mocks/chat-messages.json';

import './chat.scss';
import '@fontsource-variable/material-symbols-outlined';

import { initHbs } from '../../shared/lib';
initHbs();

const sidebar = new Sidebar({ chats: chatsMock });
const sidebarElement = sidebar.element();
if (sidebarElement) {
  document.getElementById('chats-list')!.appendChild(sidebarElement);
}

const directMessagesContent = {
  name: chatsMock[0].name,
  avatarUrl: chatsMock[0].avatarUrl,
  messages: chatMessagesMock,
};
const currentChat = new ChatDirect(directMessagesContent);
const currentChatElement = currentChat.element();
if (currentChatElement) {
  document.getElementById('chat-direct')!.appendChild(currentChatElement);
}
// Handlebars.registerPartial('chat-message', chatMessageTpl);
// const compiledChatDirect = Handlebars.compile(chatDirectTpl);
