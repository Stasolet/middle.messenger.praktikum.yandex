import { BaseBlock } from '../../../shared/ui';
import template from './chat-search.hbs';
import './chat-search.scss';

export class ChatSearch extends BaseBlock {
  static componentName = 'ChatSearch';
  protected template = template;
}
