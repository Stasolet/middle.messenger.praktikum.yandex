import { BaseBlock, type BaseProps } from '../../../shared/ui';
import template from './error.hbs';
import './error.scss';

export interface ErrorWidgetProps extends BaseProps {
  code: number;
  message: string;
}

export class ErrorWidget extends BaseBlock<ErrorWidgetProps> {
  static componentName = 'ErrorWidget';
  protected template = template;
}
