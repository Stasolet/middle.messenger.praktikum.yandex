import { BaseBlock, type BaseProps } from '../base/base';
import template from './input.hbs';
import './input.scss';

export interface InputProps extends BaseProps {
  name: string;
  type: 'text' | 'password' | 'email' | 'tel' | 'number';
  placeholder?: string;
  value?: string | number;
  enabled?: boolean;
}

export class Input extends BaseBlock<InputProps> {
  static componentName = 'Input';
  protected template = template;
  public onBlur?: () => void;
  public onInput?: () => void;
  protected events = {
    blur: () => this.onBlur?.(),
    input: () => this.onInput?.(),
  };

  constructor(props: InputProps) {
    super({
      ...props,
      enabled: props.enabled ?? true,
    });
  }

  getValue(): string {
    const element = this.element();
    return element instanceof HTMLInputElement ? element.value : '';
  }
}
