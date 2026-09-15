import { BaseBlock, type BaseProps } from '../../../shared/ui';
import template from './chat-direct.hbs';
import './chat-direct.scss';

interface ChatDirectProps extends BaseProps{
}

export class ChatDirect extends BaseBlock {
  static componentName = 'ChatDirect';
  protected template = template;
}
