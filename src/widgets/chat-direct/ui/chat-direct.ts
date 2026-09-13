import { BaseBlock } from '../../../shared/ui/base/base';
import template from './chat-direct.hbs';
import './chat-direct.scss';

export default class ChatDirect extends BaseBlock {
  readonly componentName = 'ChatDirect';
  protected template = template;
}
