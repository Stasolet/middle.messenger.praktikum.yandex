import { BaseBlock } from '../../../shared/ui/base/base';
import template from './chat-message.hbs';
import './chat-message.scss';

export default class ChatMessage extends BaseBlock {
  readonly componentName = 'ChatMessage';
  protected template = template;
}
