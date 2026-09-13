import Handlebars from 'handlebars';
import chatItemTpl from '../../widgets/chat-item/ui/chat-item.hbs';
import chatSearchTpl from '../../widgets/chat-search/ui/chat-search.hbs';
import sidebarTpl from '../../widgets/sidebar/ui/sidebar.hbs';

import chatMessageTpl from '../../widgets/chat-message/ui/chat-message.hbs';
import chatDirectTpl from '../../widgets/chat-direct/ui/chat-direct.hbs';

import chatsMock from '../../../mocks/chats.json';
import chatMessagesMock from '../../../mocks/chat-messages.json';

import '../../widgets/chat-item/ui/chat-item.scss';
import '../../widgets/sidebar/ui/sidebar.scss';
import '../../widgets/chat-direct/ui/chat-direct.scss';
import '../../widgets/chat-message/ui/chat-message.scss';
import '../../widgets/chat-search/ui/chat-search.scss';
import './chat.scss';
import '@fontsource-variable/material-symbols-outlined';

import { eq } from '../../shared/lib/eq.ts';
import { date, time } from '../../shared/lib/datetime.ts';

Handlebars.registerHelper('eq', eq);
Handlebars.registerHelper('date_from_timestamp', date);
Handlebars.registerHelper('time_from_timestamp', time);

Handlebars.registerPartial('chat-item', chatItemTpl);
Handlebars.registerPartial('chat-search', chatSearchTpl);

const compiledSidebar = Handlebars.compile(sidebarTpl);
document.getElementById('chats-list')!.innerHTML = compiledSidebar({
  chats: chatsMock,
});

const directMessagesContent = {
  name: chatsMock[0].name,
  avatarUrl: chatsMock[0].avatarUrl,
  messages: chatMessagesMock,
};
Handlebars.registerPartial('chat-message', chatMessageTpl);
const compiledChatDirect = Handlebars.compile(chatDirectTpl);
document.getElementById('chat-direct')!.innerHTML = compiledChatDirect(directMessagesContent);
