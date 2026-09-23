import { BaseBlock, type BaseProps } from '../../../shared/ui';
import template from './sidebar.hbs';
import './sidebar.scss';
import { type Chat } from '../../../entities/chat';
import { ChatSearch } from '../../../features/chat-search';
import { registerComponent } from '../../../shared/lib';
import { ChatItem } from '../../../entities/chat';

registerComponent(ChatSearch);
registerComponent(ChatItem);

export interface SidebarProps extends BaseProps {
  chats: Chat[];
}

export class Sidebar extends BaseBlock<SidebarProps> {
  static componentName = 'Sidebar';
  protected template = template;
}
