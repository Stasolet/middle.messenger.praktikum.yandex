import { ChatItem } from '../../entities/chat';

import { ChatSearch } from '../../features/chat-search';
import { Sidebar, type SidebarProps } from '../../widgets/sidebar';
import { ChatDirect } from '../../widgets/chat-direct';

import { registerComponent } from '../../shared/lib';
import chatsMock from '../../../mocks/chats.json';
import chatMessagesMock from '../../../mocks/chat-messages.json';

import './chat.scss';
import '@fontsource-variable/material-symbols-outlined';

import { initHbs } from '../../shared/lib';
initHbs()


// const compiledSidebar = Handlebars.compile(sidebarTpl);
const sidebar = new Sidebar({chats: chatsMock})
const sidebarElement = sidebar.element()
if (sidebarElement){
  document.getElementById('chats-list')!.appendChild(sidebarElement)
}

const directMessagesContent = {
  name: chatsMock[0].name,
  avatarUrl: chatsMock[0].avatarUrl,
  messages: chatMessagesMock,
};
// Handlebars.registerPartial('chat-message', chatMessageTpl);
// const compiledChatDirect = Handlebars.compile(chatDirectTpl);
// document.getElementById('chat-direct')!.innerHTML = compiledChatDirect(directMessagesContent);
