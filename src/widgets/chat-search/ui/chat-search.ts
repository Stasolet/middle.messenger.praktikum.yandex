import { BaseBlock } from '../../../shared/ui/base/base';
import template from './chat-search.hbs';
import './chat-search.scss';

export default class ChatSearch extends BaseBlock {
  readonly componentName = 'ChatSearch';
  protected template = template;
}
