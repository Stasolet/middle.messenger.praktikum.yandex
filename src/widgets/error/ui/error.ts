import { BaseBlock, type BaseProps } from '../../../shared/ui';
import template from './error.hbs';
import './error.scss';

export interface ErrorProps extends BaseProps {
  code: number;
  message: string;
}

export class Error extends BaseBlock<ErrorProps> {
  static componentName = 'Error';
  protected template = template;
}
