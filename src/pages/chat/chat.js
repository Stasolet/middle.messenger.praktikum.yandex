import Handlebars from "handlebars";
import chatItemTpl from "../../components/chat-item/chat-item.hbs?raw";
import chatSearchTpl from "../../components/chat-search/chat-search.hbs?raw";
import sidebarTpl from "../../layouts/sidebar/sidebar.hbs?raw"
import chatsMock from "../../mocks/chats.json";

import "../../layouts/sidebar/sidebar.css"
import "./chat.css"

Handlebars.registerPartial("chat-item", chatItemTpl);
Handlebars.registerPartial("chat-search", chatSearchTpl);

const compiledSidebar = Handlebars.compile(sidebarTpl);
document.body.innerHTML = compiledSidebar({ chats: chatsMock });