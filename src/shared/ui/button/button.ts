import { BaseBlock, type BaseProps } from '../base/base';
import template from './button.hbs';
import './button.scss';

export interface ButtonProps extends BaseProps {
  text: string;
  type?: 'button' | 'submit' | 'reset';
  name?: string;
  ariaLabel?: string;
  disabled?: boolean;
}

export class Button extends BaseBlock<ButtonProps> {
  static componentName = 'Button';
  protected template = template;

  constructor(props: ButtonProps) {
    super({
      ...props,
      type: props.type ?? 'button',
    });
  }
}
