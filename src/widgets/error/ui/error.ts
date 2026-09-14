import { BaseBlock, type BlockOwnProps } from '../../../shared/ui';
import template from './error.hbs';
import './error.scss';

export interface ErrorProps extends BlockOwnProps {
  code: number;
  message: string;
}

export class Error extends BaseBlock<ErrorProps> {
  static componentName = 'Error';
  protected template = template;
}
