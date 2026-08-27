import Handlebars from 'handlebars';
import chatItemTpl from '../../components/chat-item/chat-item.hbs?raw';
import chatSearchTpl from '../../components/chat-search/chat-search.hbs?raw';
import sidebarTpl from '../../layouts/sidebar/sidebar.hbs?raw';

import chatMessageTpl from '../../components/chat-message/chat-message.hbs?raw';
import chatDirectTpl from '../../layouts/chat-direct/chat-direct.hbs?raw';

import chatsMock from '../../mocks/chats.json';
import chatMessagesMock from '../../mocks/chat-messages.json';

import '../../components/chat-item/chat-item.scss';
import '../../layouts/sidebar/sidebar.scss';
import '../../layouts/chat-direct/chat-direct.scss';
import '../../components/chat-message/chat-message.scss';
import '../../components/chat-search/chat-search.scss';
import './chat.scss';
import '@fontsource-variable/material-symbols-outlined';

import { eq } from '../../helpers/eq';
import { date, time } from '../../helpers/datetime';

Handlebars.registerHelper('eq', eq);
Handlebars.registerHelper('date_from_timestamp', date);
Handlebars.registerHelper('time_from_timestamp', time);

Handlebars.registerPartial('chat-item', chatItemTpl);
Handlebars.registerPartial('chat-search', chatSearchTpl);

const compiledSidebar = Handlebars.compile(sidebarTpl);
document.getElementById('chats-list').innerHTML = compiledSidebar({
  chats: chatsMock,
});

const directMessagesContent = {
  name: chatsMock[0].name,
  avatarUrl: chatsMock[0].avatarUrl,
  messages: chatMessagesMock,
};
Handlebars.registerPartial('chat-message', chatMessageTpl);
const compiledChatDirect = Handlebars.compile(chatDirectTpl);
document.getElementById('chat-direct').innerHTML = compiledChatDirect(directMessagesContent);
