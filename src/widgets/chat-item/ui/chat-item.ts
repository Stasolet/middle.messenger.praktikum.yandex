import { BaseBlock } from '../../../shared/ui/base/base';
import template from './chat-item.hbs';
import './chat-item.scss';

export default class ChatItem extends BaseBlock {
  readonly componentName = 'ChatItem';
  protected template = template;
}
